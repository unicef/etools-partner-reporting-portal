import operator

from django.db.models import Q
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.generics import ListCreateAPIView, ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response

import django_filters.rest_framework

from core.permissions import IsAuthenticated
from core.paginations import SmallPagination

from .serializers import IndicatorListSerializer, IndicatorReportListSerializer, PDReportsSerializer
from .filters import IndicatorFilter, PDReportsFilter
from .models import IndicatorReport, Reportable


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
        queryset = Reportable.objects.filter(lower_level_outputs__reportables__isnull=False)

        q_list = []

        locations = self.request.query_params.get('locations', None)
        pds = self.request.query_params.get('pds', None)

        pd_active = self.request.query_params.get('pd_active', None)
        if pd_active and int(pd_active) == 1:
            pd_active = True
        else:
            pd_active = False

        # TODO: Create Cluster List API endpoint when we start working on Cluster Reporting
        clusters = self.request.query_params.get('clusters', None)
        pd_statuses = self.request.query_params.get('pd_statuses', None)

        if locations:
            location_list = map(lambda item: int(item), filter(lambda item: item != '', locations.split(',')))
            q_list.append(Q(locations__id__in=location_list))

        if pds:
            pd_list = map(lambda item: int(item), filter(lambda item: item != '', pds.split(',')))
            q_list.append(Q(lower_level_outputs__indicator__programme_document__id__in=pd_list))

        if not pd_active and pd_statuses:
            pd_status_list = map(lambda item: item, filter(lambda item: item != '', pd_statuses.split(',')))
            q_list.append(Q(lower_level_outputs__indicator__programme_document__status__in=pd_status_list))

        if pd_active:
            q_list.append(Q(lower_level_outputs__indicator__programme_document__status="Act"))

        if clusters:
            cluster_list = map(lambda item: int(item), filter(lambda item: item != '', clusters.split(',')))
            q_list.append(Q(cluster_activities__cluster__id__in=cluster_list))

        if q_list:
            queryset = queryset.filter(reduce(operator.or_, q_list))

        return queryset


class IndicatorReportListAPIView(APIView):
    """
    REST API endpoint to get a list of IndicatorReport objects, including each set of disaggregation data per report.
    """

    def get_queryset(self, pk):
        reportable = get_object_or_404(Reportable, pk=pk)

        indicator_reports = reportable.indicator_reports.all().order_by('-time_period_start')

        if 'limit' in self.request.query_params:
            limit = self.request.query_params.get('limit', 2)
            indicator_reports = indicator_reports[:limit]

        return indicator_reports

    def get(self, request, pk, format='json'):
        indicator_reports = self.get_queryset(pk)

        serializer = IndicatorReportListSerializer(indicator_reports, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
