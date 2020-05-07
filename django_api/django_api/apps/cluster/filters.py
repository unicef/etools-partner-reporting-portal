from django.db.models import Q

import django_filters
from core.common import INDICATOR_REPORT_STATUS
from django_filters.filters import CharFilter
from indicator.models import IndicatorReport, Reportable

from .models import Cluster, ClusterActivity, ClusterObjective


class ClusterFilter(django_filters.FilterSet):
    partner = CharFilter(method='get_partner')

    class Meta:
        model = Cluster
        fields = ['partner', ]

    def get_partner(self, queryset, name, value):
        return queryset.filter(
            partners=value
        )


class ClusterObjectiveFilter(django_filters.FilterSet):
    ref_title = CharFilter(method='get_reference_number_title')
    clusters = CharFilter(method='get_clusters')
    cluster_id = CharFilter(method='get_cluster_id')

    class Meta:
        model = ClusterObjective
        fields = ['ref_title', 'clusters', 'cluster_id']

    def get_reference_number_title(self, queryset, name, value):
        return queryset.filter(title__icontains=value)

    def get_clusters(self, queryset, name, value):
        return queryset.filter(cluster_id__in=value.split(','))

    def get_cluster_id(self, queryset, name, value):
        return queryset.filter(cluster_id=value)


class ClusterActivityFilter(django_filters.FilterSet):

    title = CharFilter(method='get_title')
    cluster_id = CharFilter(method='get_cluster_id')
    cluster_objective_id = CharFilter(method='get_cluster_objective_id')

    class Meta:
        model = ClusterActivity
        fields = ['title', 'cluster_id', 'cluster_objective_id']

    def get_title(self, queryset, name, value):
        return queryset.filter(title__icontains=value)

    def get_cluster_id(self, queryset, name, value):
        return queryset.filter(cluster_objective__cluster_id=value)

    def get_cluster_objective_id(self, queryset, name, value):
        return queryset.filter(cluster_objective=value)


class ClusterIndicatorsFilter(django_filters.FilterSet):

    submitted = CharFilter(method='get_submitted')
    cluster = CharFilter(method='get_cluster')
    cluster_id = CharFilter(method='get_cluster')
    partner = CharFilter(method='get_partner')
    indicator = CharFilter(method='get_indicator')
    project = CharFilter(method='get_project')
    location = CharFilter(method='get_location')
    cluster_objective = CharFilter(method='get_cluster_objective')
    cluster_activity = CharFilter(method='get_cluster_activity')
    indicator_type = CharFilter(method='get_indicator_type')

    class Meta:
        model = IndicatorReport
        fields = [
            'cluster',
            'partner',
            'indicator',
            'project',
            'location',
            'cluster_objective',
            'cluster_activity',
            'indicator_type',
        ]

    def get_submitted(self, queryset, name, value):
        """TODO: assuming accepted should be returned in submited as well."""
        q_filter = Q(report_status=INDICATOR_REPORT_STATUS.submitted) | \
            Q(report_status=INDICATOR_REPORT_STATUS.accepted)
        if value == "1":
            return queryset.filter(q_filter)
        else:
            return queryset.exclude(q_filter)

    def get_cluster(self, queryset, name, value):
        return queryset.filter(
            Q(reportable__cluster_objectives__cluster=value) |
            Q(reportable__cluster_activities__cluster_objective__cluster=value) |
            Q(reportable__partner_activity_project_contexts__activity__cluster_activity__cluster_objective__cluster=value) |
            Q(reportable__partner_projects__clusters__id__exact=value)
        )

    def get_partner(self, queryset, name, value):
        return queryset.filter(
            Q(reportable__partner_activity_project_contexts__project__partner=value) |
            Q(reportable__partner_projects__partner=value)
        ).distinct()

    def get_indicator(self, queryset, name, value):
        reportable = Reportable.objects.get(id=value)
        if isinstance(reportable.content_object, ClusterActivity):
            return queryset.filter(Q(reportable=reportable) | Q(reportable__parent_indicator=reportable)).distinct()
        else:
            return queryset.filter(reportable=reportable)

    def get_project(self, queryset, name, value):
        value_list = value.split(',')
        return queryset.filter(
            Q(reportable__cluster_objectives__cluster__partner_projects__in=value_list) |
            Q(reportable__cluster_objectives__cluster_activities__partner_activities__projects__in=value_list) |
            Q(reportable__cluster_activities__cluster_objective__cluster__partner_projects__in=value_list) |
            Q(reportable__cluster_activities__partner_activities__projects__in=value_list)
            |
            Q(reportable__partner_activity_project_contexts__project__in=value_list) |
            Q(reportable__partner_projects__in=value_list)
        ).distinct()

    def get_location(self, queryset, name, value):
        return queryset.filter(
            reportable__indicator_reports__indicator_location_data__location=value).distinct()

    def get_cluster_objective(self, queryset, name, value):
        return queryset.filter(reportable__cluster_objectives=value)

    def get_cluster_activity(self, queryset, name, value):
        return queryset.filter(reportable__cluster_activities=value)

    def get_indicator_type(self, queryset, name, value):
        if value == "partner_activity":
            return queryset.filter(reportable__partner_activity_project_contexts__isnull=False)
        elif value == "partner_project":
            return queryset.filter(reportable__partner_projects__isnull=False)
        elif value == "cluster_objective":
            return queryset.filter(reportable__cluster_objectives__isnull=False)
        elif value == "cluster_activity":
            return queryset.filter(reportable__cluster_activities__isnull=False)
        else:
            return queryset
