import logging
import time

from django.conf import settings
from django.core.mail import EmailMessage

from celery import shared_task

from etools_prp.apps.unicef.pdf_export import ProgressReportPDFService

logger = logging.getLogger(__name__)


@shared_task(bind=True)
def generate_and_email_progress_report_pdf(self, user_email, workspace_id, filter_params=None, user_info=None):
    logger.info(f"Starting async PDF generation task {self.request.id} for workspace {workspace_id}, will email to {user_email}")
    logger.info(f"Filter params: {filter_params}")
    logger.info(f"User info: {user_info}")
    start_time = time.time()

    try:

        queryset = ProgressReportPDFService.get_optimized_queryset(
            workspace_id=workspace_id,
            user_info=user_info,
            filter_params=filter_params
        )

        count = queryset.count()
        logger.info(f"Generating PDF for {count} progress reports")

        if count == 0:
            EmailMessage(
                subject='Progress Reports Export - No Data',
                body='Your progress reports export request did not find any matching reports.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user_email],
            ).send()

            return {
                'status': 'completed',
                'count': 0,
                'message': 'No reports found'
            }
        pdf_bytes, _ = ProgressReportPDFService.generate_pdf_bytes(queryset)

        file_path, file_url = ProgressReportPDFService.save_pdf_to_storage(pdf_bytes, workspace_id)

        duration = time.time() - start_time

        email = EmailMessage(
            subject=f'Progress Reports Export - {count} Reports',
            body=f'''Your progress reports export is ready!

Report count: {count}

You can download the PDF report from the following link:
{file_url}

Best regards,
UNICEF PRP System
''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email],
        )

        email.send()

        logger.info(f"PDF generation and email completed in {duration:.2f}s ({count} reports), download link sent to {user_email}")

        return {
            'status': 'completed',
            'count': count,
            'duration': round(duration, 2),
            'emailed_to': user_email,
            'file_path': file_path
        }

    except Exception as e:
        logger.exception(f"Error generating PDF: {e}")

        try:
            EmailMessage(
                subject='Progress Reports Export - Error',
                body='An error occurred while generating your progress reports export.\nPlease try again or contact support.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user_email],
            ).send()
        except Exception as email_error:
            logger.exception(f"Failed to send error email: {email_error}")

        raise
