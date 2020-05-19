import operator
from functools import reduce
from urllib import parse

from django.db.models import Q, Value
from django.db.models.functions import Concat

import django_filters
from core.common import USER_STATUS_TYPES
from django_filters.filters import CharFilter
from utils.filters.fields import CommaSeparatedListFilter

from .models import User


class UserFilter(django_filters.FilterSet):
    name_email = CharFilter(method='get_name_email')
    status = CharFilter(method='get_status')
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

    def get_status(self, queryset, name, value):
        statuses = parse.unquote(value).split(',')
        status_to_q = {
            USER_STATUS_TYPES.active: Q(is_active__isnull=False, last_login__isnull=False, prp_roles__isnull=False),
            USER_STATUS_TYPES.invited: Q(is_active__isnull=False, last_login__isnull=True, prp_roles__isnull=False),
            USER_STATUS_TYPES.incomplete: Q(prp_roles__isnull=True)
        }
        return queryset.filter(reduce(
            operator.or_, [status_to_q.get(status, Q()) for status in statuses]
        ))
