import operator

from django.db.models import Q
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

        # TODO: Create Cluster List API endpoint when we start working on Cluster Reporting
        clusters = self.request.query_params.get('clusters', None)
        pd_statuses = self.request.query_params.get('pd_statuses', None)

        if locations:
            location_list = map(lambda item: int(item), filter(lambda item: item != '', locations.split(',')))
            q_list.append(Q(locations__id__in=location_list))

        if pds:
            pd_list = map(lambda item: int(item), filter(lambda item: item != '', pds.split(',')))
            q_list.append(Q(lower_level_outputs__indicator__programme_document__id__in=pd_list))

        if clusters:
            cluster_list = map(lambda item: int(item), filter(lambda item: item != '', clusters.split(',')))
            q_list.append(Q(cluster_activities__cluster__id__in=cluster_list))

        if pd_statuses:
            pd_status_list = map(lambda item: int(item), filter(lambda item: item != '', pd_statuses.split(',')))
            q_list.append(Q(lower_level_outputs__indicator__programme_document__status__in=pd_status_list))

        if q_list:
            queryset = queryset.filter(reduce(operator.or_, q_list))

        return queryset
