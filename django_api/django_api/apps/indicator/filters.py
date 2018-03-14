from django_filters import rest_framework as filters
from django_filters.filters import ChoiceFilter, NumberFilter

from core.common import PROGRESS_REPORT_STATUS

from indicator.models import Reportable, IndicatorReport


class IndicatorFilter(filters.FilterSet):
    baseline = NumberFilter(
        method="get_baseline",
        label="Baseline")

    def get_baseline(self, queryset, name, value):
        return queryset.filter(baseline__v=value)

    class Meta:
        model = Reportable
        fields = (
            'id', 'target', 'baseline', 'blueprint__title',
            'blueprint__unit', 'indicator_reports'
        )


class PDReportsFilter(filters.FilterSet):
    status = ChoiceFilter(
        choices=PROGRESS_REPORT_STATUS,
        method="get_status",
        label="Status")

    class Meta:
        model = IndicatorReport
        fields = ['status', ]

    def get_status(self, queryset, name, value):
        return queryset.filter(progress_report__status=value)
