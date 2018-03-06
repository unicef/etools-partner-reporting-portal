import django_filters
from django_filters.filters import CharFilter, NumberFilter

from .models import Location


class LocationFilter(django_filters.FilterSet):
    loc_type = NumberFilter(method='get_loc_type')
    cluster_objectives = CharFilter(method='get_cluster_objectives')

    class Meta:
        model = Location
        fields = ['loc_type', 'cluster_objectives']

    def get_loc_type(self, queryset, name, value):
        return queryset.filter(gateway__admin_level=value)

    def get_cluster_objectives(self, queryset, name, value):
        return queryset.filter(gateway__country__workspaces__response_plans__clusters__cluster_objectives__in=value.split(','))
