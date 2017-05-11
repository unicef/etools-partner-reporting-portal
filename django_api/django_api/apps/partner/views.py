from rest_framework.generics import RetrieveAPIView, ListAPIView
from .models import Partner
from .serializer import (
    #SimpleCountrySerializer,
    PartnerDetailsSerializer,
)


# class SimpleCountryAPIView(ListAPIView):
#     """
#     Endpoint for getting Countries of Intervention.
#     """
#     queryset = Country.objects.all()
#     serializer_class = SimpleCountrySerializer
#     # permission_classes = (IsAuthenticated, )  # current version without logged in


class PartnerDetailsAPIView(RetrieveAPIView):
    """
    Endpoint for getting Parnter Details for overview tab.
    """
    queryset = Partner.objects.all()
    serializer_class = PartnerDetailsSerializer
    # permission_classes = (IsAuthenticated, )  # current version without logged in
