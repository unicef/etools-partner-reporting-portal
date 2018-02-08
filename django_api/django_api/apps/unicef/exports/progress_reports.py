import logging

from django.http import HttpResponse
from easy_pdf.exceptions import PDFRenderingError
from easy_pdf.rendering import render_to_pdf, make_response

from indicator.models import IndicatorBlueprint
from indicator.utilities import format_total_value_to_string
from unicef.exports.utilities import group_indicator_reports_by_lower_level_output, HTMLTableCell, HTMLTableHeader

logger = logging.getLogger(__name__)


class ProgressReportDetailPDFExporter:

    template_name = 'progress_report_detail_pdf_export.html'

    def __init__(self, progress_report):
        self.progress_report = progress_report
        self.display_name = '[{}] {} Progress Summary'.format(
            progress_report.get_reporting_period(), progress_report.programme_document.title
        )
        self.file_name = self.display_name + '.pdf'

    def format_indicator_reports(self, indicator_reports):
        output = []

        grouped_indicators = group_indicator_reports_by_lower_level_output(indicator_reports)

        for indicators in grouped_indicators:
            tables = list()

            tables.append([
                [
                    HTMLTableHeader(indicators[0].reportable.content_object.title, colspan=2, klass='section'),
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
                total_cumulative_progress = format_total_value_to_string(
                    indicator.reportable.total,
                    is_percentage=indicator.reportable.blueprint.unit == IndicatorBlueprint.PERCENTAGE
                )
                achievement_in_reporting_period = format_total_value_to_string(
                    indicator.total, is_percentage=indicator.is_percentage
                )

                indicator_table = [
                    [
                        HTMLTableCell(indicator.reportable.blueprint.title, rowspan=2, colspan=2),
                        HTMLTableHeader('Target'),
                        HTMLTableCell(indicator.reportable.target),
                    ],
                    [
                        HTMLTableHeader('Total cumulative progress'),
                        HTMLTableCell(total_cumulative_progress),
                    ],
                    [
                        HTMLTableHeader('Calculation method'),
                        HTMLTableCell(indicator.reportable.blueprint.display_type),
                        HTMLTableHeader('Achievement in reporting period'),
                        HTMLTableCell(achievement_in_reporting_period),
                    ],
                ]

                tables.append(indicator_table)

            output.append({
                'tables': tables
            })

        return output

    def get_context(self):
        pd = self.progress_report.programme_document

        context = {
            'progress_report': self.progress_report,
            'title': self.display_name,
            'programme_document': pd,
            'authorized_officer': pd.unicef_officers.first(),
            'focal_point': pd.unicef_focal_point.first(),
            'sections': self.format_indicator_reports(self.progress_report.indicator_reports.all())
        }

        return context

    def get_as_response(self):
        try:
            pdf = render_to_pdf(self.template_name, self.get_context())
            response = make_response(pdf)
            response['Content-disposition'] = 'inline; filename="{}"'.format(self.file_name)
            return response
        except PDFRenderingError:
            error_message = 'Error trying to render PDF'
            logger.exception(error_message)
            return HttpResponse(error_message)
