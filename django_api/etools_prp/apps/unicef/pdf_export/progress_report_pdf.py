import logging
import time
from datetime import datetime

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db.models import Prefetch
from django.http import QueryDict
from django.template.loader import render_to_string

from weasyprint import CSS, HTML
from weasyprint.text.fonts import FontConfiguration

from etools_prp.apps.indicator.models import IndicatorLocationData, IndicatorReport, ReportableLocationGoal
from etools_prp.apps.partner.models import Partner
from etools_prp.apps.unicef.exports.progress_reports import ProgressReportListPDFExporter
from etools_prp.apps.unicef.filters import ProgressReportFilter
from etools_prp.apps.unicef.models import ProgressReport

logger = logging.getLogger(__name__)


class ProgressReportPDFService:
    @staticmethod
    def build_base_queryset(workspace_id, user_info=None, filter_params=None):
        if user_info:
            is_unicef = user_info.get('is_unicef', False)
            partner_id = user_info.get('partner_id')
            external_partner_id = filter_params.get('external_partner_id') if filter_params else None

            if external_partner_id is not None:
                partners = Partner.objects.filter(external_id=external_partner_id)
                queryset = ProgressReport.objects.filter(programme_document__partner__in=partners)
            elif is_unicef:
                queryset = ProgressReport.objects.all()
            elif partner_id:
                queryset = ProgressReport.objects.filter(programme_document__partner_id=partner_id)
            else:
                queryset = ProgressReport.objects.none()
        else:
            queryset = ProgressReport.objects.all()

        queryset = queryset.filter(programme_document__workspace_id=workspace_id).distinct()

        return queryset

    @staticmethod
    def apply_filters(queryset, filter_params):
        if not filter_params:
            return queryset

        filter_params_copy = {k: v for k, v in filter_params.items() if k != 'external_partner_id'}

        if not filter_params_copy:
            return queryset

        query_dict = QueryDict('', mutable=True)
        for key, value in filter_params_copy.items():
            if isinstance(value, list):
                query_dict.setlist(key, value)
            else:
                query_dict[key] = value

        filterset = ProgressReportFilter(query_dict, queryset=queryset)
        filtered_qs = filterset.qs

        logger.info(f"Filters applied: {list(filter_params_copy.keys())}")

        return filtered_qs

    @staticmethod
    def apply_optimizations(queryset):
        previous_indicator_location_data_prefetch = Prefetch(
            'indicator_location_data',
            queryset=IndicatorLocationData.objects.select_related('location', 'indicator_report')
        )

        indicator_reports_prefetch = Prefetch(
            'indicator_reports',
            queryset=IndicatorReport.objects.select_related(
                'reportable__blueprint',
                'reportable__content_type',
            ).prefetch_related(
                'reportable__content_object',
                Prefetch(
                    'indicator_location_data',
                    queryset=IndicatorLocationData.objects.select_related(
                        'location',
                        'indicator_report',
                    ).order_by('id')
                ),
                Prefetch(
                    'reportable__reportablelocationgoal_set',
                    queryset=ReportableLocationGoal.objects.select_related('location').filter(is_active=False),
                    to_attr='inactive_location_goals'
                ),
                Prefetch(
                    'reportable__indicator_reports',
                    queryset=IndicatorReport.objects.select_related('reportable').prefetch_related(
                        previous_indicator_location_data_prefetch
                    ).order_by('-time_period_start')
                ),
            )
        )

        optimized_queryset = queryset.select_related(
            'programme_document',
            'programme_document__partner',
            'programme_document__workspace',
            'submitted_by',
            'submitting_user',
        ).prefetch_related(
            'attachments',
            indicator_reports_prefetch,
        )

        return optimized_queryset

    @staticmethod
    def get_optimized_queryset(workspace_id, user_info=None, filter_params=None):
        queryset = ProgressReportPDFService.build_base_queryset(workspace_id, user_info, filter_params)
        queryset = ProgressReportPDFService.apply_filters(queryset, filter_params)
        queryset = ProgressReportPDFService.apply_optimizations(queryset)

        return queryset

    @staticmethod
    def generate_pdf_bytes(queryset):
        logger.info("Starting PDF generation")
        start_time = time.time()

        exporter = ProgressReportListPDFExporter(queryset)
        context = exporter.get_context()
        report_count = len(context.get('sections', []))

        logger.info(f"Context generated for {report_count} reports in {time.time() - start_time:.2f}s")

        html_time = time.time()
        html_string = render_to_string(f"{exporter.template_name}.html", context)
        html_size_kb = len(html_string) / 1024
        logger.info(f"HTML rendered ({html_size_kb:.1f}KB) in {time.time() - html_time:.2f}s")

        css_time = time.time()
        font_config = FontConfiguration()
        css = CSS(
            string=render_to_string(f"{exporter.template_name}.css"),
            font_config=font_config,
        )
        logger.info(f"CSS rendered in {time.time() - css_time:.2f}s")

        html = HTML(string=html_string)

        pdf_time = time.time()
        estimated_time = report_count * 0.08
        logger.info(f"Starting WeasyPrint PDF generation for {report_count} reports (estimated time: ~{estimated_time:.0f}s)...")

        pdf_bytes = html.write_pdf(
            stylesheets=[css],
            font_config=font_config,
            optimize_size=('fonts',),
            presentational_hints=True,
        )

        generation_time = time.time() - start_time
        pdf_generation_time = time.time() - pdf_time
        pdf_size_mb = len(pdf_bytes) / 1024 / 1024

        logger.info(
            f"PDF generation complete - "
            f"Reports: {report_count}, "
            f"Size: {pdf_size_mb:.2f}MB, "
            f"Speed: {pdf_generation_time / report_count:.2f}s/report, "
            f"Breakdown: Context={html_time - start_time:.1f}s, "
            f"HTML={css_time - html_time:.1f}s, "
            f"CSS={pdf_time - css_time:.1f}s, "
            f"WeasyPrint={pdf_generation_time:.1f}s, "
            f"Total={generation_time:.1f}s"
        )

        return pdf_bytes, generation_time

    @staticmethod
    def save_pdf_to_storage(pdf_bytes, workspace_id):

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"progress_reports_exports/progress_reports_export_{workspace_id}_{timestamp}.pdf"

        file_path = default_storage.save(filename, ContentFile(pdf_bytes))

        if hasattr(default_storage, 'url'):
            file_url = default_storage.url(file_path)
        else:
            file_url = f"{settings.MEDIA_URL}{file_path}"

        logger.info(f"PDF saved to storage: {file_path}")

        return file_path, file_url
