import tempfile

import os

from django.http import HttpResponse
from openpyxl import Workbook
from openpyxl.reader.excel import load_workbook
from openpyxl.styles import Font, Alignment, NamedStyle
from openpyxl.styles.numbers import FORMAT_CURRENCY_USD
from openpyxl.utils import get_column_letter

from django.conf import settings
from django.db.models import Count
import hashlib
from django.utils import timezone

import itertools

from indicator.models import Disaggregation, DisaggregationValue
from unicef.exports import programme_documents
from unicef.exports.utilities import PARTNER_PORTAL_DATE_FORMAT_EXCEL

DISAGGREGATION_COLUMN_START = 44
INDICATOR_DATA_ROW_START = 5
MAXIMUM_DISAGGREGATIONS_PER_INDICATOR = 3


class AnnexCXLSXExporter:

    include_disaggregation = False

    general_info_headers = [
        'Partner Name',
        'Country',
        'PD Reference Number',
        'PD Title',
        'PD Reporting Period',
        'PD Report Status',
        'PD Report Due Date',
        'PD Report Submission Date',
        'Partner contribution to date',
        'Funds received to date',
        'Challenges/bottlenecks in the reporting period',
        'Proposed way forward',
        'Submitted by',
        'Attachment',
    ]

    column_widths = []

    def __init__(self, progress_reports, include_disaggregation=None, analysis=False):
        self.progress_reports = progress_reports
        filename = hashlib.sha256(';'.join([str(pr.pk) for pr in progress_reports]).encode('utf-8')).hexdigest()
        self.file_path = os.path.join(tempfile.gettempdir(), filename + '.xlsx')
        self.display_name = '[{:%a %-d %b %-H-%M-%S %Y}] Progress Report(s) Summary.xlsx'.format(
            timezone.now()
        )

        self.workbook = Workbook()

        self.sheet = self.workbook.get_active_sheet()
        self.analysis = analysis
        if include_disaggregation is not None:
            self.include_disaggregation = include_disaggregation
        self.sheets = [self.sheet, ]
        self.disaggregations_start_column = len(self.general_info_headers)

        self.bold_center_style = NamedStyle(name="Bold and Center")
        self.bold_center_style.font = Font(bold=True)
        self.bold_center_style.alignment = Alignment(horizontal='center')

    def get_general_info_row(self, progress_report, location_data):
        indicator_report = location_data.indicator_report
        programme_document = progress_report.programme_document

        partner = programme_document.partner

        general_info_row = [
            (partner.title, None),
            (location_data.location.gateway.country.name, None),
            (programme_document.reference_number, None),
            (programme_document.title, None),
            (progress_report.get_reporting_period(), None),
            (progress_report.get_status_display(), None),
            (progress_report.due_date, PARTNER_PORTAL_DATE_FORMAT_EXCEL),
            (progress_report.submission_date, PARTNER_PORTAL_DATE_FORMAT_EXCEL),
            (progress_report.partner_contribution_to_date, None),
            (programme_document.funds_received_to_date, FORMAT_CURRENCY_USD),
            (progress_report.challenges_in_the_reporting_period, None),
            (progress_report.proposed_way_forward, None),
            (progress_report.submitted_by.display_name if progress_report.submitted_by else '', None),
            (progress_report.attachment.url if progress_report.attachment else '', None),
        ]

        return general_info_row

    def fill_sheet(self):
        # Setup a title
        self.sheet.title = "TEST"
        current_row = 1

        for column, header_text in enumerate(self.general_info_headers):
            self.column_widths.append(len(header_text))
            column += 1  # columns are not 0-indexed...
            cell = self.sheet.cell(row=current_row, column=column, value=header_text)
            cell.style = self.bold_center_style
        current_row += 1

        for progress_report in self.progress_reports:
            for indicator_report in progress_report.indicator_reports.all():
                for location_data in indicator_report.indicator_location_data.all():
                    general_info_row = self.get_general_info_row(progress_report, location_data)

                    for column, (cell_data, cell_format) in enumerate(general_info_row):
                        try:
                            self.column_widths[column] = max(self.column_widths[column], len(cell_data) + 2)
                        except TypeError:
                            self.column_widths[column] = max(self.column_widths[column], len(str(cell_data)) + 2)
                        column += 1  # columns are not 0-indexed...
                        cell = self.sheet.cell(row=current_row, column=column, value=cell_data)
                        if cell_format:
                            cell.number_format = cell_format
                    current_row += 1

        for column, width in enumerate(self.column_widths):
            column += 1
            self.sheet.column_dimensions[get_column_letter(column)].width = width

        self.workbook.save(self.file_path)

    def cleanup(self):
        os.remove(self.file_path)

    def get_as_response(self):
        self.fill_sheet()
        response = HttpResponse()
        response.content_type = self.sheet.mime_type
        with open(self.file_path, 'rb') as content:
            response.write(content.read())
        self.cleanup()
        response['Content-Disposition'] = 'attachment; filename="{}"'.format(self.display_name)
        return response
