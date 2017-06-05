from django.db.models import Q
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import status as statuses
from .permissions import IsAuthenticated
from .models import Intervention, Location
from .serializer import (
    SimpleInterventionSerializer,
    ChildrenLocationSerializer,
)


class SimpleInterventionAPIView(ListAPIView):
    """
    Endpoint for getting Intervention.
    Intervention need to have defined location to be displayed on drop down menu.
    """
    queryset = Intervention.objects.filter(locations__isnull=False)
    serializer_class = SimpleInterventionSerializer
    permission_classes = (IsAuthenticated, )


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
