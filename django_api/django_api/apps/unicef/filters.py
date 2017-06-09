from datetime import datetime
from django.conf import settings
from django.db.models import Q
import django_filters
from distutils.util import strtobool
from django_filters.filters import ChoiceFilter, CharFilter, DateFilter, TypedChoiceFilter

from core.common import PD_LIST_REPORT_STATUS, PD_STATUS, PROGRESS_REPORT_STATUS
from core.models import Location
from indicator.models import IndicatorReport
from .models import ProgrammeDocument, ProgressReport

BOOLEAN_CHOICES = (('0', 'False'), ('1', 'True'),)


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


class ProgressReportFilter(django_filters.FilterSet):
    status = ChoiceFilter(name='status', choices=PROGRESS_REPORT_STATUS, label='Status')
    pd_ref_title = CharFilter(name='pd ref title', method='get_pd_ref_title',
                              label='PD/Ref # title')
    due_date = DateFilter(name='due date', method='get_due_date', label='Due date',
                          input_formats=[settings.PRINT_DATA_FORMAT])
    due = TypedChoiceFilter(name='due', choices=BOOLEAN_CHOICES, coerce=strtobool,
                            method='get_due_overdue_status', label='Show only due or overdue')

    class Meta:
        model = ProgressReport
        fields = ['status', 'pd_ref_title', 'due_date']

    def get_status(self, queryset, name, value):
        return queryset.filter(status=value)

    def get_due_overdue_status(self, queryset, name, value):
        if value:
            return queryset.filter(
                status__in=[PROGRESS_REPORT_STATUS.due, PROGRESS_REPORT_STATUS.over_due])
        return queryset

    def get_pd_ref_title(self, queryset, name, value):
        return queryset.filter(
            Q(programme_document__reference_number__icontains=value) |
            Q(programme_document__title__icontains=value)
        )

    def get_due_date(self, queryset, name, value):
        ir_ids = IndicatorReport.objects \
            .filter(progress_report_id__in=queryset.values_list('id', flat=True)) \
            .filter(due_date=value) \
            .values_list('progress_report_id') \
            .distinct()

        return queryset.filter(id__in=ir_ids)
