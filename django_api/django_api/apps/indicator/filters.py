from django_filters import rest_framework as filters
from django_filters.filters import ChoiceFilter

from core.common import PROGRESS_REPORT_STATUS

from indicator.models import Reportable, IndicatorReport


class IndicatorFilter(filters.FilterSet):
    class Meta:
        model = Reportable
        fields = (
            'id', 'target', 'baseline', 'blueprint__title',
            'blueprint__unit', 'indicator_reports'
        )


class PDReportsFilter(filters.FilterSet):
    status = ChoiceFilter(choices=PROGRESS_REPORT_STATUS, method="get_status")

    class Meta:
        model = IndicatorReport
        fields = ['status', ]

    def get_status(self, queryset, name, value):
        if value == PROGRESS_REPORT_STATUS.due:
            return queryset.filter(progress_report__isnull=True)
        else:
            return queryset.filter(progress_report__status=value)
