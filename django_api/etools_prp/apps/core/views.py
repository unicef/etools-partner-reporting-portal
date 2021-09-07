import importlib

from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.views import View
from django.views.generic import RedirectView, TemplateView

import django_filters
from django_celery_beat.models import PeriodicTask
from etools_prp.apps.core.common import (
    CURRENCIES,
    DISPLAY_CLUSTER_TYPES,
    PARTNER_PROJECT_STATUS,
    PRP_CLUSTER_ROLE_TYPES,
    PRP_IP_ROLE_TYPES,
)
from etools_prp.apps.core.paginations import SmallPagination
from etools_prp.apps.id_management.permissions import RoleGroupCreateUpdateDestroyPermission
from etools_prp.apps.utils.serializers import serialize_choices
from rest_framework import status as statuses
from rest_framework.exceptions import ValidationError
from rest_framework.generics import CreateAPIView, DestroyAPIView, GenericAPIView, ListAPIView, UpdateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import LocationFilter
from .models import Location, PRPRole, ResponsePlan, Workspace
from .permissions import AnyPermission, IsAuthenticated, IsClusterSystemAdmin, IsIMOForCurrentWorkspace, IsSuperuser
from .serializers import (
    ChildrenLocationSerializer,
    CreateResponsePlanSerializer,
    PRPRoleCreateMultipleSerializer,
    PRPRoleUpdateSerializer,
    ResponsePlanSerializer,
    ShortLocationSerializer,
    WorkspaceSerializer,
)


class WorkspaceAPIView(ListAPIView):
    """
    Endpoint for getting Workspace.
    Workspace need to have defined location to be displayed on drop down menu.
    """
    serializer_class = WorkspaceSerializer
    permission_classes = (IsAuthenticated, )
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_fields = ('business_area_code', 'workspace_code')

    def get_queryset(self):
        """
        Only return workspaces that the user is associated with.
        """
        return Workspace.objects.user_workspaces(self.request.user).prefetch_related('countries').distinct()


class LocationListAPIView(ListAPIView):
    """
    Endpoint for getting all Location objects belonging to the response plan.
    """
    permission_classes = (IsAuthenticated, )
    pagination_class = SmallPagination
    serializer_class = ShortLocationSerializer
    lookup_field = lookup_url_kwarg = 'response_plan_id'
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = LocationFilter

    def get_queryset(self):
        """
        Get the locations that belong to the countries contained by the
        workspace this reponse plan belongs to
        """
        response_plan_id = self.kwargs.get(self.lookup_field)
        response_plan = get_object_or_404(ResponsePlan, id=response_plan_id)
        return response_plan.workspace.locations


class ChildrenLocationAPIView(ListAPIView):
    """
    Endpoint for fill location parameter on PD list filterset.
    """
    serializer_class = ChildrenLocationSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        # IMO we want to display via Country -> Region and/or City and/or District and/or Point
        # That should be enough.
        return Location.objects.filter(
            Q(parent_id=self.location_id) |
            Q(parent__parent_id=self.location_id) |
            Q(parent__parent__parent_id=self.location_id) |
            Q(parent__parent__parent__parent_id=self.location_id)
        )

    def list(self, request, location_id, *args, **kwargs):
        self.location_id = location_id
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            serializer.data,
            status=statuses.HTTP_200_OK
        )


class ResponsePlanAPIView(ListAPIView):
    """
    Endpoint for getting ResponsePlan.
    ResponsePlan need to have defined of intervention to be displayed on drop down menu.
    """

    serializer_class = ResponsePlanSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        workspace_id = self.kwargs.get('workspace_id')

        queryset = ResponsePlan.objects.filter(workspace_id=workspace_id)

        if self.request.user.is_cluster_system_admin:
            return queryset.distinct()

        return queryset.filter(clusters__prp_roles__user=self.request.user).distinct()


class ResponsePlanCreateAPIView(CreateAPIView):
    """
    REST API endpoint to create Response Plan
    """

    serializer_class = CreateResponsePlanSerializer
    permission_classes = (
        AnyPermission(
            IsClusterSystemAdmin,
            IsIMOForCurrentWorkspace,
        ),
    )


class ConfigurationAPIView(APIView):

    # kept public on purpose
    permission_classes = ()

    def get(self, request):
        return Response({
            'CLUSTER_TYPE_CHOICES': serialize_choices(DISPLAY_CLUSTER_TYPES),
            'PARTNER_PROJECT_STATUS_CHOICES': serialize_choices(PARTNER_PROJECT_STATUS),
        })


class TaskTriggerAPIView(APIView):
    """
    TaskTriggerAPIView manually triggers a celery periodic task
    for superuser purposes.

    Raises:
        ValidationError -- GET parameter task_name is not present
        ValidationError -- GET parameter business_area_code is not numeric
        ValidationError -- Given celery task does not exist
        ValidationError -- Celery task python path fails to load

    Returns:
        rest_framework.response.Response -- REST API response object
    """

    permission_classes = (IsSuperuser,)

    def get(self, request):
        if 'task_name' not in request.GET:
            raise ValidationError("task_name is required")

        task_name = request.GET['task_name']
        business_area_code = request.GET.get('business_area_code', None)

        if business_area_code:
            if not business_area_code.isdigit():
                raise ValidationError('business_area_code must be digit only')
            else:
                business_area_code = int(business_area_code)

        if not PeriodicTask.objects.filter(task=task_name).exists():
            raise ValidationError('No task is found with name: ' + task_name)

        try:
            # Dynamic task module load
            module_path_name, function_name = task_name.rsplit('.', 1)
            module = importlib.import_module(module_path_name)
            task_func = getattr(module, function_name)
            task_func = task_func.delay
        except Exception:
            raise ValidationError('ERROR loading the task function: ' + task_name)

        # Execute the task!
        if not business_area_code:
            task_func()
        else:
            if task_name == 'partner.tasks.process_partners':
                task_func(area=business_area_code)

            elif task_name == 'unicef.tasks.process_programme_documents':
                task_func(fast=True, area=business_area_code)
            else:
                task_func()

        return Response({
            'task_name': task_name,
            'status': 'started'
        })


class PRPRoleUpdateDestroyAPIView(UpdateAPIView, DestroyAPIView, GenericAPIView):
    serializer_class = PRPRoleUpdateSerializer
    permission_classes = (IsAuthenticated, RoleGroupCreateUpdateDestroyPermission)
    queryset = PRPRole.objects.select_related('user', 'workspace', 'cluster')

    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        instance.send_email_notification(deleted=True)


class PRPRoleCreateAPIView(CreateAPIView):
    serializer_class = PRPRoleCreateMultipleSerializer
    permission_classes = (IsAuthenticated, RoleGroupCreateUpdateDestroyPermission)

    def perform_create(self, serializer):
        user_id = serializer.validated_data['user_id']

        for prp_role_data in serializer.validated_data['prp_roles']:
            self.check_object_permissions(self.request, obj=PRPRole(user_id=user_id, **prp_role_data))
        super().perform_create(serializer)


class CurrenciesView(APIView):
    def get(self, request):
        return Response([(k, v) for k, v in CURRENCIES])


class HomeView(LoginRequiredMixin, RedirectView):

    def get_redirect_url(self, *args, **kwargs):
        user = self.request.user
        if user.prp_roles.filter(role__in=[item for item, _, in PRP_IP_ROLE_TYPES]):
            redirect_page = '/ip'
        elif user.prp_roles.filter(role__in=[item for item, _, in PRP_CLUSTER_ROLE_TYPES]):
            redirect_page = '/cluster'
        else:
            redirect_page = '/unauthorized'
        return redirect_page


class RedirectAppView(LoginRequiredMixin, View):

    def get(self, request, *args, **kwargs):
        url = self.get_redirect_url(request, *args, **kwargs)
        return HttpResponseRedirect(url)

    def get_redirect_url(self, request, *args, **kwargs):
        path = request.path
        if "cluster" in path:
            new_path = path.replace("app", "cluster", 1)
        else:
            new_path = path.replace("app", "ip", 1)
        return new_path


class UnauthorizedView(TemplateView):
    template_name = 'unauthorized.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['unicef_user'] = self.request.user.is_authenticated and self.request.user.email.endswith('@unicef.org')
        return context


# TODO import from unicef-security
class SocialLogoutView(RedirectView):

    def get_redirect_url(self, *args, **kwargs):
        return f'https://{settings.TENANT_B2C_URL}/{settings.TENANT_ID}.onmicrosoft.com/{settings.POLICY}/oauth2/' \
               f'v2.0/logout?post_logout_redirect_uri={settings.FRONTEND_HOST}{settings.LOGOUT_URL}'
