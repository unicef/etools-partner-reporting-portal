from django.db.models import Q, Value
from django.db.models.functions import Concat

import django_filters
from django_filters.filters import CharFilter

from utils.filters.fields import CommaSeparatedListFilter

from .models import User


class UserFilter(django_filters.FilterSet):
    name_email = CharFilter(method='get_name_email')
    roles = CommaSeparatedListFilter(name='prp_roles__role')
    partners = CommaSeparatedListFilter(name='partner_id')
    clusters = CommaSeparatedListFilter(name='prp_roles__cluster_id')
    workspaces = CommaSeparatedListFilter(name='prp_roles__workspace_id')

    class Meta:
        model = User
        fields = []

    def get_name_email(self, queryset, name, value):
        queryset = queryset.annotate(name=Concat('first_name', Value(' '), 'last_name'))
        return queryset.filter(Q(name__icontains=value) | Q(email__icontains=value))
