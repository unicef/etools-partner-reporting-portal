from rest_framework.generics import RetrieveAPIView, ListAPIView
from .models import Partner
from .serializer import (
    PartnerDetailsSerializer,
)


class PartnerDetailsAPIView(RetrieveAPIView):
    """
    Endpoint for getting Partner Details for overview tab.
    """
    queryset = Partner.objects.all()
    serializer_class = PartnerDetailsSerializer
    # permission_classes = (IsAuthenticated, )  # current version without logged in
