import logging

from django.db.models import Prefetch
from django.http import QueryDict

from etools_prp.apps.indicator.models import IndicatorLocationData, IndicatorReport, ReportableLocationGoal
from etools_prp.apps.partner.models import Partner
from etools_prp.apps.unicef.filters import ProgressReportFilter
from etools_prp.apps.unicef.models import ProgressReport

logger = logging.getLogger(__name__)


class QuerysetFilterService:

    def build_base_queryset(self, workspace_id, user_info=None, filter_params=None):
        if not user_info:
            return ProgressReport.objects.filter(
                programme_document__workspace_id=workspace_id
            ).distinct()

        external_partner_id = filter_params.get('external_partner_id') if filter_params else None
        if external_partner_id is not None:
            partners = Partner.objects.filter(external_id=external_partner_id)
            return ProgressReport.objects.filter(
                programme_document__partner__in=partners,
                programme_document__workspace_id=workspace_id
            ).distinct()

        if user_info.get('is_unicef', False):
            return ProgressReport.objects.filter(
                programme_document__workspace_id=workspace_id
            ).distinct()

        partner_id = user_info.get('partner_id')
        if partner_id:
            return ProgressReport.objects.filter(
                programme_document__partner_id=partner_id,
                programme_document__workspace_id=workspace_id
            ).distinct()

        return ProgressReport.objects.none()

    def apply_filters(self, queryset, filter_params):
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

    def apply_optimizations(self, queryset):
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

    def get_optimized_queryset(self, workspace_id, user_info=None, filter_params=None):
        queryset = self.build_base_queryset(workspace_id, user_info, filter_params)
        queryset = self.apply_filters(queryset, filter_params)
        queryset = self.apply_optimizations(queryset)

        return queryset
