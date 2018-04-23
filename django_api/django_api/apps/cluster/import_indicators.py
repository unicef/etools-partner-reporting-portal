# -*- coding: utf-8 -*-

from openpyxl.reader.excel import load_workbook

from indicator.models import IndicatorLocationData

COLUMN_HASH_ID = 4
MAX_COLUMNS = 1000

class IndicatorsXLSXReader(object):

    def __init__(self, path):
        self.wb = load_workbook(path)
        self.sheet = self.wb.active

    def import_data(self):

        # Find "Location ID" column
        location_column_id = None
        for column in range(1, MAX_COLUMNS):
            if self.sheet.cell(row=COLUMN_HASH_ID, column=column).value == "#loc+id":
                location_column_id = column
                break

        # Find "Total" column
        total_column_id = None
        for column in range(1, MAX_COLUMNS):
            if self.sheet.cell(row=1, column=column).value == "Total":
                total_column_id = column
                break

        # Find first Disaggregation Value column
        dis_data_column_start_id = None
        for column in range(1, MAX_COLUMNS):
            if "#indicator+value" in self.sheet.cell(row=COLUMN_HASH_ID, column=column).value:
                dis_data_column_start_id = column
                break

        result = list()

        # Iterate over rows and save disaggregation values
        for row in range(COLUMN_HASH_ID + 1, self.sheet.max_row):
            # If row is empty, end of sheet
            if not self.sheet.cell(row=row, column=1).value:
                break

            # Get IndicatorLocationData ID
            indicator = IndicatorLocationData.objects.get(pk=self.sheet.cell(row=row, column=location_column_id).value)
            data = indicator.disaggregation
            # Prepare
            for column in range(dis_data_column_start_id, total_column_id + 1):
                value = self.sheet.cell(row=row, column=column).value
                # Check if value is present in cell
                if value:
                    # Evaluate ID of Disaggregation Type
                    dis_type_id = "()"
                    dis_type_value = self.sheet.cell(row=2, column=column).value
                    if dis_type_value:
                        dis_type_value = sorted(list(map(int, str(dis_type_value).split(","))), key=int)
                        dis_type_id = str(tuple(dis_type_value))

                    # Update values
                    data[dis_type_id]["c"] = value
                    data[dis_type_id]["v"] = value
            indicator.disaggregation = data
            indicator.save()

        return result
