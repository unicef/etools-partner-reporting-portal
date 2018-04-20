# -*- coding: utf-8 -*-

from openpyxl.reader.excel import load_workbook


class IndicatorsXLSXReader(object):

    def __init__(self, path):
        self.wb = load_workbook(path)
        self.sheet = self.wb.active

    def import_data(self):
        return self.sheet.cell('A1').value
