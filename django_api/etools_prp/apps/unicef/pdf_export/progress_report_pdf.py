import logging
from datetime import datetime

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

from .pdf_exporter_service import PDFExporterService
from .queryset_filter_service import QuerysetFilterService

logger = logging.getLogger(__name__)


class ProgressReportPDFService:

    def __init__(self):
        self.queryset_filter_service = QuerysetFilterService()
        self.pdf_exporter_service = PDFExporterService()

    def build_base_queryset(self, workspace_id, user_info=None, filter_params=None):
        return self.queryset_filter_service.build_base_queryset(workspace_id, user_info, filter_params)

    def apply_filters(self, queryset, filter_params):
        return self.queryset_filter_service.apply_filters(queryset, filter_params)

    def apply_optimizations(self, queryset):
        return self.queryset_filter_service.apply_optimizations(queryset)

    def get_optimized_queryset(self, workspace_id, user_info=None, filter_params=None):
        return self.queryset_filter_service.get_optimized_queryset(workspace_id, user_info, filter_params)

    def generate_pdf_bytes(self, queryset):
        return self.pdf_exporter_service.generate_pdf_bytes(queryset)

    def save_pdf_to_storage(self, pdf_bytes, workspace_id):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"progress_reports_exports/progress_reports_export_{workspace_id}_{timestamp}.pdf"

        file_path = default_storage.save(filename, ContentFile(pdf_bytes))

        if hasattr(default_storage, 'url'):
            file_url = default_storage.url(file_path)
        else:
            file_url = f"{settings.MEDIA_URL}{file_path}"

        logger.info(f"PDF saved to storage: {file_path}")

        return file_path, file_url
