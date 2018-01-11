from django.db.models import Q
from django.http import Http404
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, ListCreateAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework import status

import django_filters

from core.paginations import SmallPagination
from core.permissions import IsAuthenticated
from .serializers import (
    PartnerDetailsSerializer,
    PartnerProjectSerializer,
    PartnerProjectSimpleSerializer,
    PartnerProjectPatchSerializer,
    ClusterActivityPartnersSerializer,
    PartnerActivitySerializer,
    PartnerActivityFromClusterActivitySerializer,
    PartnerActivityFromCustomActivitySerializer,
)
from .models import PartnerProject, PartnerActivity, Partner
from .filters import PartnerProjectFilter, ClusterActivityPartnersFilter, PartnerActivityFilter


class PartnerDetailsAPIView(RetrieveAPIView):
    """
    Endpoint for getting Partner Details for overview tab.
    """
    serializer_class = PartnerDetailsSerializer
    permission_classes = (IsAuthenticated, )

    def get(self, request, *args, **kwargs):
        """
        Get User Partner Details.
        """
        serializer = self.get_serializer(
            request.user.partner
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


class PartnerProjectListCreateAPIView(ListCreateAPIView):

    serializer_class = PartnerProjectSerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = PartnerProjectFilter

    def get_queryset(self, *args, **kwargs):
        response_plan_id = self.kwargs.get('response_plan_id')

        queryset = PartnerProject.objects.select_related(
            'partner').prefetch_related('clusters', 'locations').filter(
                clusters__response_plan_id=response_plan_id).distinct()

        order = self.request.query_params.get('sort', None)
        if order:
            order_field = order.split('.')[0]
            if order_field in ('title', 'clusters', 'status', 'partner'):
                if order_field == 'clusters':
                    order_field = 'clusters__type'
                queryset = queryset.order_by(order_field)
                if len(order.split('.')) > 1 and order.split('.')[1] == 'desc':
                    queryset = queryset.order_by('-%s' % order_field)

        return queryset

    def add_many_to_many_relations(self, instance):
        """
        Adding other many to many relations that can be posted like clusters and locations.
        :param instance:
        :return: list of errors or False
        """
        errors = []

        try:
            for cluster in self.request.data['clusters']:
                instance.clusters.add(int(cluster['id']))
        except Exception as exp:
            # TODO log
            errors.append({"clusters": "list of dict ids fail."})

        return errors or False

    def post(self, request, *args, **kwargs):
        """
        Create on PartnerProject model
        :return: PartnerProject object id
        """
        serializer = self.get_serializer(data=self.request.data)

        if not serializer.is_valid():
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

        serializer.save(partner=request.user.partner)
        errors = self.add_many_to_many_relations(serializer.instance)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({'id': serializer.instance.id},
                        status=status.HTTP_201_CREATED)


class PartnerProjectAPIView(APIView):
    """
    PartnerProject CRUD endpoint
    """
    permission_classes = (IsAuthenticated, )

    def get_instance(self, request, pk=None):
        try:
            instance = PartnerProject.objects.get(
                id=(pk or request.data['id']))
        except PartnerProject.DoesNotExist:
            # TODO: log exception
            raise Http404
        return instance

    def get(self, request, pk, *args, **kwargs):
        instance = self.get_instance(request, pk)
        serializer = PartnerProjectSerializer(instance=instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk, *args, **kwargs):
        serializer = PartnerProjectPatchSerializer(
            instance=self.get_instance(self.request, pk),
            data=self.request.data
        )
        if not serializer.is_valid():
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk, *args, **kwargs):
        instance = self.get_instance(request, pk)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PartnerProjectSimpleListAPIView(ListAPIView):
    serializer_class = PartnerProjectSimpleSerializer
    permission_classes = (IsAuthenticated, )
    lookup_field = lookup_url_kwarg = 'response_plan_id'
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = PartnerProjectFilter

    def get_queryset(self):
        response_plan_id = self.kwargs.get(self.lookup_field)
        return PartnerProject.objects.filter(
            partner__clusters__response_plan_id=response_plan_id)


class PartnerSimpleListAPIView(ListAPIView):
    serializer_class = PartnerProjectSimpleSerializer
    permission_classes = (IsAuthenticated, )
    lookup_field = lookup_url_kwarg = 'response_plan_id'

    def get_queryset(self):
        response_plan_id = self.kwargs.get(self.lookup_field)
        return Partner.objects.filter(
            clusters__response_plan_id=response_plan_id)


class PartnerActivityCreateAPIView(APIView):
    """
    PartnerActivityCreateAPIView CRUD endpoint
    """
    permission_classes = (IsAuthenticated, )

    def post(self, request, create_mode, *args, **kwargs):
        """
        Create on PartnerActivity model
        :return: serialized PartnerActivity object
        """
        if create_mode == 'cluster':
            serializer = PartnerActivityFromClusterActivitySerializer(
                data=self.request.data)

            if not serializer.is_valid():
                return Response(
                    serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            try:
                pa = PartnerActivity.objects.create(
                    title=serializer.validated_data['cluster_activity'].title,
                    project=serializer.validated_data['project'],
                    partner=serializer.validated_data['partner'],
                    cluster_activity=serializer.validated_data['cluster_activity'],
                    start_date=serializer.validated_data['start_date'],
                    end_date=serializer.validated_data['end_date'],
                    status=serializer.validated_data['status'],
                )
            except Exception as e:
                return Response(
                    {'error': e.message}, status=status.HTTP_400_BAD_REQUEST)

        elif create_mode == 'custom':
            serializer = PartnerActivityFromCustomActivitySerializer(
                data=self.request.data)

            if not serializer.is_valid():
                return Response(serializer.errors,
                                status=status.HTTP_400_BAD_REQUEST)

            if serializer.validated_data['partner'] != request.user.partner:
                return Response({'error': "Partner id did not match this user's partner"},
                                status=status.HTTP_400_BAD_REQUEST)

            try:
                pa = PartnerActivity.objects.create(
                    title=serializer.validated_data['title'],
                    project=serializer.validated_data['project'],
                    partner=serializer.validated_data['partner'],
                    cluster_objective=serializer.validated_data['cluster_objective'],
                    start_date=serializer.validated_data['start_date'],
                    end_date=serializer.validated_data['end_date'],
                    status=serializer.validated_data['status'],
                )
            except Exception as e:
                return Response(
                    {'error': e.message}, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({'error': "Wrong create mode flag"},
                            status=status.HTTP_400_BAD_REQUEST)

        return Response({'id': pa.id}, status=status.HTTP_201_CREATED)


class ClusterActivityPartnersAPIView(ListAPIView):

    serializer_class = ClusterActivityPartnersSerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = ClusterActivityPartnersFilter
    lookup_field = lookup_url_kwarg = 'pk'

    def get_queryset(self, *args, **kwargs):
        cluster_activity_id = self.kwargs.get(self.lookup_field)
        return Partner.objects.filter(
            partner_activities__cluster_activity_id=cluster_activity_id)


class PartnerActivityListAPIView(ListAPIView):

    serializer_class = PartnerActivitySerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = PartnerActivityFilter

    def get_queryset(self, *args, **kwargs):
        response_plan_id = self.kwargs.get('response_plan_id')

        queryset = PartnerActivity.objects.select_related(
            'cluster_activity').filter(
                Q(cluster_activity__cluster_objective__cluster__response_plan_id=response_plan_id) |
                Q(cluster_objective__cluster__response_plan_id=response_plan_id)
            )

        order = self.request.query_params.get('sort', None)
        if order:
            order_field = order.split('.')[0]
            if order_field in ('title', 'status', 'partner', 'cluster_activity'):
                if order_field == 'cluster_activity':
                    order_field = 'cluster_activity__title'
                queryset = queryset.order_by(order_field)
                if len(order.split('.')) > 1 and order.split('.')[1] == 'desc':
                    queryset = queryset.order_by('-%s' % order_field)

        return queryset


class PartnerActivityAPIView(RetrieveAPIView):
    """
    Endpoint for getting Partner Activity Details for overview tab.
    """
    serializer_class = PartnerActivitySerializer
    permission_classes = (IsAuthenticated, )

    def get(self, request, response_plan_id, pk, *args, **kwargs):
        """
        Get User Partner Details.
        TODO: enforce user access to this response plan.
        """
        instance = get_object_or_404(PartnerActivity, id=pk)
        serializer = self.get_serializer(instance=instance)
        return Response(serializer.data, status=status.HTTP_200_OK)
