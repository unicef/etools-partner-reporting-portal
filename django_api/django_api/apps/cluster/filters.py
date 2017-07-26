from django.db.models import Q
import django_filters
from django_filters.filters import CharFilter

from .models import ClusterObjective, ClusterActivity


class ClusterObjectiveFilter(django_filters.FilterSet):
    ref_title = CharFilter(method='get_reference_number_title')
    cluster_id = CharFilter(method='get_cluster_id')

    class Meta:
        model = ClusterObjective
        fields = ['ref_title', 'cluster_id']

    def get_reference_number_title(self, queryset, name, value):
        return queryset.filter(
            Q(reference_number__icontains=value) | Q(title__icontains=value)
        )

    def get_cluster_id(self, queryset, name, value):
        return queryset.filter(cluster_id=value)


class ClusterActivityFilter(django_filters.FilterSet):

    title = CharFilter(method='get_title')
    cluster_id = CharFilter(method='get_cluster_id')

    class Meta:
        model = ClusterActivity
        fields = ['title', 'cluster_id']

    def get_title(self, queryset, name, value):
        return queryset.filter(title__icontains=value)

    def get_cluster_id(self, queryset, name, value):
        return queryset.filter(cluster_objective__cluster_id=value)
