from datetime import datetime
from django.conf import settings
from django.db.models import Q
import django_filters
from distutils.util import strtobool
from django_filters.filters import (
    ChoiceFilter, CharFilter, DateFilter, TypedChoiceFilter
)

from core.common import PD_LIST_REPORT_STATUS, PD_STATUS, PROGRESS_REPORT_STATUS
from indicator.models import Reportable
from .models import ProgrammeDocument, ProgressReport

BOOLEAN_CHOICES = (('0', 'False'), ('1', 'True'),)


class  ProgrammeDocumentIndicatorFilter(django_filters.FilterSet):

    pd_statuses = ChoiceFilter(choices=PD_STATUS, method='get_status')
    pds = CharFilter(method='get_programme_document')
    location = CharFilter(method='get_locations')
    blueprint__title = CharFilter(method='get_blueprint_title')
    incomplete = CharFilter(method='get_incomplete')

    class Meta:
        model = Reportable
        fields = (
            'id', 'blueprint__title',
        )

    def get_status(self, queryset, name, value):
        return queryset.filter(
            lower_level_outputs__cp_output__programme_document__status=value)

    def get_programme_document(self, queryset, name, value):
        return queryset.filter(
            lower_level_outputs__cp_output__programme_document_id=value)

    def get_locations(self, queryset, name, value):
        return queryset.filter(locations=value)

    def get_blueprint_title(self, queryset, name, value):
        return queryset.filter(blueprint__title__contains=value)

    def get_incomplete(self, queryset, name, value):
        return queryset.filter(
            lower_level_outputs__cp_output__programme_document__progress_reports__indicator_reports__submission_date__isnull=True) if value == "1" else queryset


class ProgrammeDocumentFilter(django_filters.FilterSet):
    ref_title = CharFilter(method='get_reference_number_title')
    status = ChoiceFilter(choices=PD_STATUS)
    location = CharFilter(method='get_location')

    class Meta:
        model = ProgrammeDocument
        fields = ['ref_title', 'status', 'location']

    def get_reference_number_title(self, queryset, name, value):
        return queryset.filter(
            Q(reference_number__icontains=value) | Q(title__icontains=value)
        )

    def get_status(self, queryset, name, value):
        return queryset.filter(status=value)

    def get_location(self, queryset, name, value):
        return queryset.filter(progress_reports__indicator_reports__indicator_location_data__location=value)


class ProgressReportFilter(django_filters.FilterSet):
    status = ChoiceFilter(name='status', choices=PROGRESS_REPORT_STATUS, label='Status')
    pd_ref_title = CharFilter(name='pd ref title', method='get_pd_ref_title',
                              label='PD/Ref # title')
    due_date = DateFilter(name='due date', method='get_due_date', label='Due date',
                          input_formats=[settings.PRINT_DATA_FORMAT])
    due = TypedChoiceFilter(name='due', choices=BOOLEAN_CHOICES, coerce=strtobool,
                            method='get_due_overdue_status', label='Show only due or overdue')
    location = CharFilter(name='location', method='get_location',
                              label='Location')

    class Meta:
        model = ProgressReport
        fields = ['status', 'pd_ref_title', 'due_date', 'programme_document',
                  'programme_document__id']

    def get_status(self, queryset, name, value):
        return queryset.filter(status=value)

    def get_due_overdue_status(self, queryset, name, value):
        if value:
            return queryset.filter(
                status__in=[PROGRESS_REPORT_STATUS.due, PROGRESS_REPORT_STATUS.overdue])
        return queryset

    def get_pd_ref_title(self, queryset, name, value):
        return queryset.filter(
            Q(programme_document__reference_number__icontains=value) |
            Q(programme_document__title__icontains=value)
        )

    def get_due_date(self, queryset, name, value):
        return queryset.filter(due_date__lte=value)

    def get_location(self, queryset, name, value):
        return queryset.filter(indicator_reports__indicator_location_data__location=value)
