import logging

from django.http import HttpResponse
from django.utils import timezone

from etools_prp.apps.indicator.models import IndicatorBlueprint
from etools_prp.apps.indicator.utilities import format_total_value_to_string
from etools_prp.apps.unicef.exports.utilities import (
    group_indicator_reports_by_lower_level_output,
    HTMLTableCell,
    HTMLTableHeader,
)
from etools_prp.apps.unicef.utils import render_pdf_to_response

logger = logging.getLogger(__name__)


# TODO: Profiling + optimize, currently takes upwards of 10s to generate the export
class ProgressReportDetailPDFExporter:

    template_name = 'progress_report_detail_pdf_export'

    def __init__(self, progress_report):
        self.progress_report = progress_report
        self.display_name = '[{}] {} Progress Summary'.format(
            progress_report.get_reporting_period(), progress_report.programme_document.title
        )
        self.file_name = self.display_name + '.pdf'

    def create_tables_for_indicator_reports(self, indicator_reports):
        grouped_indicators = group_indicator_reports_by_lower_level_output(indicator_reports)

        tables = list()
        for indicators in grouped_indicators:
            tables.append([
                [
                    HTMLTableHeader(
                        'PD Output: {}'.format(indicators[0].reportable.content_object.title),
                        colspan=2, klass='section'
                    ),
                ],
                [
                    HTMLTableHeader('Overall Status'),
                    HTMLTableCell(indicators[0].get_overall_status_display(), klass=indicators[0].overall_status),
                ],
                [
                    HTMLTableHeader('Narrative assessment'),
                    HTMLTableCell(indicators[0].narrative_assessment),
                ],
            ])

            for indicator in indicators:
                is_percentage = indicator.reportable.blueprint.unit == IndicatorBlueprint.PERCENTAGE

                calculated_target = format_total_value_to_string(
                    indicator.reportable.target,
                    is_percentage=is_percentage,
                    percentage_display_type="ratio" if indicator.reportable.blueprint.display_type == 'ratio' else None
                )
                total_cumulative_progress = format_total_value_to_string(
                    indicator.reportable.total,
                    is_percentage=is_percentage,
                    percentage_display_type="ratio" if indicator.reportable.blueprint.display_type == 'ratio' else None
                )
                achievement_in_reporting_period = format_total_value_to_string(
                    indicator.total,
                    is_percentage=is_percentage,
                    percentage_display_type="ratio" if indicator.reportable.blueprint.display_type == 'ratio' else None
                )

                indicator_table = [
                    [
                        HTMLTableCell(indicator.reportable.blueprint.title, rowspan=2, colspan=2),
                        HTMLTableHeader('Target'),
                        HTMLTableCell(calculated_target),
                    ],
                    [
                        HTMLTableHeader('Total cumulative progress'),
                        HTMLTableCell(total_cumulative_progress),
                    ],
                    [
                        HTMLTableHeader('Calculation method across locations'),
                        HTMLTableCell(indicator.reportable.blueprint.calculation_formula_across_locations),
                        HTMLTableHeader('Achievement in reporting period'),
                        HTMLTableCell(achievement_in_reporting_period),
                    ],
                ]
                tables.append(indicator_table)

                inactive_location_ids = set()
                if hasattr(indicator.reportable, 'inactive_location_goals'):
                    inactive_location_ids = {goal.location_id for goal in indicator.reportable.inactive_location_goals}

                previous_location_data_map = {}
                if hasattr(indicator.reportable, 'indicator_reports'):
                    all_reports = list(indicator.reportable.indicator_reports.all())

                    for ir in all_reports:
                        if ir.id != indicator.id and ir.time_period_start < indicator.time_period_start:
                            for prev_loc_data in ir.indicator_location_data.all():
                                previous_location_data_map[prev_loc_data.location_id] = prev_loc_data
                            break

                for location_data in indicator.indicator_location_data.all():

                    if location_data.location_id in inactive_location_ids:
                        continue

                    location_progress = format_total_value_to_string(
                        location_data.disaggregation.get('()'),
                        is_percentage=is_percentage,
                        percentage_display_type="ratio" if indicator.reportable.blueprint.display_type == 'ratio' else None
                    )

                    prev_loc_data = previous_location_data_map.get(location_data.location_id)
                    if prev_loc_data:
                        prev_value = prev_loc_data.disaggregation.get('()', {})
                    else:
                        prev_value = {}
                    previous_location_progress = format_total_value_to_string(
                        prev_value,
                        is_percentage=is_percentage,
                        percentage_display_type="ratio" if indicator.reportable.blueprint.display_type == 'ratio' else None
                    )

                    location_table = [
                        [
                            HTMLTableCell(location_data.location.name, rowspan=2, colspan=2),
                            HTMLTableHeader('Previous Location Progress'),
                            HTMLTableCell(previous_location_progress),
                        ],
                        [
                            HTMLTableHeader('Location Progress'),
                            HTMLTableCell(location_progress),
                        ],
                    ]

                    tables.append(location_table)

        return tables

    def get_context(self):
        funds_received_to_date_percentage = "%.2f" % (
            self.progress_report.programme_document.funds_received_to_date_percentage
        ) if self.progress_report.programme_document and self.progress_report.programme_document.budget > 0 else 0

        context = {
            'progress_report': self.progress_report,
            'pd': self.progress_report.programme_document,
            'title': self.display_name,
            'tables': self.create_tables_for_indicator_reports(self.progress_report.indicator_reports.all()),
            'funds_received_to_date_percentage': funds_received_to_date_percentage,
        }

        return context

    def get_as_response(self, request):
        """
        Generate PDF export. Supports multiple PDF engines via query parameter.

        Query parameters:
        - pdf_engine=weasyprint (default) - WeasyPrint (HTML/CSS)
        - pdf_engine=reportlab - ReportLab/platypus (direct PDF, fastest)
        """
        pdf_engine = request.GET.get('pdf_engine', 'weasyprint').lower()
        context = self.get_context()

        try:
            if pdf_engine == 'reportlab':
                logger.info("Using PDF Reports library (ReportLab/platypus) for PDF generation")
                from etools_prp.apps.pdf_reports.reports import IndicatorsReport
                report = IndicatorsReport(context, filename=self.file_name)
                response = report.build_response()
            else:
                logger.info("Using WeasyPrint engine for PDF generation")
                response = render_pdf_to_response(
                    request,
                    self.template_name,
                    context,
                )
            return response
        except Exception as exc:
            error_message = 'Error trying to render PDF'
            logger.exception(exc)
            return HttpResponse(error_message)


class ProgressReportListPDFExporter(ProgressReportDetailPDFExporter):

    template_name = 'progress_report_list_pdf_export'

    def __init__(self, progress_reports):
        self.progress_reports = progress_reports or []
        self._progress_reports_list = None
        self._count = None

        super().__init__(progress_reports.first())

        self.display_name = '[{:%a %-d %b %-H-%M-%S %Y}] {} Progress Reports Summary'.format(
            timezone.now(), len(self._get_progress_reports_list())
        )
        self.file_name = self.display_name + '.pdf'

    def _get_progress_reports_list(self):
        if self._progress_reports_list is None:
            self._progress_reports_list = list(self.progress_reports)
        return self._progress_reports_list

    def get_context(self):
        section_list = []
        progress_reports_list = self._get_progress_reports_list()

        if progress_reports_list:
            first_pd_id = progress_reports_list[0].programme_document_id
            same_pd_across_all_reports = all(
                pr.programme_document_id == first_pd_id for pr in progress_reports_list
            )
        else:
            same_pd_across_all_reports = True

        context = {
            'same_pd_across_all_reports': same_pd_across_all_reports,
        }

        for progress_report in progress_reports_list:
            section_data = {
                'progress_report': progress_report,
                'tables': self.create_tables_for_indicator_reports(progress_report.indicator_reports.all())
            }

            section_list.append(section_data)

        context['sections'] = section_list

        return context
