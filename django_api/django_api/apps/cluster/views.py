import logging

from django.db.models import Q
from django.http import Http404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView
from rest_framework import status as statuses, serializers

import django_filters

from core.permissions import IsAuthenticated
from core.paginations import SmallPagination
from indicator.serializers import ClusterIndicatorReportSerializer, ClusterIndicatorReportSimpleSerializer
from indicator.models import IndicatorReport
from .models import ClusterObjective, ClusterActivity
from .serializers import (
    ClusterObjectiveSerializer,
    ClusterObjectivePatchSerializer,
    ClusterActivitySerializer,
    ClusterActivityPatchSerializer,
)
from .filters import ClusterObjectiveFilter, ClusterActivityFilter, ClusterIndicatorsFilter

logger = logging.getLogger(__name__)


class ClusterObjectiveAPIView(APIView):
    """
    ClusterObjective CRUD endpoint
    """
    serializer_class = ClusterObjectiveSerializer
    permission_classes = (IsAuthenticated, )

    def get_instance(self, request, pk=None):
        try:
            instance = ClusterObjective.objects.get(id=(pk or request.data['id']))
        except ClusterObjective.DoesNotExist as exp:
            logger.exception({
                "endpoint": "ClusterObjectiveAPIView",
                "request.data": self.request.data,
                "pk": pk,
                "exception": exp,
            })
            raise Http404
        return instance

    def get(self, request, pk, *args, **kwargs):
        instance = self.get_instance(request, pk)
        serializer = ClusterObjectiveSerializer(instance=instance)
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        serializer = ClusterObjectivePatchSerializer(
            instance=self.get_instance(self.request),
            data=self.request.data
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=statuses.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        """
        Update on ClusterObjective model
        :return: ClusterObjective serializer data
        """
        if 'id' in self.request.data.keys():
            serializer = ClusterObjectiveSerializer(
                instance=self.get_instance(self.request),
                data=self.request.data
            )
        else:
            return Response({"id": "This field is required!"}, status=statuses.HTTP_400_BAD_REQUEST)

        if not serializer.is_valid():
            return Response(serializer.errors, status=statuses.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        instance = self.get_instance(request)
        instance.delete()
        return Response(status=statuses.HTTP_204_NO_CONTENT)


class ClusterObjectiveListCreateAPIView(ListCreateAPIView):

    serializer_class = ClusterObjectiveSerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = ClusterObjectiveFilter
    lookup_field = lookup_url_kwarg = 'cluster_id'

    def get_queryset(self, *args, **kwargs):
        queryset = ClusterObjective.objects.select_related('cluster')
        cluster_id = self.kwargs.get(self.lookup_field)
        if cluster_id:
            return queryset.filter(cluster_id=cluster_id)
        return queryset.all()

    def post(self, request, *args, **kwargs):
        """
        Create on ClusterObjective model
        :return: ClusterObjective object id
        """
        serializer = ClusterObjectiveSerializer(data=self.request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=statuses.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response({'id': serializer.instance.id}, status=statuses.HTTP_201_CREATED)


class ClusterActivityAPIView(APIView):
    """
    ClusterActivity CRUD endpoint
    """
    permission_classes = (IsAuthenticated, )

    def get_instance(self, request, pk=None):
        try:
            instance = ClusterActivity.objects.get(id=(pk or request.data['id']))
        except ClusterActivity.DoesNotExist:
            # TODO: log exception
            raise Http404
        return instance

    def get(self, request, pk, *args, **kwargs):
        instance = self.get_instance(request, pk)
        serializer = ClusterActivitySerializer(instance=instance)
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def patch(self, request, pk, *args, **kwargs):
        serializer = ClusterActivityPatchSerializer(
            instance=self.get_instance(self.request, pk),
            data=self.request.data
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=statuses.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def put(self, request, pk, *args, **kwargs):
        """
        Update on ClusterActivity model
        :return: ClusterActivity serializer data
        """
        if 'id' in self.request.data.keys():
            serializer = ClusterActivitySerializer(
                instance=self.get_instance(self.request, pk=pk),
                data=self.request.data
            )
        else:
            return Response({"id": "This field is required!"}, status=statuses.HTTP_400_BAD_REQUEST)

        if not serializer.is_valid():
            return Response(serializer.errors, status=statuses.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def delete(self, request, pk, *args, **kwargs):
        instance = self.get_instance(request, pk)
        instance.delete()
        return Response(status=statuses.HTTP_204_NO_CONTENT)


class ClusterActivityListAPIView(ListCreateAPIView):

    serializer_class = ClusterActivitySerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = ClusterActivityFilter
    lookup_field = lookup_url_kwarg = 'cluster_id'

    def get_queryset(self, *args, **kwargs):
        queryset = ClusterActivity.objects.select_related('cluster_objective__cluster')
        cluster_id = self.kwargs.get(self.lookup_field)
        if cluster_id:
            return queryset.filter(cluster_objective__cluster_id=cluster_id)
        return queryset.all()

    def post(self, request, *args, **kwargs):
        """
        Create on ClusterActivity model
        :return: ClusterActivity object id
        """
        serializer = ClusterActivitySerializer(data=self.request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=statuses.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response({'id': serializer.instance.id}, status=statuses.HTTP_201_CREATED)


class ClusterIndicatorsListAPIView(ListCreateAPIView):

    permission_classes = (IsAuthenticated, )
    serializer_class = ClusterIndicatorReportSerializer
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = ClusterIndicatorsFilter
    lookup_field = lookup_url_kwarg = 'response_plan_id'

    def get_queryset(self):
        response_plan_id = self.kwargs.get(self.lookup_field)
        queryset = IndicatorReport.objects.filter(
            Q(reportable__cluster_objectives__isnull=False) | Q(reportable__cluster_activities__isnull=False)
            | Q(reportable__partner_projects__isnull=False) | Q(reportable__partner_activities__isnull=False)
        ).filter(reportable__cluster_objectives__cluster__response_plan=response_plan_id)
        return queryset


class ClusterIndicatorsSimpleListAPIView(ClusterIndicatorsListAPIView):
    serializer_class = ClusterIndicatorReportSimpleSerializer
    pagination_class = filter_class = None
