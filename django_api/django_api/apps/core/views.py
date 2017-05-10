from rest_framework.generics import RetrieveAPIView, ListAPIView, RetrieveUpdateAPIView

from .models import Country
from .serializer import SimpleCountrySerializer


class SimpleCountryAPIView(ListAPIView):
    """
    Updates a UserProfile object
    """
    queryset = Country.objects.all()
    serializer_class = SimpleCountrySerializer
    # permission_classes = (IsAuthenticated, )  # current version without logged in
