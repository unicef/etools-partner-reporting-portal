from openpyxl.reader.excel import load_workbook

from django.conf import settings

PATH = settings.BASE_DIR + "/apps/cluster/templates/excel/export.xlsx"
SAVE_PATH = settings.MEDIA_ROOT + '/'

class XLSXWriter:
    def __init__(self, indicators):

        self.wb = load_workbook(PATH)
        self.sheet = self.wb.get_active_sheet()
        self.indicators = indicators

    def export_data(self):

        row_id = 4

        for indicator in self.indicators:

            self.sheet.cell(row=row_id, column=1).value = indicator.reportable.cluster_objectives.first().cluster.title if indicator.reportable.cluster_objectives.first() else ""
            # self.sheet.cell(row=row_id, column=1).value = ""

            self.sheet.cell(row=row_id, column=16).value = indicator.time_period_start
            self.sheet.cell(row=row_id, column=17).value = indicator.time_period_end


            row_id += 1

        filepath = SAVE_PATH + 'export.xlsx'
        self.wb.save(filepath)
        return filepath