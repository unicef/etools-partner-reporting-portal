import logging

from celery import shared_task

from etools_prp.apps.unicef.pdf_export.email_pdf_service import EmailPDFService

logger = logging.getLogger(__name__)


@shared_task(bind=True)
def generate_and_email_progress_report_pdf(self, user_email, workspace_id, filter_params=None, user_info=None):
    logger.info(
        f"Starting async PDF generation task {self.request.id} for workspace {workspace_id}, "
        f"will email to {user_email}"
    )

    service = EmailPDFService(
        user_email=user_email,
        workspace_id=workspace_id,
        filter_params=filter_params,
        user_info=user_info
    )

    return service.process()
