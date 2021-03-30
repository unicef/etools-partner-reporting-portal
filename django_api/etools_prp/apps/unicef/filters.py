from distutils.util import strtobool
from urllib import parse

from django.conf import settings
from django.db.models import Q

import django_filters
from core.common import PD_STATUS, PROGRESS_REPORT_STATUS
from django_filters.filters import CharFilter, DateFilter, TypedChoiceFilter
from indicator.models import Reportable
from utils.filters.constants import Boolean
from utils.filters.fields import CommaSeparatedListFilter

from .models import ProgrammeDocument, ProgressReport


class ProgrammeDocumentIndicatorFilter(django_filters.FilterSet):

    pd_statuses = CommaSeparatedListFilter(
        field_name='lower_level_outputs__cp_output__programme_document__status',
    )
    pds = CommaSeparatedListFilter(
        field_name='lower_level_outputs__cp_output__programme_document_id',
    )
    location = CharFilter(method='get_locations')
    blueprint__title = CharFilter(method='get_blueprint_title')
    incomplete = CharFilter(method='get_incomplete')
    report_partner_external = CommaSeparatedListFilter(
        field_name='indicator_reports__progress_report__programme_document__partner__external_id'
    )
    report_status = CommaSeparatedListFilter(
        field_name='indicator_reports__progress_report__status'
    )
    report_type = CommaSeparatedListFilter(
        field_name='indicator_reports__progress_report__report_type'
    )
    cp_output = CommaSeparatedListFilter(
        field_name='lower_level_outputs__cp_output__external_cp_output_id',
    )
    report_section = CommaSeparatedListFilter(
        field_name='lower_level_outputs__cp_output__programme_document__sections__external_id',
    )
    pd_ref_title = CharFilter(
        field_name='pd ref title',
        method='get_pd_ref_title',
        label='PD/Ref # title',
    )

    unicef_focal_points = CharFilter(method='get_unicef_focal_points')

    class Meta:
        model = Reportable
        fields = (
            'id', 'blueprint__title',
        )

    def get_locations(self, queryset, name, value):
        return queryset.filter(locations=value)

    def get_blueprint_title(self, queryset, name, value):
        return queryset.filter(blueprint__title__icontains=value)

    def get_incomplete(self, queryset, name, value):
        if value == Boolean.TRUE:
            return queryset.filter(
                lower_level_outputs__cp_output__programme_document__progress_reports__indicator_reports__submission_date__isnull=True  # noqa: E501
            )
        return queryset

    def get_activepdsonly(self, queryset, name, value):
        if value == Boolean.TRUE:
            return queryset.filter(lower_level_outputs__cp_output__programme_document__status=PD_STATUS.active)
        return queryset

    def get_pd_ref_title(self, queryset, name, value):
        return queryset.filter(
            Q(lower_level_outputs__cp_output__programme_document__reference_number__icontains=value) |
            Q(lower_level_outputs__cp_output__programme_document__title__icontains=value)
        )

    def get_unicef_focal_points(self, queryset, name, value):
        return queryset.filter(
            lower_level_outputs__cp_output__programme_document__unicef_focal_point__email__in=parse.unquote(
                value).split(',')  # noqa: E501
        ).distinct()


class ProgrammeDocumentFilter(django_filters.FilterSet):
    ref_title = CharFilter(method='get_reference_number_title')
    status = CommaSeparatedListFilter(field_name='status')
    location = CommaSeparatedListFilter(
        field_name='progress_reports__indicator_reports__indicator_location_data__location',
    )

    class Meta:
        model = ProgrammeDocument
        fields = ['ref_title', 'status', 'location']

    def get_reference_number_title(self, queryset, name, value):
        return queryset.filter(
            Q(reference_number__icontains=value) | Q(title__icontains=value)
        )


class ProgressReportFilter(django_filters.FilterSet):
    status = CharFilter(method='get_status')
    pd_ref_title = CharFilter(
        field_name='pd ref title',
        method='get_pd_ref_title',
        label='PD/Ref # title',
    )
    due_date = DateFilter(
        field_name='due date',
        method='get_due_date',
        label='Due date',
        input_formats=[settings.PRINT_DATA_FORMAT],
    )
    due = TypedChoiceFilter(
        field_name='due',
        choices=Boolean.CHOICES,
        coerce=strtobool,
        method='get_due_overdue_status',
        label='Show only due or overdue',
    )
    location = CharFilter(
        field_name='location',
        method='get_location',
        label='Location',
    )
    programme_document_ext = CharFilter(
        field_name='programme_document_ext',
        method='get_pd_ext',
        label='programme_document_ext',
    )
    section = CharFilter(field_name='section', method='get_section')
    cp_output = CharFilter(field_name='cp_output', method='get_cp_output')
    report_type = CharFilter(method='get_report_type')
    unicef_focal_points = CharFilter(method='get_unicef_focal_points')

    class Meta:
        model = ProgressReport
        fields = [
            'status', 'pd_ref_title', 'due_date', 'programme_document', 'programme_document__id',
            'programme_document__external_id', 'section', 'cp_output', 'report_type'
        ]

    def get_unicef_focal_points(self, queryset, name, value):
        return queryset.filter(
            programme_document__unicef_focal_point__email__in=parse.unquote(value).split(',')
        ).distinct()

    def get_status(self, queryset, name, value):
        return queryset.filter(status__in=parse.unquote(value).split(','))

    def get_pd_ext(self, queryset, name, value):
        return queryset.filter(programme_document__external_id=value)

    def get_section(self, queryset, name, value):
        return queryset.filter(programme_document__sections__external_id=value)

    def get_cp_output(self, queryset, name, value):
        return queryset.filter(programme_document__cp_outputs__external_cp_output_id=value)

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
        return queryset.filter(
            indicator_reports__indicator_location_data__location=value)

    def get_report_type(self, queryset, name, value):
        return queryset.filter(report_type__in=parse.unquote(value).split(','))
