import logging

from babel.numbers import format_percent
from django.utils import timezone
from openpyxl.utils import get_column_letter
from django.utils.translation import to_locale, get_language

from indicator.models import Disaggregation
from indicator.utilities import format_total_value_to_string
from unicef.exports.annex_c_excel import ProgressReportsXLSXExporter
from unicef.exports.progress_reports import ProgressReportDetailPDFExporter
from unicef.exports.utilities import HTMLTableCell, HTMLTableHeader

logger = logging.getLogger(__name__)


class ReportableListXLSXExporter(ProgressReportsXLSXExporter):

    include_disaggregations = True
    export_to_single_sheet = True

    def __init__(self, reportables, **kwargs):
        self.reportables = reportables
        super(ReportableListXLSXExporter, self).__init__([], **kwargs)
        self.display_name = '[{:%a %-d %b %-H-%M-%S %Y}] Indicators Export.xlsx'.format(
            timezone.now()
        )

    def get_disaggregations(self, *args):
        return Disaggregation.objects.filter(
            reportable__in=self.reportables
        ).distinct()

    def write_reportables_to_current_sheet(self, reportables):
        current_row = self.write_header_to_current_sheet()

        disaggregation_column_map = self.write_disaggregation_headers_get_column_map()

        for reportable in reportables:
            reports = reportable.indicator_reports.order_by('-time_period_start')[:2]

            current_row = self.write_indicator_reports_to_current_sheet(
                current_row, reports, disaggregation_column_map
            )

        for column, width in enumerate(self.column_widths):
            column += 1
            self.current_sheet.column_dimensions[get_column_letter(column)].width = width

    def fill_workbook(self):
        reportables = self.reportables.prefetch_related(
            'indicator_reports'
        )
        if self.export_to_single_sheet:
            self.current_sheet.title = 'Indicators Export'
            self.write_reportables_to_current_sheet(reportables)
        else:
            for reportable in reportables:
                if not self.current_sheet.max_row == 1:
                    self.current_sheet = self.workbook.create_sheet()
                self.current_sheet.title = str(reportable)
                self.write_reportables_to_current_sheet([reportable])

        self.workbook.save(self.file_path)


class ReportableListPDFExporter(ProgressReportDetailPDFExporter):

    template_name = 'reportable_list_pdf_export.html'

    def __init__(self, reportables):
        self.reportables = reportables
        self.display_name = '[{:%a %-d %b %-H-%M-%S %Y}] List of Indicators'.format(
            timezone.now()
        )
        self.file_name = self.display_name + '.pdf'
        self.locale = to_locale(get_language())

    def get_reportable_header_table(self, reportable):
        return [
            [
                HTMLTableHeader(reportable.blueprint.title, colspan=3, klass='section'),
            ],
            [
                HTMLTableHeader('Calculation method'),
                HTMLTableCell(reportable.blueprint.display_type, colspan=2),
            ],
            [
                HTMLTableHeader('Baseline'),
                HTMLTableCell(reportable.baseline, colspan=2),
            ],
            [
                HTMLTableHeader('Target'),
                HTMLTableCell(reportable.target, colspan=2),
            ],
            [
                HTMLTableHeader('Current Progress'),
                HTMLTableCell(format_percent(reportable.progress_percentage, locale=self.locale), colspan=2),
            ],
        ]

    def get_current_previous_location_data_table(self, current_data):
        previous_data = current_data.previous_location_data
        current_location_progress = format_total_value_to_string(
            current_data.disaggregation.get('()'),
            is_percentage=current_data.indicator_report.is_percentage
        )
        previous_location_progress = format_total_value_to_string(
            previous_data.disaggregation.get('()'),
            is_percentage=previous_data.indicator_report.is_percentage
        ) if previous_data else ''

        previous_time_period = previous_data.indicator_report.display_time_period if previous_data else ''
        previous_submission_date = previous_data.indicator_report.submission_date if previous_data else ''

        return [
            [
                HTMLTableHeader(current_data.location.title, colspan=3, klass='subsection'),
            ],
            [
                HTMLTableHeader('Reporting period'),
                HTMLTableHeader('Current {}'.format(current_data.indicator_report.display_time_period)),
                HTMLTableHeader('Previous {}'.format(previous_time_period)),
            ],
            [
                HTMLTableHeader('Total Progress'),
                HTMLTableCell(current_location_progress),
                HTMLTableCell(previous_location_progress),
            ],
            [
                HTMLTableHeader('Report submitted'),
                HTMLTableCell(current_data.indicator_report.submission_date),
                HTMLTableCell(previous_submission_date),
            ],
        ]

    def get_context(self):
        section_list = []

        for reportable in self.reportables:
            tables = [
                self.get_reportable_header_table(reportable)
            ]

            current_indicator_report = reportable.indicator_reports.order_by('-time_period_start').first()

            if not current_indicator_report:
                continue

            for location_data in current_indicator_report.indicator_location_data.all():
                tables.append(self.get_current_previous_location_data_table(
                    location_data
                ))

            section_data = {
                'tables': tables
            }

            section_list.append(section_data)

        context = {
            'title': self.display_name,
            'sections': section_list
        }

        return context
