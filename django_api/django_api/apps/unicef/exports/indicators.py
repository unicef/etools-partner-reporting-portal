from django.utils import timezone

from indicator.models import Disaggregation
from unicef.exports.annex_c_excel import ProgressReportsXLSXExporter


class IndicatorListXLSXExporter(ProgressReportsXLSXExporter):

    include_disaggregations = True

    def __init__(self, indicator_reports, **kwargs):
        self.indicator_reports = indicator_reports
        super(IndicatorListXLSXExporter, self).__init__([], **kwargs)
        self.display_name = '[{:%a %-d %b %-H-%M-%S %Y}] Indicators Export.xlsx'.format(
            timezone.now()
        )

    def get_disaggregations(self, *args):
        return Disaggregation.objects.filter(
            reportable__indicator_reports__in=self.indicator_reports
        ).distinct()

    def fill_workbook(self):
        indicator_reports = self.indicator_reports.select_related(
            'progress_report'
        )

        self.current_sheet.title = 'Indicators Export'
        current_row = self.write_header_to_current_sheet()
        disaggregation_column_map = self.write_disaggregation_headers_get_column_map()
        self.write_indicator_reports_to_current_sheet(current_row, indicator_reports, disaggregation_column_map)

        self.workbook.save(self.file_path)
