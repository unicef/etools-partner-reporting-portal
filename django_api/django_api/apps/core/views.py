from rest_framework.generics import ListAPIView

from .models import Intervention, Location
from .serializer import (
    SimpleInterventionSerializer,
    SimpleLocationSerializer
)


class SimpleInterventionAPIView(ListAPIView):
    """
    Endpoint for getting Intervention to make dropdown menu with countries and interventions.
    """
    queryset = Intervention.objects.all()
    serializer_class = SimpleInterventionSerializer
    # permission_classes = (IsAuthenticated, )  # current version without logged in


class SimpleLocationListAPIView(ListAPIView):
    """
    Endpoint for getting all Location objects.
    """
    queryset = Location.objects.all()
    serializer_class = SimpleLocationSerializer
