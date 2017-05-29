import django_filters
from django_filters.filters import ChoiceFilter

from core.common import PROGRESS_REPORT_STATUS
from .models import IndicatorReport


class PDReportsFilter(django_filters.FilterSet):
    status = ChoiceFilter(choices=PROGRESS_REPORT_STATUS, method="get_status")

    class Meta:
        model = IndicatorReport
        fields = ['status', ]

    def get_status(self, queryset, name, value):
        return queryset.filter(progress_report__status=value)
