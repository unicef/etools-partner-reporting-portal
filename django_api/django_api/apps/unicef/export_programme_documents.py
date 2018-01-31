import hashlib
import os
import tempfile

from django.utils import timezone
from openpyxl import Workbook
from openpyxl.styles import NamedStyle, Font, Alignment, PatternFill
from openpyxl.styles.numbers import FORMAT_CURRENCY_USD, FORMAT_PERCENTAGE
from openpyxl.utils import get_column_letter


class ProgrammeDocumentsXLSXExporter:

    def __init__(self, programme_documents):
        self.programme_documents = programme_documents
        filename = hashlib.sha256(';'.join([str(p.pk) for p in programme_documents]).encode('utf-8')).hexdigest()
        self.file_path = os.path.join(tempfile.gettempdir(), filename + '.xlsx')
        self.workbook = Workbook()
        self.worksheet = self.workbook.get_active_sheet()
        self.display_name = '[{:%a %-d %b %-H-%M-%S %Y}] {} Programme Document(s) Summary.xlsx'.format(
            timezone.now(), programme_documents.count()
        )

        self.header_style = NamedStyle(name="header")
        self.header_style.font = Font(bold=True, color='FFFFFF')
        self.header_style.fill = PatternFill("solid", fgColor="3195EE")
        self.header_style.alignment = Alignment(horizontal='center', vertical='justify')

    def fill_worksheet(self):
        self.worksheet.title = 'Programme Document(s) Summary'
        headers = [
            'PD/SSFA ToR ref. #',
            'PD/SSFA status',
            'Start date',
            'End date',
            'CSO contribution',
            'UNICEF cash',
            'UNICEF supplies',
            'Planned Budget',
            'Cash Transfers to Date ($)',
            'Cash Transfers to Date (%)',
        ]

        current_row = 1

        for column, header_text in enumerate(headers):
            column += 1  # columns are not 0-indexed...
            cell = self.worksheet.cell(row=current_row, column=column, value=header_text)
            cell.style = self.header_style
            self.worksheet.column_dimensions[get_column_letter(column)].width = len(header_text) + 5
        current_row += 1

        for programme_document in self.programme_documents:
            if programme_document.budget:
                funds_received_to_date_percentage = programme_document.funds_received_to_date / \
                                                    programme_document.budget
            else:
                funds_received_to_date_percentage = 0

            data_row = [
                (programme_document.title, None),
                (programme_document.get_status_display(), None),
                (programme_document.start_date, None),
                (programme_document.end_date, None),
                (programme_document.cso_contribution, FORMAT_CURRENCY_USD),
                (programme_document.total_unicef_cash, FORMAT_CURRENCY_USD),
                (programme_document.in_kind_amount, FORMAT_CURRENCY_USD),
                (programme_document.budget, FORMAT_CURRENCY_USD),
                (programme_document.funds_received_to_date, FORMAT_CURRENCY_USD),
                (funds_received_to_date_percentage, FORMAT_PERCENTAGE),
            ]

            for column, (cell_data, cell_format) in enumerate(data_row):
                column += 1  # columns are not 0-indexed...
                cell = self.worksheet.cell(row=current_row, column=column, value=cell_data)
                if cell_format:
                    cell.number_format = cell_format
            current_row += 1

        self.workbook.save(self.file_path)

    def cleanup(self):
        os.remove(self.file_path)
