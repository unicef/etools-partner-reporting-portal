from rest_framework.generics import ListAPIView
from .models import Intervention
from .serializer import (
    SimpleInterventionSerializer,
)


class SimpleInterventionAPIView(ListAPIView):
    """
    Endpoint for getting Intervention to make dropdown menu with countries and interventions.
    """
    queryset = Intervention.objects.all()
    serializer_class = SimpleInterventionSerializer
    # permission_classes = (IsAuthenticated, )  # current version without logged in
