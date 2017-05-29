from django.contrib.contenttypes.models import ContentType
from django.http import Http404
from rest_framework.response import Response
from rest_framework import status as statuses
from rest_framework.generics import ListAPIView, ListCreateAPIView
import django_filters
from core.permissions import IsAuthenticated
from core.paginations import SmallPagination
from unicef.models import LowerLevelOutput

from .models import IndicatorReport, Reportable
from .filters import PDReportsFilter
from .serializers import (
    PDReportsSerializer,
    IndicatorListSerializer,
)


class PDReportsAPIView(ListAPIView):

    serializer_class = PDReportsSerializer
    permission_classes = (IsAuthenticated, )
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = PDReportsFilter

    def get_queryset(self):
        from unicef.models import ProgrammeDocument
        try:
            pd = ProgrammeDocument.objects.get(pk=self.pd_id)
        except ProgrammeDocument.DoesNotExist:
            raise Http404
        pks = pd.reportable_queryset.values_list('indicator_reports__pk', flat=True)
        return IndicatorReport.objects.filter(id__in=pks)

    def list(self, request, pd_id, *args, **kwargs):
        """
        Get Programme Document Details by given pk.
        """
        self.pd_id = pd_id
        queryset = self.get_queryset()
        filtered = PDReportsFilter(request.GET, queryset=queryset)
        serializer = self.get_serializer(filtered.qs, many=True)
        return Response(serializer.data, status=statuses.HTTP_200_OK)


class IndicatorListCreateAPIView(ListCreateAPIView):
    """
    REST API endpoint to get a list of Indicator objects and to create a new Indicator object.
    """
    serializer_class = IndicatorListSerializer
    pagination_class = SmallPagination

    def get_queryset(self):
        return Reportable.objects.filter(indicator_reports__isnull=False, content_type=ContentType.objects.get_for_model(LowerLevelOutput))
