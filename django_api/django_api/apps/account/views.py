from django.contrib.auth import login, logout
from django.db.models import Prefetch, Q

from rest_framework import status as statuses
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.generics import RetrieveAPIView, ListCreateAPIView, DestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

import django_filters
from drfpasswordless.utils import authenticate_by_token

from core.common import PRP_ROLE_TYPES
from core.models import PRPRole
from core.paginations import SmallPagination
from core.permissions import IsAuthenticated
from id_management.permissions import UserDeactivatePermission
from utils.emails import send_email_from_template

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

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data, status=statuses.HTTP_200_OK)


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
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = UserFilter
    pagination_class = SmallPagination

    def get_queryset(self):
        portal_choice = self.request.query_params.get('portal')

        user = self.request.user
        user_prp_roles = set(user.prp_roles.values_list('role', flat=True).distinct())

        users_queryset = User.objects.exclude(id=user.id)

        ip_users_access = {PRP_ROLE_TYPES.ip_authorized_officer, PRP_ROLE_TYPES.ip_admin}
        all_users_access = {PRP_ROLE_TYPES.cluster_system_admin, PRP_ROLE_TYPES.cluster_imo}

        if portal_choice == 'CLUSTER':
            if all_users_access.intersection(user_prp_roles):
                pass
            elif PRP_ROLE_TYPES.cluster_member in user_prp_roles:
                users_queryset = users_queryset.filter(partner_id__isnull=False, partner_id=user.partner_id)
            else:
                raise PermissionDenied()
        elif portal_choice == 'IP' and ip_users_access.intersection(user_prp_roles):
            user_workspaces = user.prp_roles.filter(
                role__in=ip_users_access
            ).values_list('workspace', flat=True).distinct()
            users_queryset = users_queryset.filter(Q(prp_roles__workspace__in=user_workspaces) |
                                                   Q(prp_roles__isnull=True),
                                                   partner_id__isnull=False, partner_id=user.partner_id)
        else:
            raise PermissionDenied()

        prp_roles_queryset = PRPRole.objects.select_related('workspace', 'cluster', 'cluster__response_plan',
                                                            'cluster__response_plan__workspace')
        prp_roles_prefetch = Prefetch('prp_roles', queryset=prp_roles_queryset)

        return users_queryset.select_related('profile', 'partner').prefetch_related(prp_roles_prefetch)


class UserDeactivateAPIView(DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = (IsAuthenticated, UserDeactivatePermission)

    def send_email_notification(self, user):
        send_email_from_template(
            subject_template_path='emails/ip/notify_on_delete_cso_user_subject.txt',
            body_template_path='emails/ip/notify_on_delete_cso_user.html',
            template_data={'user': user, 'training_materials_url': '#'},  # TBD
            to_email_list=[user.email],
            content_subtype='html'
        )

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
        self.send_email_notification(instance)
