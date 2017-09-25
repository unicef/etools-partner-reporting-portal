from django.db.models import Q
from django.shortcuts import get_object_or_404

import django_filters
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import status as statuses

from .permissions import IsAuthenticated
from .models import Workspace, Location, ResponsePlan
from .serializers import (
    WorkspaceSerializer,
    ShortLocationSerializer,
    ChildrenLocationSerializer,
    ResponsePlanSerializer,
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


class LocationListAPIView(ListAPIView):
    """
    Endpoint for getting all Location objects belonging to the response plan.
    """
    permission_classes = (IsAuthenticated, )
    serializer_class = ShortLocationSerializer
    lookup_field = lookup_url_kwarg = 'response_plan_id'

    def get_queryset(self):
        """
        Get the locations that belong to the countries contained by the
        workspace this reponse plan belongs to
        """
        response_plan_id = self.kwargs.get(self.lookup_field)
        response_plan = get_object_or_404(ResponsePlan, id=response_plan_id)
        result = response_plan.workspace.countries.all().values_list(
            'gateway_types__locations').distinct()
        pks = []
        [pks.extend(filter(lambda x: x is not None, part)) for part in result]
        return Location.objects.filter(pk__in=pks)


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
        return ResponsePlan.objects.filter(workspace_id=workspace_id)
