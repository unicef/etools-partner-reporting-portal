from django.db.models import Q
import django_filters
from django_filters.filters import CharFilter

from core.common import INDICATOR_REPORT_STATUS
from indicator.models import IndicatorReport
from .models import ClusterObjective, ClusterActivity


class ClusterObjectiveFilter(django_filters.FilterSet):
    ref_title = CharFilter(method='get_reference_number_title')

    class Meta:
        model = ClusterObjective
        fields = ['ref_title', ]

    def get_reference_number_title(self, queryset, name, value):
        return queryset.filter(
            Q(reference_number__icontains=value) | Q(title__icontains=value)
        )


class ClusterActivityFilter(django_filters.FilterSet):

    title = CharFilter(method='get_title')

    class Meta:
        model = ClusterActivity
        fields = ['title', ]

    def get_title(self, queryset, name, value):
        return queryset.filter(title__icontains=value)


class ClusterIndicatorsFilter(django_filters.FilterSet):

    submitted = CharFilter(method='get_submitted')
    cluster = CharFilter(method='get_cluster')
    partner = CharFilter(method='get_partner')
    indicator = CharFilter(method='get_indicator')
    project = CharFilter(method='get_project')
    location = CharFilter(method='get_location')

    class Meta:
        model = IndicatorReport
        fields = [
            'cluster',
            'partner',
            'indicator',
            'project',
            'location',
        ]

    def get_submitted(self, queryset, name, value):
        if value == "1":
            return queryset.filter(report_status=INDICATOR_REPORT_STATUS.submitted)
        else:
            return queryset.exclude(report_status=INDICATOR_REPORT_STATUS.submitted)

    def get_cluster(self, queryset, name, value):
        return queryset.filter(reportable__cluster_objectives__cluster=value)

    def get_partner(self, queryset, name, value):
        return queryset.filter(reportable__partner_project__partners=value)

    def get_indicator(self, queryset, name, value):
        return queryset.filter(reportable_id=value)

    def get_project(self, queryset, name, value):
        return queryset.filter(reportable__partner_projects=value)

    def get_location(self, queryset, name, value):
        return queryset.filter(reportable__locations=value)
