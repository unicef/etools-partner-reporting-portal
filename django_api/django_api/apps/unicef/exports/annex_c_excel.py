import tempfile

import os

from django.http import HttpResponse
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, NamedStyle
from openpyxl.styles.numbers import FORMAT_CURRENCY_USD, FORMAT_PERCENTAGE
from openpyxl.utils import get_column_letter

import hashlib
from django.utils import timezone

from indicator.constants import ValueType
from unicef.exports.utilities import PARTNER_PORTAL_DATE_FORMAT_EXCEL


MAX_ADMIN_LEVEL = 5


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
        'PD output Title',
        'PD output progress status',
        'PD output narrative assessment',
        'PD Indicator Title',
        'PD indicator type',
        'PD UNICEF Indicator Target',
        'Calculation method across location',
        'Calculation method across reporting period',
        'Previous location progress',
        'Location Admin Level 1',
        'Admin Level 1 PCode',
        'Location Admin Level 2',
        'Admin Level 2 PCode',
        'Location Admin Level 3',
        'Admin Level 3 PCode',
        'Location Admin Level 4',
        'Admin Level 4 PCode',
        'Location Admin Level 5',
        'Admin Level 5 PCode',
        'Achievement in reporting period (total across all locations)',
        'Total cumulative progress',
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

        self.current_sheet = self.workbook.get_active_sheet()
        self.analysis = analysis
        if include_disaggregation is not None:
            self.include_disaggregation = include_disaggregation
        self.sheets = [self.current_sheet, ]
        self.disaggregations_start_column = len(self.general_info_headers)

        self.bold_center_style = NamedStyle(name="Bold and Center")
        self.bold_center_style.font = Font(bold=True)
        self.bold_center_style.alignment = Alignment(horizontal='center')

    def get_general_info_row(self, progress_report, location_data):
        indicator_report = location_data.indicator_report
        programme_document = progress_report.programme_document

        partner = programme_document.partner

        try:
            indicator_target = float(indicator_report.reportable.target)
        except ValueError:
            indicator_target = indicator_report.reportable.target

        previous_location_progress = location_data.previous_location_progress_value

        if indicator_report.is_percentage:
            indicator_report_value_format = FORMAT_PERCENTAGE
            achievement_in_reporting_period = indicator_report.total.get(ValueType.CALCULATED, 0)
            total_cumulative_progress = indicator_report.reportable.achieved.get(
                ValueType.CALCULATED, 0
            )
        else:
            indicator_report_value_format = None
            achievement_in_reporting_period = indicator_report.total.get(ValueType.VALUE, 0)
            total_cumulative_progress = indicator_report.reportable.achieved.get(
                ValueType.VALUE, 0
            )

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
            (indicator_report.reportable.content_object.title, None),
            (indicator_report.get_overall_status_display(), None),
            (indicator_report.narrative_assessment, None),
            (indicator_report.title, None),
            (indicator_report.display_type, None),
            (indicator_target, None),
            (indicator_report.calculation_formula_across_locations, None),
            (indicator_report.calculation_formula_across_periods, None),
            (previous_location_progress, indicator_report_value_format),
        ]

        location_info = []

        # Iterate over location admin references:
        location = location_data.location
        while True:
            location_info.append([
                location.title, location.p_code
            ])

            if location.parent:
                location = location.parent
            else:
                break

        for i in range(MAX_ADMIN_LEVEL):
            try:
                location_name, location_p_code = location_info[i]
            except IndexError:
                location_name, location_p_code = None, None
            general_info_row.append((location_name, None))
            general_info_row.append((location_p_code, None))

        general_info_row += [
            (achievement_in_reporting_period, indicator_report_value_format),
            (total_cumulative_progress, indicator_report_value_format),
        ]

        return general_info_row

    def fill_workbook(self):
        for progress_report in self.progress_reports:
            if not self.current_sheet.max_row == 1:
                self.current_sheet = self.workbook.create_sheet('TEMP')
            self.write_progress_report_to_current_sheet(progress_report)

        self.workbook.save(self.file_path)

    def write_progress_report_to_current_sheet(self, progress_report):
        # TODO: Better sheet title, unfortunately its charset and length limited
        self.current_sheet.title = 'PR {}'.format(progress_report.pk)
        current_row = 1

        for column, header_text in enumerate(self.general_info_headers):
            self.column_widths.append(len(header_text))
            column += 1  # columns are not 0-indexed...
            cell = self.current_sheet.cell(row=current_row, column=column, value=header_text)
            cell.style = self.bold_center_style
        current_row += 1

        for indicator_report in progress_report.indicator_reports.all():
            for location_data in indicator_report.indicator_location_data.all():
                general_info_row = self.get_general_info_row(progress_report, location_data)

                for column, (cell_data, cell_format) in enumerate(general_info_row):
                    try:
                        self.column_widths[column] = max(self.column_widths[column], len(cell_data) + 2)
                    except TypeError:
                        self.column_widths[column] = max(self.column_widths[column], len(str(cell_data)) + 2)
                    column += 1  # columns are not 0-indexed...
                    cell = self.current_sheet.cell(row=current_row, column=column, value=cell_data)
                    if cell_format:
                        cell.number_format = cell_format
                current_row += 1

        for column, width in enumerate(self.column_widths):
            column += 1
            self.current_sheet.column_dimensions[get_column_letter(column)].width = width

    def cleanup(self):
        os.remove(self.file_path)

    def get_as_response(self):
        self.fill_workbook()
        response = HttpResponse()
        response.content_type = self.current_sheet.mime_type
        with open(self.file_path, 'rb') as content:
            response.write(content.read())
        self.cleanup()
        response['Content-Disposition'] = 'attachment; filename="{}"'.format(self.display_name)
        return response
