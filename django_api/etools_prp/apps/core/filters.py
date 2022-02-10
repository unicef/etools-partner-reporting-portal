import django_filters
from django_filters.filters import CharFilter, NumberFilter

from .models import Location


class LocationFilter(django_filters.FilterSet):
    loc_type = NumberFilter(method='get_loc_type')
    cluster_objectives = CharFilter(method='get_cluster_objectives')
    title = CharFilter(method='get_title')

    class Meta:
        model = Location
        fields = ['loc_type', 'cluster_objectives', 'title']

    def get_loc_type(self, queryset, name, value):
        return queryset.filter(admin_level=value)

    def get_cluster_objectives(self, queryset, name, value):
        return queryset.filter(
            workspaces__response_plans__clusters__cluster_objectives__in=value.split(','))

    def get_title(self, queryset, name, value):
        return queryset.filter(title__icontains=value)
