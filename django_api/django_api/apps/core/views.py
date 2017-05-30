from rest_framework.generics import ListAPIView

from .permissions import IsAuthenticated
from .models import Intervention, Location
from .serializer import (
    SimpleInterventionSerializer,
    SimpleLocationSerializer
)


class SimpleInterventionAPIView(ListAPIView):
    """
    Endpoint for getting Intervention.
    Intervention need to have defined location to be displayed on drop down menu.
    """
    queryset = Intervention.objects.prefetch_related('locations').filter(locations__isnull=False).distinct()
    serializer_class = SimpleInterventionSerializer
    permission_classes = (IsAuthenticated, )


class SimpleLocationListAPIView(ListAPIView):
    """
    Endpoint for getting all Location objects.
    """
    queryset = Location.objects.all()
    serializer_class = SimpleLocationSerializer
