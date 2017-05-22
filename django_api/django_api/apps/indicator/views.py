from django.shortcuts import render
from django.contrib.contenttypes.models import ContentType

from rest_framework.generics import ListCreateAPIView
import django_filters.rest_framework

from core.paginations import SmallPagination
from unicef.models import LowerLevelOutput

from .serializers import IndicatorListSerializer
from .filters import IndicatorFilter
from .models import Reportable


class IndicatorListCreateAPIView(ListCreateAPIView):
    """
    REST API endpoint to get a list of Indicator objects and to create a new Indicator object.
    """
    serializer_class = IndicatorListSerializer
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = IndicatorFilter

    def get_queryset(self):
        queryset = Reportable.objects.filter(indicator_reports__isnull=False, content_type=ContentType.objects.get_for_model(LowerLevelOutput))

        return queryset
