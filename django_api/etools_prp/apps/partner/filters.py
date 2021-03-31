from distutils.util import strtobool

from django.db.models import Q

import django_filters
from django_filters import rest_framework as filters
from django_filters.filters import CharFilter, ChoiceFilter, DateFilter, TypedChoiceFilter

from etools_prp.apps.core.common import PARTNER_PROJECT_STATUS
from etools_prp.apps.utils.filters.constants import Boolean
from etools_prp.apps.utils.filters.fields import CommaSeparatedListFilter

from .models import Partner, PartnerActivity, PartnerProject


class PartnerProjectFilter(filters.FilterSet):
    partner = CharFilter(method='get_partner')
    title = CharFilter(method='get_title')
    location = CharFilter(method='get_location')
    status = ChoiceFilter(choices=PARTNER_PROJECT_STATUS)
    start_date = DateFilter(method='get_start_date')
    end_date = DateFilter(method='get_end_date')
    cluster_id = CharFilter(method='get_cluster_id')

    class Meta:
        model = PartnerProject
        fields = ['title', 'location', 'status', 'start_date', 'end_date']

    def get_partner(self, queryset, name, value):
        return queryset.filter(partner_id=value)

    def get_title(self, queryset, name, value):
        return queryset.filter(title__icontains=value)

    def get_location(self, queryset, name, value):
        return queryset.filter(locations__id=value)

    def get_start_date(self, queryset, name, value):
        return queryset.filter(start_date__gte=value)

    def get_end_date(self, queryset, name, value):
        return queryset.filter(end_date__lte=value)

    def get_cluster_id(self, queryset, name, value):
        return queryset.filter(clusters__in=[value])


class ClusterActivityPartnersFilter(django_filters.FilterSet):

    partner = CharFilter(method='get_partner')

    class Meta:
        model = Partner
        fields = ['partner', ]

    def get_partner(self, queryset, name, value):
        return queryset.filter(id=value)


class PartnerActivityFilter(django_filters.FilterSet):

    partner = CharFilter(method='get_partner')
    project = CharFilter(method='get_project')
    cluster_id = CharFilter(method='get_cluster_id')
    activity = CharFilter(method='get_activity')
    custom = TypedChoiceFilter(
        field_name='custom',
        choices=Boolean.CHOICES,
        coerce=strtobool,
        method='get_custom',
        label='Show only custom activities',
    )
    status = ChoiceFilter(choices=PARTNER_PROJECT_STATUS)
    location = CharFilter(method='get_location')

    class Meta:
        model = PartnerActivity
        fields = ['partner', 'project', 'cluster_id', 'activity', 'custom', 'status', 'location']

    def get_partner(self, queryset, name, value):
        return queryset.filter(partner=value)

    def get_project(self, queryset, name, value):
        return queryset.filter(projects=value)

    def get_cluster_id(self, queryset, name, value):
        return queryset.filter(
            Q(cluster_activity__cluster_objective__cluster__id=value) |
            Q(cluster_objective__cluster__id=value)
        )

    def get_activity(self, queryset, name, value):
        return queryset.filter(title__icontains=value)

    def get_custom(self, queryset, name, value):
        if value:
            return queryset.filter(
                cluster_activity=None)
        return queryset

    def get_location(self, queryset, name, value):
        return queryset.filter(locations__id=value)


class PartnerFilter(django_filters.FilterSet):

    clusters = CommaSeparatedListFilter(field_name='clusters__id')

    class Meta:
        model = Partner
        fields = ['clusters']


class PartnerIDManagementFilter(django_filters.FilterSet):
    partner_type = CharFilter(field_name='partner_type')
    clusters = CommaSeparatedListFilter(field_name='clusters__id')
    title = CharFilter(method='get_title')

    class Meta:
        model = Partner
        fields = ['partner_type', 'clusters', 'title']

    def get_title(self, queryset, name, value):
        return queryset.filter(
            Q(title__icontains=value) |
            Q(short_title__icontains=value) |
            Q(alternate_title__icontains=value)
        )
