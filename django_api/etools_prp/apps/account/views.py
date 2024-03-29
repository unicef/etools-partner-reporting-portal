from django.conf import settings
from django.contrib.auth import login, logout
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Count, Prefetch, Q
from django.http import HttpResponseRedirect
from django.utils.translation import gettext_lazy as _

import django_filters
from drfpasswordless.utils import authenticate_by_token
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.filters import OrderingFilter
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from etools_prp.apps.core.common import PRP_ROLE_TYPES
from etools_prp.apps.core.models import Realm, Workspace
from etools_prp.apps.core.paginations import SmallPagination
from etools_prp.apps.core.permissions import IsAuthenticated

from ..partner.models import Partner
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
        prp_roles_queryset = Realm.objects.filter(user=self.request.user).select_related('workspace')
        prp_roles_prefetch = Prefetch('realms', queryset=prp_roles_queryset)

        queryset = User.objects.select_related('profile', 'partner').prefetch_related(prp_roles_prefetch)
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
        return Response({}, status=status.HTTP_200_OK)

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
            return queryset.order_by('last_login', 'realm_count')

        if ordering == '-status':
            return queryset.order_by('-last_login', '-realm_count')

        return queryset

    def get_queryset(self):
        portal_choice = self.request.query_params.get('portal')

        user = self.request.user
        user_prp_roles = set(user.role_list)

        users_queryset = User.objects.exclude(id=user.id).annotate(realm_count=Count('realms')).order_by('-id')

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
                name__in=ip_users_access
            ).values_list('realms__workspace', flat=True).distinct()

            users_queryset = users_queryset.filter(
                Q(realms__workspace__in=user_workspaces) |
                Q(realms__isnull=True) |
                Q(realms__group__name__in=cluster_roles),
                partner_id__isnull=False, partner_id=user.partner_id)
        else:
            raise PermissionDenied()

        prp_roles_queryset = Realm.objects.filter(group__name__in=roles_in).select_related('workspace')
        prp_roles_prefetch = Prefetch('realms', queryset=prp_roles_queryset)

        users_queryset = self.custom_ordering(users_queryset)

        return users_queryset.select_related('profile', 'partner').prefetch_related(prp_roles_prefetch)


class ChangeUserWorkspaceView(APIView):
    """
    Allows a user to switch workspace context if they have access to more than one
    """

    ERROR_MESSAGES = {
        'workspace_does_not_exist': 'The workspace that you are attempting to switch to does not exist',
        'access_to_workspace_denied': 'You do not have access to the workspace you are trying to switch to'
    }

    permission_classes = (IsAuthenticated, )

    def get_workspace(self):
        workspace_id = self.request.data.get('workspace', None)

        try:
            workspace = Workspace.objects.get(id=workspace_id)
        except Workspace.DoesNotExist:
            raise DjangoValidationError(self.ERROR_MESSAGES['workspace_does_not_exist'],
                                        code='workspace_does_not_exist')

        return workspace

    def change_workspace(self):
        user = self.request.user
        workspace = self.get_workspace()

        if workspace == user.workspace:
            return

        if workspace not in user.workspaces_available.all():
            raise DjangoValidationError(self.ERROR_MESSAGES['access_to_workspace_denied'],
                                        code='access_to_workspace_denied')
        user.workspace = workspace

        if user.partner not in Partner.objects\
                .filter(realms__workspace=workspace, realms__user=user):
            user.partner = None
        user.save(update_fields=['workspace', 'partner'])

    def post(self, request, format=None):
        try:
            self.change_workspace()

        except DjangoValidationError as err:
            if err.code == 'access_to_workspace_denied':
                status_code = status.HTTP_403_FORBIDDEN
            else:
                status_code = status.HTTP_400_BAD_REQUEST
            return Response(err, status=status_code)

        return Response(status=status.HTTP_204_NO_CONTENT)


class ChangeUserPartnerView(APIView):
    """
    Allows a user to switch partner context if they have access to more than one
    """

    ERROR_MESSAGES = {
        'partner_does_not_exist': _('The partner that you are attempting to switch to does not exist'),
        'access_to_partner_denied': _('You do not have access to the partner you are trying to switch to')
    }

    permission_classes = (IsAuthenticated, )

    def get_partner(self):
        partner_id = self.request.data.get('partner', None)
        try:
            partner = Partner.objects.get(id=partner_id)
        except Partner.DoesNotExist:
            raise DjangoValidationError(
                self.ERROR_MESSAGES['partner_does_not_exist'],
                code='partner_does_not_exist'
            )
        return partner

    def change_partner(self):
        user = self.request.user
        partner = self.get_partner()

        if partner == user.partner:
            return

        if partner not in user.partners_available.all():
            raise DjangoValidationError(self.ERROR_MESSAGES['access_to_partner_denied'],
                                        code='access_to_partner_denied')

        user.partner = partner
        user.save(update_fields=['partner'])

    def post(self, request, format=None):
        try:
            self.change_partner()
        except DjangoValidationError as err:
            if err.code == 'access_to_partner_denied':
                status_code = status.HTTP_403_FORBIDDEN
            else:
                status_code = status.HTTP_400_BAD_REQUEST
            return Response(err, status=status_code)

        return Response(status=status.HTTP_204_NO_CONTENT)
