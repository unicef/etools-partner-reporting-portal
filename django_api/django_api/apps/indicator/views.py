from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404
from rest_framework.response import Response

from rest_framework import status
from rest_framework.generics import ListCreateAPIView, ListAPIView
from rest_framework.views import APIView

import django_filters.rest_framework

from core.permissions import IsAuthenticated
from core.paginations import SmallPagination
from unicef.models import LowerLevelOutput
from unicef.serializer import ProgressReportSerializer

from .serializers import IndicatorListSerializer, IndicatorLLoutputsSerializer, PDReportsSerializer
from .models import Reportable, IndicatorReport
from .filters import IndicatorFilter, PDReportsFilter


class PDReportsAPIView(ListAPIView):

    serializer_class = PDReportsSerializer
    pagination_class = SmallPagination
    permission_classes = (IsAuthenticated, )
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = PDReportsFilter

    def get_queryset(self):
        from unicef.models import ProgrammeDocument

        pd = get_object_or_404(ProgrammeDocument, pk=self.pd_id)

        pks = pd.reportable_queryset.values_list('indicator_reports__pk', flat=True)
        return IndicatorReport.objects.filter(id__in=pks)

    def list(self, request, pd_id, *args, **kwargs):
        """
        Get Programme Document Details by given pk.
        """
        self.pd_id = pd_id
        queryset = self.get_queryset()
        filtered = PDReportsFilter(request.GET, queryset=queryset)

        page = self.paginate_queryset(filtered.qs)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(filtered.qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class IndicatorListCreateAPIView(ListCreateAPIView):
    """
    REST API endpoint to get a list of Indicator objects and to create a new Indicator object.

    List filtering keywords:
    - locations (A comma-separated location id list)
    - pds (A comma-separated programme document id list)
    - pd_statuses (A comma-separated PD_STATUS string list)
    - blueprint__title (string as Indicator title)

    Filtering list Example:
     - /api/indicator/?blueprint__title=indicator_blueprint_0
     - /api/indicator/&locations=20,21,24&blueprint__title=indicator_blueprint_17
     - /api/indicator?pds=37,63,65
    """
    serializer_class = IndicatorListSerializer
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = IndicatorFilter

    def get_queryset(self):
        return Reportable.objects.filter(indicator_reports__isnull=False, content_type=ContentType.objects.get_for_model(LowerLevelOutput))


class IndicatorDataAPIView(APIView):

    permission_classes = (IsAuthenticated, )

    def get_queryset(self, id):
        return Reportable.objects.filter(
            indicator_reports__id=id,
            lower_level_outputs__isnull=False
        )

    def get_indicator_report(self, id):
        try:
            return IndicatorReport.objects.get(id=id)
        except IndicatorReport.DoesNotExist:
            return None

    def get_narrative_object(self, id):
        ir = self.get_indicator_report(id)
        return ir and ir.progress_report

    def get(self, request, ir_id, *args, **kwargs):
        ir = self.get_indicator_report(ir_id)
        narrative = self.get_narrative_object(ir_id)
        response = ProgressReportSerializer(narrative).data
        queryset = self.get_queryset(ir_id)
        serializer = IndicatorLLoutputsSerializer(queryset, many=True)

        response['outputs'] = serializer.data

        return Response(
            response,
            status=status.HTTP_200_OK
        )
