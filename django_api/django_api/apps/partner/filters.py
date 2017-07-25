from django_filters import rest_framework as filters
from django_filters.filters import ChoiceFilter, CharFilter, DateFilter

from core.common import PD_STATUS

from .models import PartnerProject


class PartnerProjectFilter(filters.FilterSet):
    partner = CharFilter(method='get_partner')
    title = CharFilter(method='get_title')
    location = CharFilter(method='get_location')
    status = ChoiceFilter(choices=PD_STATUS)
    start_date = DateFilter(method='get_start_date')
    end_date = DateFilter(method='get_end_date')

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
