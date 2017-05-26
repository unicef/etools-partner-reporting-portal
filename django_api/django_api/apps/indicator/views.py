import operator

from django.db.models import Q
from django.shortcuts import render, get_object_or_404
from django.contrib.contenttypes.models import ContentType

from rest_framework import status
from rest_framework.generics import ListCreateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response

import django_filters.rest_framework

from core.paginations import SmallPagination
from unicef.models import LowerLevelOutput

from .serializers import IndicatorListSerializer, IndicatorReportListSerializer
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
        queryset = Reportable.objects.filter(lower_level_outputs__reportables__isnull=False)

        q_list = []

        locations = self.request.query_params.get('locations', None)
        pds = self.request.query_params.get('pds', None)

        # TODO: Create Cluster List API endpoint when we start working on Cluster Reporting
        clusters = self.request.query_params.get('clusters', None)
        # TODO: Turn this back on when feature-pd-list branch is merged
        # pd_statuses = self.request.query_params.get('pd_statuses', None)

        if locations:
            location_list = map(lambda item: int(item), filter(lambda item: item != '', locations.split(',')))
            q_list.append(Q(locations__id__in=location_list))

        if pds:
            pd_list = map(lambda item: int(item), filter(lambda item: item != '', pds.split(',')))
            q_list.append(Q(lower_level_outputs__indicator__programme_document__id__in=pd_list))

        if clusters:
            cluster_list = map(lambda item: int(item), filter(lambda item: item != '', clusters.split(',')))
            q_list.append(Q(cluster_activities__cluster__id__in=cluster_list))

        # if pd_statuses:
            # pd_status_list = map(lambda item: int(item), filter(lambda item: item != '', pd_statuses.split(',')))
        #     q_list.append(Q(lower_level_outputs__indicator__programme_document__status__in=pd_status_list))

        if q_list:
            queryset = queryset.filter(reduce(operator.and_, q_list))

        return queryset


class IndicatorReportListAPIView(APIView):
    """
    REST API endpoint to get a list of IndicatorReport objects, including each set of disaggregation data per report.
    """

    def get_queryset(self, pk):
        reportable = get_object_or_404(Reportable, pk=pk)

        indicator_reports = reportable.indicator_reports.all().order_by('-time_period_start')

        if 'limit' in self.request.query_params:
            indicator_reports = indicator_reports[:2]

        return indicator_reports

    def get(self, request, pk, format='json'):
        indicator_reports = self.get_queryset(pk)

        serializer = IndicatorReportListSerializer(indicator_reports, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
