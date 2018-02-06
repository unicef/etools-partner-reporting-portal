import logging

from django.http import HttpResponse
from easy_pdf.exceptions import PDFRenderingError
from easy_pdf.rendering import render_to_pdf, make_response

from unicef.exports.utilities import group_indicator_reports_by_lower_level_output

logger = logging.getLogger(__name__)


class ProgressReportDetailPDFExporter:

    template_name = 'progress_report_detail_pdf_export.html'

    def __init__(self, progress_report):
        self.progress_report = progress_report
        self.display_name = '[{}] {} Progress Summary'.format(
            progress_report.get_reporting_period(), progress_report.programme_document.title
        )
        self.file_name = self.display_name + '.pdf'

    def get_context(self):
        pd = self.progress_report.programme_document

        context = {
            'progress_report': self.progress_report,
            'title': self.display_name,
            'programme_document': pd,
            'authorized_officer': pd.unicef_officers.first(),
            'focal_point': pd.unicef_focal_point.first(),
            'indicator_reports': group_indicator_reports_by_lower_level_output(
                self.progress_report.indicator_reports.all()
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
