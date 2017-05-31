from django.db.models import Q
import django_filters
from django_filters.filters import ChoiceFilter, CharFilter

from core.common import PD_LIST_REPORT_STATUS, PD_STATUS
from core.models import Location
from .models import ProgrammeDocument


class ProgrammeDocumentFilter(django_filters.FilterSet):
    ref_title = CharFilter(method='get_reference_number_title')
    status = ChoiceFilter(choices=PD_STATUS)
    location = CharFilter(method='get_location')
    # report_status = ChoiceFilter(choices=PD_LIST_REPORT_STATUS, method='get_report_status')
    # due_date = DateFilter(method='get_due_date')

    class Meta:
        model = ProgrammeDocument
        fields = ['ref_title', 'status', 'location']

    def get_reference_number_title(self, queryset, name, value):
        return queryset.filter(
            Q(reference_number__icontains=value) | Q(title__icontains=value)
        )

    def get_location(self, queryset, name, value):
        pd_ids = Location.objects.filter(
            Q(id=value) |
            Q(parent_id=value) |
            Q(parent__parent_id=value) |
            Q(parent__parent__parent_id=value) |
            Q(parent__parent__parent__parent_id=value)
        ).values_list(
             'reportable__lower_level_outputs__indicator__programme_document__id',
             flat=True
        )
        return queryset.filter(pk__in=pd_ids)

    # def get_report_status(self, queryset, name, value):
    #     # reports not exists OR property contain_nothing_due_report
    #     if value == PD_LIST_REPORT_STATUS.nothing_due:
    #         return queryset.filter(
    #
    #         )
    #     # property contain_overdue_report
    #     elif value == PD_LIST_REPORT_STATUS.overdue:
    #         return queryset.filter(
    #
    #         )
    #     # value == PD_LIST_REPORT_STATUS.due:
    #     else:
    #         return queryset.filter(
    #
    #         )
