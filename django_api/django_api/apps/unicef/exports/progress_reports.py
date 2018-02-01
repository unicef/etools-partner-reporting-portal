import logging

from babel.numbers import format_currency
from django.conf import settings
from django.http import HttpResponse
from django.utils.translation import to_locale, get_language
from easy_pdf.exceptions import PDFRenderingError
from easy_pdf.rendering import render_to_pdf, make_response


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
        result = list()
        temp = None
        d = list()
        for r in indicator_reports:
            if not temp:
                temp = r.reportable.id
            elif temp != r.reportable.id:
                result.append(d)
                temp = None
                d = list()
            d.append(r)
        if d:
            result.append(d)
        return result

    def get_context(self):
        locale = to_locale(get_language())
        pd = self.progress_report.programme_document

        context = {
            'progress_report': self.progress_report,
            'title': self.display_name,
            'programme_document': pd,
            'start_date': pd.start_date.strftime(settings.PRINT_DATA_FORMAT),
            'end_date': pd.end_date.strftime(settings.PRINT_DATA_FORMAT),
            'cso_contribution': pd.cso_contribution,
            'budget': format_currency(pd.budget, pd.budget_currency, locale=locale),
            'funds_received_to_date': format_currency(
                pd.funds_received_to_date, pd.funds_received_to_date_currency, locale=locale
            ),
            'submission_date': self.progress_report.get_submission_date(),
            'reporting_period': self.progress_report.get_reporting_period(),
            'authorized_officer': pd.unicef_officers.first(),
            'focal_point': pd.unicef_focal_point.first(),
            'outputs': self.format_indicator_reports(
                self.progress_report.indicator_reports.all().order_by('reportable')
            )
        }

        return context

    def get_as_response(self):
        try:
            pdf = render_to_pdf(self.template_name, self.get_context())
            response = make_response(pdf)
            response['Content-disposition'] = 'inline; filename="{}"'.format(self.file_name)
            return response
        except PDFRenderingError:
            logger.exception('Error trying to render PDF')
            return HttpResponse('Error trying to render PDF')
