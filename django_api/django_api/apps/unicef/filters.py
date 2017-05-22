from django.db.models import Q
import django_filters
from django_filters.filters import ChoiceFilter, CharFilter

from core.common import PD_LIST_REPORT_STATUS
from .models import ProgrammeDocument


class ProgrammeDocumentFilter(django_filters.FilterSet):
    ref_title = CharFilter(method='get_reference_number_title')
    report_status = ChoiceFilter(choices=PD_LIST_REPORT_STATUS)

    class Meta:
        model = ProgrammeDocument
        fields = ['ref_title', 'status', 'report_status']

    def get_reference_number_title(self, queryset, name, value):
        return queryset.filter(
            Q(reference_number__icontains=value) | Q(title__icontains=value)
        )
