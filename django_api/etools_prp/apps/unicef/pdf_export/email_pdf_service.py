import logging
import time

from django.conf import settings
from django.core.mail import EmailMessage

from .progress_report_pdf import ProgressReportPDFService

logger = logging.getLogger(__name__)


class EmailPDFService:

    def __init__(self, user_email, workspace_id, filter_params=None, user_info=None):
        self.user_email = user_email
        self.workspace_id = workspace_id
        self.filter_params = filter_params
        self.user_info = user_info
        self.pdf_service = ProgressReportPDFService()

    def process(self):
        start_time = time.time()

        try:
            queryset = self._get_filtered_queryset()
            count = queryset.count()

            if count == 0:
                return self._handle_empty_result()

            file_path, file_url = self._process_pdf_generation(queryset)
            self._send_success_email(count, file_url)

            duration = time.time() - start_time
            return self._build_success_response(count, duration, file_path)

        except Exception as e:
            return self._handle_error(e)

    def _get_filtered_queryset(self):
        return self.pdf_service.get_optimized_queryset(
            workspace_id=self.workspace_id,
            user_info=self.user_info,
            filter_params=self.filter_params
        )

    def _handle_empty_result(self):
        self._send_no_data_email()
        return {
            'status': 'completed',
            'count': 0,
            'message': 'No reports found'
        }

    def _process_pdf_generation(self, queryset):
        pdf_bytes, _ = self.pdf_service.generate_pdf_bytes(queryset)
        return self.pdf_service.save_pdf_to_storage(pdf_bytes, self.workspace_id)

    def _send_success_email(self, count, file_url):
        subject = f'Progress Reports Export - {count} Reports'
        body = self._build_success_email_body(count, file_url)
        self._send_email(subject, body)

    def _build_success_email_body(self, count, file_url):
        return f'''Your progress reports export is ready!

Report count: {count}

You can download the PDF report from the following link:
{file_url}

Best regards,
UNICEF PRP System
'''

    def _send_email(self, subject, body):
        EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[self.user_email],
        ).send()

    def _send_no_data_email(self):
        self._send_email(
            'Progress Reports Export - No Data',
            'Your progress reports export request did not find any matching reports.'
        )

    def _build_success_response(self, count, duration, file_path):
        return {
            'status': 'completed',
            'count': count,
            'duration': round(duration, 2),
            'emailed_to': self.user_email,
            'file_path': file_path
        }

    def _handle_error(self, exception):
        logger.exception(f"Error generating PDF: {exception}")
        self._send_error_notification()
        raise

    def _send_error_notification(self):
        try:
            self._send_email(
                'Progress Reports Export - Error',
                'An error occurred while generating your progress reports export.\n'
                'Please try again or contact support.'
            )
        except Exception as email_error:
            logger.exception(f"Failed to send error email: {email_error}")
