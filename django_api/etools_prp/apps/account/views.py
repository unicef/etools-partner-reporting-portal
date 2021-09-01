from django.conf import settings
from django.contrib.auth import login, logout
from django.db.models import Count, Prefetch, Q
from django.http import HttpResponseRedirect

import django_filters
from drfpasswordless.utils import authenticate_by_token
from rest_framework import status as statuses
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.filters import OrderingFilter
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from etools_prp.apps.core.common import PRP_ROLE_TYPES
from etools_prp.apps.core.models import PRPRole
from etools_prp.apps.core.paginations import SmallPagination
from etools_prp.apps.core.permissions import IsAuthenticated

from .filters import UserFilter
from .models import User
from .serializers import UserSerializer, UserWithPRPRolesSerializer


class UserProfileAPIView(RetrieveAPIView):
    """
    User Profile API - GET
    Authentication required.

    Returns:
        UserSerializer object.
    """
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated, )

    def get_object(self):
        prefetch_queryset = PRPRole.objects.select_related('workspace', 'cluster', 'cluster__response_plan',
                                                           'cluster__response_plan__workspace')
        prefetch_prp_roles = Prefetch('prp_roles', queryset=prefetch_queryset)
        queryset = User.objects.select_related('profile', 'partner').prefetch_related(prefetch_prp_roles)
        return queryset.get(id=self.request.user.id)


class UserLogoutAPIView(APIView):
    """
    User Logout API - POST

    Returns:
        Empty response.
    """
    # permission_classes = (IsAuthenticated, )

    def post(self, request, *args, **kwargs):
        logout(request)
        return Response({}, status=statuses.HTTP_200_OK)

    def get(self, request, *args, **kwargs):
        logout(request)
        return HttpResponseRedirect(settings.LOGIN_URL)


class LoginUserWithTokenAPIView(APIView):
    """
    User Login API - POST

    Logs in user via token authentication.
    Taken from https://github.com/aaronn/django-rest-framework-passwordless/blob/master/drfpasswordless/views.py#L121

    Returns:
        JSON response.
    """
    permission_classes = []

    def post(self, request, *args, **kwargs):
        user = authenticate_by_token(request.data.get('token', None))
        if user:
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            return Response({'success': True})
        else:
            raise ValidationError('Couldn\'t log you in. Invalid token.')


class UserListCreateAPIView(ListCreateAPIView):
    serializer_class = UserWithPRPRolesSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, OrderingFilter)
    filter_class = UserFilter
    pagination_class = SmallPagination
    ordering_fields = ('last_login', 'first_name', 'last_name', 'partner')

    def custom_ordering(self, queryset):
        ordering = self.request.query_params.get('ordering')

        if ordering == 'status':
            return queryset.order_by('last_login', 'role_count')

        if ordering == '-status':
            return queryset.order_by('-last_login', '-role_count')

        return queryset

    def get_queryset(self):
        portal_choice = self.request.query_params.get('portal')

        user = self.request.user
        user_prp_roles = set(user.role_list)

        users_queryset = User.objects.exclude(id=user.id).annotate(role_count=Count('prp_roles')).order_by('-id')

        ip_users_access = {PRP_ROLE_TYPES.ip_authorized_officer, PRP_ROLE_TYPES.ip_admin}
        all_users_access = {PRP_ROLE_TYPES.cluster_system_admin, PRP_ROLE_TYPES.cluster_imo}

        cluster_roles = (
                PRP_ROLE_TYPES.cluster_system_admin,
                PRP_ROLE_TYPES.cluster_imo,
                PRP_ROLE_TYPES.cluster_member,
                PRP_ROLE_TYPES.cluster_coordinator,
                PRP_ROLE_TYPES.cluster_viewer,
            )

        if portal_choice == 'CLUSTER':
            roles_in = cluster_roles
            if all_users_access.intersection(user_prp_roles):
                pass
            elif PRP_ROLE_TYPES.cluster_member in user_prp_roles:
                users_queryset = users_queryset.filter(partner_id__isnull=False, partner_id=user.partner_id)
            else:
                raise PermissionDenied()
        elif portal_choice == 'IP' and ip_users_access.intersection(user_prp_roles):
            roles_in = (
                PRP_ROLE_TYPES.ip_authorized_officer,
                PRP_ROLE_TYPES.ip_admin,
                PRP_ROLE_TYPES.ip_viewer,
                PRP_ROLE_TYPES.ip_editor,
            )
            user_workspaces = user.prp_roles.filter(
                role__in=ip_users_access
            ).values_list('workspace', flat=True).distinct()
            users_queryset = users_queryset.filter(Q(prp_roles__workspace__in=user_workspaces) |
                                                   Q(prp_roles__isnull=True) |
                                                   Q(prp_roles__role__in=cluster_roles),
                                                   partner_id__isnull=False, partner_id=user.partner_id)
        else:
            raise PermissionDenied()

        prp_roles_queryset = PRPRole.objects.filter(role__in=roles_in).select_related(
            'workspace', 'cluster', 'cluster__response_plan', 'cluster__response_plan__workspace')
        prp_roles_prefetch = Prefetch('prp_roles', queryset=prp_roles_queryset)

        users_queryset = self.custom_ordering(users_queryset)

        return users_queryset.select_related('profile', 'partner').prefetch_related(prp_roles_prefetch)
