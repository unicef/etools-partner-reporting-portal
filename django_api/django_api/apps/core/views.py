import importlib

from django.db.models import Q
from django.shortcuts import get_object_or_404

import django_filters
from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.response import Response
from rest_framework import status as statuses
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError

from djcelery.models import PeriodicTask

from core.common import DISPLAY_CLUSTER_TYPES, PARTNER_PROJECT_STATUS
from utils.serializers import serialize_choices
from .filters import LocationFilter
from .permissions import IsAuthenticated, IsIMOForCurrentWorkspace, IsSuperuser
from .models import Workspace, Location, ResponsePlan
from .serializers import (
    WorkspaceSerializer,
    ShortLocationSerializer,
    ChildrenLocationSerializer,
    ResponsePlanSerializer,
    CreateResponsePlanSerializer,
)


class WorkspaceAPIView(ListAPIView):
    """
    Endpoint for getting Workspace.
    Workspace need to have defined location to be displayed on drop down menu.
    """
    queryset = Workspace.objects.prefetch_related('countries').distinct()
    serializer_class = WorkspaceSerializer
    permission_classes = (IsAuthenticated, )
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_fields = ('business_area_code', 'workspace_code')

    def list(self, request, *args, **kwargs):
        """
        Only return workspaces that the user is associated with.
        """
        queryset = request.user.workspaces.all()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            serializer.data,
            status=statuses.HTTP_200_OK
        )


class LocationListAPIView(ListAPIView):
    """
    Endpoint for getting all Location objects belonging to the response plan.
    """
    permission_classes = (IsAuthenticated, )
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

        if self.request.user.partner:
            queryset = queryset.filter(clusters__partners=self.request.user.partner).distinct()

        return queryset


class ResponsePlanCreateAPIView(CreateAPIView):
    """
    REST API endpoint to create Response Plan
    """

    serializer_class = CreateResponsePlanSerializer
    permission_classes = (IsIMOForCurrentWorkspace, )


class ConfigurationAPIView(APIView):

    # kept public on purpose
    permission_classes = ()

    def get(self, request):
        return Response({
            'CLUSTER_TYPE_CHOICES': serialize_choices(DISPLAY_CLUSTER_TYPES),
            'PARTNER_PROJECT_STATUS_CHOICES': serialize_choices(PARTNER_PROJECT_STATUS),
        })


class TaskTriggerAPIView(APIView):

    # kept public on purpose
    permission_classes = (IsSuperuser,)

    def get(self, request):
        if 'task_name' not in request.GET:
            raise ValidationError("task_name is required")

        task_name = request.GET['task_name']
        arguments = list()

        if 'arguments' in request.GET:
            arguments = request.GET['arguments'].split(",")

        try:
            task = PeriodicTask.objects.get(name=task_name)
        except PeriodicTask.DoesNotExist:
            raise ValidationError("No task is found with name: " + task_name)

        module_path_name, function_name = task_name.rsplit('.', 1)
        module = importlib.import_module(module_path_name)
        task_func = getattr(module, function_name)

        # Execute the task!
        task_func(*arguments)

        return Response({
            'task_name': task_name,
            'status': 'scheduled'
        })
