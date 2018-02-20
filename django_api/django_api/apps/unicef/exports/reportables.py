from django.utils import timezone
from openpyxl.utils import get_column_letter

from indicator.models import Disaggregation
from unicef.exports.annex_c_excel import ProgressReportsXLSXExporter


class ReportableListXLSXExporter(ProgressReportsXLSXExporter):

    include_disaggregations = True

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
            current_row = self.write_indicator_reports_to_current_sheet(
                current_row, reportable.indicator_reports.all(), disaggregation_column_map
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
