from django.shortcuts import render

from rest_framework.generics import ListCreateAPIView

from .serializers import IndicatorListSerializer
from .models import Reportable


class IndicatorListCreateAPIView(ListCreateAPIView):
    """
    REST API endpoint to get a list of Indicator objects and to create a new Indicator object.
    """
    queryset = Reportable.objects.all()
    serializer_class = IndicatorListSerializer
