from django.db.models import Q
from django.http import Http404
from django.shortcuts import get_object_or_404

from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, ListCreateAPIView, ListAPIView, UpdateAPIView, CreateAPIView
from rest_framework.response import Response
from rest_framework import status

import django_filters

from core.common import PRP_ROLE_TYPES
from core.paginations import SmallPagination
from core.permissions import (
    IsAuthenticated,
    AnyPermission,
    IsPartnerAuthorizedOfficerForCurrentWorkspaceCheck,
    IsIMOForCurrentWorkspace,
    IsIMOForCurrentWorkspaceCheck,
    IsPartnerAuthorizedOfficerForCurrentWorkspace,
    IsPartnerEditorForCurrentWorkspace,
    IsPartnerViewerForCurrentWorkspace,
    IsIMO,
    IsClusterSystemAdmin,
)

from cluster.models import Cluster

from .serializers import (
    PartnerDetailsSerializer,
    PartnerProjectSerializer,
    PartnerProjectSimpleSerializer,
    ClusterActivityPartnersSerializer,
    PartnerActivitySerializer,
    PartnerActivityFromClusterActivitySerializer,
    PartnerActivityFromCustomActivitySerializer,
    PartnerSimpleSerializer,
    PartnerActivityUpdateSerializer,
    PartnerIDManagementSerializer,
    PartnerSimpleIDManagementSerializer,
)
from .models import PartnerProject, PartnerActivity, Partner
from .filters import (
    PartnerProjectFilter,
    ClusterActivityPartnersFilter,
    PartnerActivityFilter,
    PartnerFilter,
    PartnerIDManagementFilter
)


class PartnerDetailsAPIView(RetrieveAPIView):
    """
    Endpoint for getting Partner Details for overview tab.
    """
    serializer_class = PartnerDetailsSerializer
    permission_classes = (
        AnyPermission(
            IsPartnerViewerForCurrentWorkspace,
            IsPartnerEditorForCurrentWorkspace,
            IsPartnerAuthorizedOfficerForCurrentWorkspace,
        ),
    )

    def get(self, request, *args, **kwargs):
        """
        Get User Partner Details.
        """
        serializer = self.get_serializer(
            request.user.partner
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


class PartnerListCreateAPIView(ListCreateAPIView):
    permission_classes = (
        AnyPermission(
            IsIMO,
            IsClusterSystemAdmin
        ),
    )
    queryset = Partner.objects.all()
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = PartnerIDManagementFilter
    pagination_class = SmallPagination

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PartnerSimpleIDManagementSerializer
        if self.request.method == 'POST':
            return PartnerIDManagementSerializer


class PartnerRetrieveAPIView(RetrieveAPIView):
    serializer_class = PartnerIDManagementSerializer
    permission_classes = (
        AnyPermission(
            IsIMO,
            IsClusterSystemAdmin
        ),
    )
    queryset = Partner.objects.all()


class AssignablePartnersListView(ListAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = PartnerSimpleSerializer

    def get_queryset(self):
        user = self.request.user
        user_roles = set(user.role_list)

        if {PRP_ROLE_TYPES.cluster_system_admin, PRP_ROLE_TYPES.cluster_imo}.intersection(user_roles):
            return Partner.objects.all()
        if PRP_ROLE_TYPES.cluster_member in user_roles:
            return Partner.objects.filter(id=user.partner_id)

        raise PermissionDenied()


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

    def post(self, request, *args, **kwargs):
        """
        Create on PartnerProject model
        """
        if not IsPartnerAuthorizedOfficerForCurrentWorkspaceCheck(request) and not IsIMOForCurrentWorkspace(request):
            raise PermissionDenied

        partner_id = self.kwargs.get('partner_id')

        if partner_id:
            if not IsIMOForCurrentWorkspaceCheck(request):
                raise PermissionDenied

            partner = get_object_or_404(Partner, id=partner_id)

            user_cluster_ids = request.user.prp_roles.values_list('cluster', flat=True)
            if not Cluster.objects.filter(id__in=user_cluster_ids, partners=partner).exists():
                raise ValidationError({
                    'partner_id': "the partner_id does not belong to your clusters"
                })
        else:
            partner = request.user.partner

        serializer = self.get_serializer(data=self.request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(partner=partner)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PartnerProjectAPIView(APIView):
    """
    PartnerProject CRUD endpoint
    """
    # TODO: Implement Object-level permission for IMO
    permission_classes = (
        IsAuthenticated,
    )

    def get_instance(self):
        try:
            instance = PartnerProject.objects.get(id=(self.kwargs.get('pk') or self.request.data['id']))
        except PartnerProject.DoesNotExist:
            raise Http404
        return instance

    def get(self, *args, **kwargs):
        instance = self.get_instance()
        serializer = PartnerProjectSerializer(instance=instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        if not IsPartnerAuthorizedOfficerForCurrentWorkspaceCheck(request) and not IsIMOForCurrentWorkspace(request):
            raise PermissionDenied

        partner_id = self.kwargs.get('partner_id')

        if partner_id:
            if not IsIMOForCurrentWorkspaceCheck(request):
                raise PermissionDenied

            # Check if incoming partner belongs to IMO's clusters
            user_cluster_ids = request.user.prp_roles.values_list('cluster', flat=True)
            if not Cluster.objects.filter(
                id__in=user_cluster_ids, partners=get_object_or_404(Partner, id=partner_id)
            ).exists():
                raise ValidationError({
                    'partner_id': "the partner_id does not belong to your clusters"
                })

        serializer = PartnerProjectSerializer(
            instance=self.get_instance(),
            data=self.request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class PartnerProjectSimpleListAPIView(ListAPIView):
    serializer_class = PartnerProjectSimpleSerializer
    permission_classes = (IsAuthenticated, )
    lookup_field = lookup_url_kwarg = 'response_plan_id'
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = PartnerProjectFilter

    def get_queryset(self):
        response_plan_id = self.kwargs.get(self.lookup_field)
        return PartnerProject.objects.filter(
            partner__clusters__response_plan_id=response_plan_id).distinct()


class PartnerSimpleListAPIView(ListAPIView):
    serializer_class = PartnerSimpleSerializer
    permission_classes = (IsAuthenticated, )
    lookup_field = lookup_url_kwarg = 'response_plan_id'
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = PartnerFilter

    def get_queryset(self):
        response_plan_id = self.kwargs.get(self.lookup_field)
        return Partner.objects.filter(clusters__response_plan_id=response_plan_id)


class PartnerActivityCreateAPIView(CreateAPIView):
    """
    PartnerActivityCreateAPIView CRUD endpoint
    """
    permission_classes = (
        AnyPermission(
            IsIMOForCurrentWorkspace,
            IsPartnerAuthorizedOfficerForCurrentWorkspace,
        ),
    )

    def post(self, request, create_mode, *args, **kwargs):
        """
        Create on PartnerActivity model
        :return: serialized PartnerActivity object
        """

        serializer = self.get_serializer(data=self.request.data)
        serializer.is_valid(raise_exception=True)

        partner = serializer.validated_data['partner']

        # If user is IMO check if incoming partner belongs to IMO's clusters
        user_cluster_ids = request.user.prp_roles.values_list('cluster', flat=True)

        if IsIMOForCurrentWorkspace(request) \
                and partner.id not in Cluster.objects.filter(
                    id__in=user_cluster_ids).values_list('partners', flat=True):
            raise ValidationError({
                'partner_id': "the partner_id does not belong to your clusters"
            })

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get_serializer_class(self):
        choices = {
            'cluster': PartnerActivityFromClusterActivitySerializer,
            'custom': PartnerActivityFromCustomActivitySerializer,
        }

        klass = choices.get(self.kwargs['create_mode'])
        if not klass:
            raise ValidationError('Wrong create mode flag')

        return klass

    def get_serializer_context(self):
        return {
            'request': self.request,
            'imo': IsIMOForCurrentWorkspace(self.request),
        }


class PartnerActivityUpdateAPIView(UpdateAPIView):
    """
    PartnerActivityUpdateAPIView CRUD endpoint
    """
    permission_classes = (
        AnyPermission(
            IsIMOForCurrentWorkspace,
            IsPartnerAuthorizedOfficerForCurrentWorkspace
        ),
    )
    serializer_class = PartnerActivityUpdateSerializer

    def get_queryset(self):
        return PartnerActivity.objects.filter(
            project__clusters__response_plan_id=self.kwargs['response_plan_id']
        )

    def get_object(self, pk):
        return get_object_or_404(self.get_queryset(), pk=pk)

    def patch(self, request, pk, *args, **kwargs):
        instance = self.get_object(pk)
        serializer = self.get_serializer(
            instance=instance,
            data=self.request.data
        )

        serializer.is_valid(raise_exception=True)

        # If user is IMO
        # Check if incoming partner belongs to IMO's clusters
        user_cluster_ids = request.user.prp_roles.values_list('cluster', flat=True)

        if IsIMOForCurrentWorkspace(request) \
                and instance.partner.id not in Cluster.objects.filter(
                    id__in=user_cluster_ids).values_list('partners', flat=True):
            raise ValidationError({
                'partner_id': "the partner_id does not belong to your clusters"
            })

        serializer.save()
        return Response(PartnerActivitySerializer(instance=instance).data, status=status.HTTP_200_OK)

    def get_serializer_context(self):
        return {
            'request': self.request,
            'imo': IsIMOForCurrentWorkspace(self.request),
        }


class ClusterActivityPartnersAPIView(ListAPIView):

    serializer_class = ClusterActivityPartnersSerializer
    permission_classes = (
        AnyPermission(
            IsIMOForCurrentWorkspace,
            IsPartnerEditorForCurrentWorkspace,
            IsPartnerViewerForCurrentWorkspace,
            IsPartnerAuthorizedOfficerForCurrentWorkspace,
        ),
    )
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
    permission_classes = (
        AnyPermission(
            IsIMOForCurrentWorkspace,
            IsPartnerEditorForCurrentWorkspace,
            IsPartnerViewerForCurrentWorkspace,
            IsPartnerAuthorizedOfficerForCurrentWorkspace,
        ),
    )
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = PartnerActivityFilter

    def get_queryset(self, *args, **kwargs):
        response_plan_id = self.kwargs.get('response_plan_id')

        queryset = PartnerActivity.objects.select_related('cluster_activity').filter(
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
    permission_classes = (
        AnyPermission(
            IsIMOForCurrentWorkspace,
            IsPartnerEditorForCurrentWorkspace,
            IsPartnerViewerForCurrentWorkspace,
            IsPartnerAuthorizedOfficerForCurrentWorkspace,
        ),
    )

    def get(self, request, response_plan_id, pk, *args, **kwargs):
        """
        Get User Partner Details.
        TODO: enforce user access to this response plan.
        """
        instance = get_object_or_404(PartnerActivity, id=pk)
        serializer = self.get_serializer(instance=instance)
        return Response(serializer.data, status=status.HTTP_200_OK)
