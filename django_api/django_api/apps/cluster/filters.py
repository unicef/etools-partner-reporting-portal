from django.db.models import Q
import django_filters
from django_filters.filters import CharFilter

from indicator.models import Reportable
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


class ClusterIndicatorDataFilter(django_filters.FilterSet):

    cluster = CharFilter(method='get_cluster')
    partner = CharFilter(method='get_partner')
    indicator = CharFilter(method='get_indicator')
    project = CharFilter(method='get_project')
    location = CharFilter(method='get_location')

    class Meta:
        model = Reportable
        fields = [
            'cluster',
            'partner',
            'indicator',
            'project',
            'location',
        ]

    def get_cluster(self, queryset, name, value):
        return queryset.filter(cluster_objectives__cluster=value)

    def get_partner(self, queryset, name, value):
        return queryset.filter(cluster_objectives__cluster__partners=value)

    def get_indicator(self, queryset, name, value):
        return queryset.filter(indicator_reports=value)

    def get_project(self, queryset, name, value):
        return queryset.filter(partner_projects=value)

    def get_location(self, queryset, name, value):
        return queryset.filter(locations=value)
