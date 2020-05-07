from django.db.models import Q
from django.http import Http404
from django.shortcuts import get_object_or_404

import django_filters
from cluster.models import Cluster
from core.common import PRP_ROLE_TYPES
from core.paginations import SmallPagination
from core.permissions import (
    AnyPermission,
    has_permission_for_clusters_check,
    HasAnyRole,
    IsAuthenticated,
    IsClusterSystemAdmin,
    IsIMO,
)
from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.filters import OrderingFilter
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    ListCreateAPIView,
    RetrieveAPIView,
    RetrieveUpdateAPIView,
    UpdateAPIView,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import (
    ClusterActivityPartnersFilter,
    PartnerActivityFilter,
    PartnerFilter,
    PartnerIDManagementFilter,
    PartnerProjectFilter,
)
from .models import Partner, PartnerActivity, PartnerProject
from .serializers import (
    ClusterActivityPartnersSerializer,
    PartnerActivityFromClusterActivitySerializer,
    PartnerActivityFromCustomActivitySerializer,
    PartnerActivitySerializer,
    PartnerActivityUpdateSerializer,
    PartnerDetailsSerializer,
    PartnerIDManagementSerializer,
    PartnerProjectSerializer,
    PartnerProjectSimpleSerializer,
    PartnerSimpleIDManagementSerializer,
    PartnerSimpleSerializer,
)


class PartnerDetailsAPIView(RetrieveAPIView):
    """
    Endpoint for getting Partner Details for overview tab.
    """
    serializer_class = PartnerDetailsSerializer
    permission_classes = (IsAuthenticated, )

    def check_permissions(self, request):
        super().check_permissions(request)
        if not request.user.partner:
            self.permission_denied(request)

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
    queryset = Partner.objects.prefetch_related('clusters').order_by('-id')
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, OrderingFilter)
    filter_class = PartnerIDManagementFilter
    pagination_class = SmallPagination
    ordering_fields = ('title', 'partner_type')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return PartnerSimpleIDManagementSerializer
        if self.request.method == 'POST':
            return PartnerIDManagementSerializer


class PartnerRetrieveUpdateAPIView(RetrieveUpdateAPIView):
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

    def check_permissions(self, request):
        super().check_permissions(request)

        response_plan_id = self.kwargs.get('response_plan_id')
        roles_permitted = [PRP_ROLE_TYPES.cluster_imo, PRP_ROLE_TYPES.cluster_member]

        if request.method == 'GET':
            roles_permitted.extend([
                PRP_ROLE_TYPES.cluster_coordinator,
                PRP_ROLE_TYPES.cluster_viewer,
            ])

        if request.method == 'POST':
            cluster_ids = [int(cluster_dict['id']) for cluster_dict in request.data.get('clusters', [])]
            if not has_permission_for_clusters_check(request, cluster_ids, roles_permitted):
                message = {'clusters': 'You may not have required permission to add some of the clusters.'}
                self.permission_denied(request, message=message)

        if not request.user.prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role__in=roles_permitted, cluster__response_plan_id=response_plan_id)
        ).exists():
            self.permission_denied(request)

    def get_queryset(self, *args, **kwargs):
        response_plan_id = self.kwargs.get('response_plan_id')

        queryset = PartnerProject.objects.select_related(
            'partner').prefetch_related('clusters', 'locations').filter(
                clusters__response_plan_id=response_plan_id).distinct()

        if self.request.user.partner:
            queryset = queryset.filter(partner=self.request.user.partner)

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

        partner_id = self.kwargs.get('partner_id')

        if partner_id:
            partner = get_object_or_404(Partner, pk=partner_id)
            if (not request.user.is_cluster_system_admin and
                    not Cluster.objects.filter(prp_roles__user=request.user, partners=partner_id).exists()):
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

    permission_classes = (
        IsAuthenticated,
    )

    def check_partner_project_permission(self, request, obj):
        roles_permitted = [PRP_ROLE_TYPES.cluster_imo, PRP_ROLE_TYPES.cluster_member]

        if request.method == 'GET':
            roles_permitted.extend([PRP_ROLE_TYPES.cluster_viewer])

        if not request.user.prp_roles.filter(
            Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
            Q(role__in=roles_permitted, cluster__partner_projects=obj)
        ).exists():
            self.permission_denied(request)

    def get_instance(self):
        try:
            instance = PartnerProject.objects.get(id=(self.kwargs.get('pk') or self.request.data['id']))
        except PartnerProject.DoesNotExist:
            raise Http404
        self.check_partner_project_permission(self.request, instance)
        return instance

    def get(self, *args, **kwargs):
        instance = self.get_instance()
        serializer = PartnerProjectSerializer(instance=instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        partner_id = self.kwargs.get('partner_id')

        if partner_id and not request.user.prp_roles.filter(role=PRP_ROLE_TYPES.cluster_system_admin).exists():
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
    permission_classes = (IsAuthenticated, )

    def check_permissions(self, request):
        super().check_permissions(request)

        response_plan_id = self.kwargs.get('response_plan_id')
        roles_permitted = [PRP_ROLE_TYPES.cluster_imo, PRP_ROLE_TYPES.cluster_member]

        if not request.user.prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role__in=roles_permitted, cluster__response_plan_id=response_plan_id)
        ).exists():
            self.permission_denied(request)

    def post(self, request, create_mode, *args, **kwargs):
        """
        Create on PartnerActivity model
        :return: serialized PartnerActivity object
        """

        serializer = self.get_serializer(data=self.request.data)
        serializer.is_valid(raise_exception=True)

        partner = serializer.validated_data['partner']

        if request.user.partner and request.user.partner != partner:
            raise ValidationError({
                'partner_id': "the partner_id does not match user partner id"
            })

        # If user is IMO check if incoming partner belongs to IMO's clusters
        if (not request.user.is_cluster_system_admin and
                not request.user.prp_roles.filter(
                    role__in=(PRP_ROLE_TYPES.cluster_imo, PRP_ROLE_TYPES.cluster_member),
                    cluster__partners=partner
                ).exists()):

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
        }


class PartnerActivityUpdateAPIView(UpdateAPIView):
    """
    PartnerActivityUpdateAPIView CRUD endpoint
    """
    permission_classes = (IsAuthenticated, )
    serializer_class = PartnerActivityUpdateSerializer

    def check_permissions(self, request):
        super().check_permissions(request)

        response_plan_id = self.kwargs.get('response_plan_id')
        roles_permitted = [PRP_ROLE_TYPES.cluster_imo, PRP_ROLE_TYPES.cluster_member]

        if not request.user.prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role__in=roles_permitted, cluster__response_plan_id=response_plan_id)
        ).exists():
            self.permission_denied(request)

    def get_queryset(self):
        return PartnerActivity.objects.filter(
            projects__clusters__response_plan_id=self.kwargs['response_plan_id']
        ).distinct()

    def get_object(self, pk):
        return get_object_or_404(self.get_queryset(), pk=pk)

    def patch(self, request, pk, *args, **kwargs):
        instance = self.get_object(pk)
        serializer = self.get_serializer(
            instance=instance,
            data=self.request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)

        if request.user.partner_id and request.user.partner_id != instance.partner_id:
            raise ValidationError({
                'partner_id': "the partner_id does not match user partner id"
            })

        # If user is IMO check if incoming partner belongs to IMO's clusters
        if (not request.user.is_cluster_system_admin and
                not request.user.prp_roles.filter(
                    role__in=(PRP_ROLE_TYPES.cluster_imo, PRP_ROLE_TYPES.cluster_member),
                    cluster__partners=instance.partner_id
                ).exists()):

            raise ValidationError({
                'partner_id': "the partner_id does not belong to your clusters"
            })

        serializer.save()
        return Response(PartnerActivitySerializer(instance=instance).data, status=status.HTTP_200_OK)

    def get_serializer_context(self):
        return {
            'request': self.request,
        }


class ClusterActivityPartnersAPIView(ListAPIView):

    serializer_class = ClusterActivityPartnersSerializer
    permission_classes = (
        IsAuthenticated,
        HasAnyRole(
            PRP_ROLE_TYPES.cluster_system_admin,
            PRP_ROLE_TYPES.cluster_imo,
            PRP_ROLE_TYPES.cluster_member,
            PRP_ROLE_TYPES.cluster_coordinator,
            PRP_ROLE_TYPES.cluster_viewer
        )
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
    permission_classes = (IsAuthenticated, )
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = PartnerActivityFilter

    def check_permissions(self, request):
        super().check_permissions(request)

        response_plan_id = self.kwargs.get('response_plan_id')
        roles_permitted = [PRP_ROLE_TYPES.cluster_imo, PRP_ROLE_TYPES.cluster_member,
                           PRP_ROLE_TYPES.cluster_coordinator, PRP_ROLE_TYPES.cluster_viewer]

        if not request.user.prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role__in=roles_permitted, cluster__response_plan_id=response_plan_id)
        ).exists():
            self.permission_denied(request)

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
    permission_classes = (IsAuthenticated, )

    def check_permissions(self, request):
        super().check_permissions(request)

        response_plan_id = self.kwargs.get('response_plan_id')
        roles_permitted = [PRP_ROLE_TYPES.cluster_imo, PRP_ROLE_TYPES.cluster_member,
                           PRP_ROLE_TYPES.cluster_coordinator, PRP_ROLE_TYPES.cluster_viewer]

        if not request.user.prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role__in=roles_permitted, cluster__response_plan_id=response_plan_id)
        ).exists():
            self.permission_denied(request)

    def get(self, request, response_plan_id, pk, *args, **kwargs):
        """
        Get User Partner Details.
        TODO: enforce user access to this response plan.
        """
        instance = get_object_or_404(PartnerActivity, id=pk)
        serializer = self.get_serializer(instance=instance)
        return Response(serializer.data, status=status.HTTP_200_OK)
