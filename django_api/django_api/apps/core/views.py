from rest_framework.generics import ListAPIView
from .permissions import IsAuthenticated
from .models import Intervention
from .serializer import (
    SimpleInterventionSerializer,
)


class SimpleInterventionAPIView(ListAPIView):
    """
    Endpoint for getting Intervention.
    Intervention need to have defined location to be displayed on drop down menu.
    """
    queryset = Intervention.objects.filter(locations__isnull=False)
    serializer_class = SimpleInterventionSerializer
    permission_classes = (IsAuthenticated, )
