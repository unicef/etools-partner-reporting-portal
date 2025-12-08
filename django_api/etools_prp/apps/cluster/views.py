import logging

from django.contrib.gis.db.models.functions import AsGeoJSON
from django.db.models import Q
from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404

import django_filters
from rest_framework import status as statuses
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import GenericAPIView, ListAPIView, ListCreateAPIView, RetrieveAPIView
from rest_framework.mixins import ListModelMixin
from rest_framework.response import Response
from rest_framework.views import APIView

from etools_prp.apps.cluster.export_indicators import IndicatorsXLSXExporter
from etools_prp.apps.cluster.filters import (
    ClusterActivityFilter,
    ClusterFilter,
    ClusterIndicatorsFilter,
    ClusterObjectiveFilter,
)
from etools_prp.apps.cluster.import_indicators import IndicatorsXLSXReader
from etools_prp.apps.cluster.models import Cluster, ClusterActivity, ClusterObjective
from etools_prp.apps.cluster.serializers import (
    ClusterActivityPatchSerializer,
    ClusterActivitySerializer,
    ClusterIDManagementSerializer,
    ClusterObjectivePatchSerializer,
    ClusterObjectiveSerializer,
    ClusterSimpleSerializer,
    OperationalPresenceLocationListSerializer,
    PartnerAnalysisSummarySerializer,
    ResponsePlanClusterDashboardSerializer,
    ResponsePlanPartnerDashboardSerializer,
)
from etools_prp.apps.core.common import PARTNER_TYPE, PRP_ROLE_TYPES
from etools_prp.apps.core.models import Location, ResponsePlan
from etools_prp.apps.core.paginations import SmallPagination
from etools_prp.apps.core.permissions import IsAuthenticated
from etools_prp.apps.core.serializers import ShortLocationSerializer
from etools_prp.apps.indicator.models import IndicatorReport, Reportable, ReportableLocationGoal
from etools_prp.apps.indicator.serializers import (
    ClusterAnalysisIndicatorDetailSerializer,
    ClusterAnalysisIndicatorsListSerializer,
    ClusterIndicatorReportSerializer,
    ClusterPartnerAnalysisIndicatorResultSerializer,
    ReportableIdSerializer,
)
from etools_prp.apps.partner.models import Partner, PartnerActivity, PartnerProject

logger = logging.getLogger(__name__)


class ClusterListAPIView(ListAPIView):
    """
    Cluster object list API - GET
    Authentication required.

    Parameters:
    - response_plan_id: Response Plan ID

    Returns:
        ClusterSimpleSerializer object list.
    """
    serializer_class = ClusterSimpleSerializer
    permission_classes = (IsAuthenticated, )
    lookup_field = lookup_url_kwarg = 'response_plan_id'
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filterset_class = ClusterFilter

    def get_queryset(self, *args, **kwargs):
        response_plan_id = self.kwargs.get(self.lookup_field)
        # Add explicit ordering for consistent distinct() behavior in Django 4.2
        queryset = Cluster.objects.filter(response_plan_id=response_plan_id).order_by('id')

        if not self.request.user.is_cluster_system_admin:
            queryset = queryset.filter(old_prp_roles__user=self.request.user).distinct()

        return queryset


class ClusterListForPartnerAPIView(ListAPIView):
    """
    Cluster object list API - GET
    Authentication required.

    Parameters:
    - response_plan_id: Response Plan ID

    Returns:
        ClusterSimpleSerializer object list.
    """
    serializer_class = ClusterSimpleSerializer
    permission_classes = (IsAuthenticated, )
    lookup_field = lookup_url_kwarg = 'pk'
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)

    def get_queryset(self, *args, **kwargs):
        pk = self.kwargs.get(self.lookup_field)
        queryset = Cluster.objects.filter(partners=pk)

        return queryset


class ClusterObjectiveAPIView(APIView):
    """
    ClusterObjective object API - GET/PATCH/PUT/DELETE
    Authentication required.

    Parameters:
    - pk - ClusterObjective ID

    Returns:
        - GET method - ClusterSimpleSerializer object.
        - PATCH method - ClusterObjectivePatchSerializer object.
        - PUT method - ClusterObjectiveSerializer object.
    """
    serializer_class = ClusterObjectiveSerializer
    permission_classes = (IsAuthenticated, )

    def check_cluster_objective_permission(self, request, obj):
        roles_permitted = [PRP_ROLE_TYPES.cluster_imo]
        if request.method == 'GET':
            roles_permitted.extend([
                PRP_ROLE_TYPES.cluster_member,
                PRP_ROLE_TYPES.cluster_coordinator,
                PRP_ROLE_TYPES.cluster_viewer
            ])

        if not request.user.old_prp_roles.filter(Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                                                 Q(role__in=roles_permitted, cluster_id=obj.cluster_id)).exists():
            self.permission_denied(request)

    def get_instance(self, request, pk=None):
        try:
            instance = ClusterObjective.objects.get(
                id=(pk or request.data['id']))
        except ClusterObjective.DoesNotExist as exp:
            logger.exception({
                "endpoint": "ClusterObjectiveAPIView",
                "request.data": self.request.data,
                "pk": pk,
                "exception": exp,
            })
            raise Http404
        self.check_cluster_objective_permission(request, instance)
        return instance

    def get(self, request, pk, *args, **kwargs):
        instance = self.get_instance(request, pk)
        serializer = ClusterObjectiveSerializer(instance=instance)
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def patch(self, request, pk, *args, **kwargs):
        serializer = ClusterObjectivePatchSerializer(
            instance=self.get_instance(self.request, pk=pk),
            data=self.request.data,
            context={'request': request, 'pk': pk},
        )
        serializer.is_valid(raise_exception=True)
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
                data=self.request.data,
                context={'request': request},
            )
        else:
            raise ValidationError({"id": "This field is required!"})

        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=statuses.HTTP_200_OK)


class ClusterObjectiveListCreateAPIView(ListCreateAPIView):
    """
    ClusterObjective object list API - GET/POST
    Authentication required.

    Parameters:
    - response_plan_id - Response plan ID

    Returns:
        - GET method - ClusterObjectiveSerializer object.
        - POST method - ClusterObjectiveSerializer object.
    """

    serializer_class = ClusterObjectiveSerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filterset_class = ClusterObjectiveFilter

    def check_permissions(self, request):
        super().check_permissions(request)

        response_plan_id = self.kwargs.get('response_plan_id')
        roles_permitted = [PRP_ROLE_TYPES.cluster_imo]
        if request.method == 'GET':
            roles_permitted.extend([
                PRP_ROLE_TYPES.cluster_member,
                PRP_ROLE_TYPES.cluster_coordinator,
                PRP_ROLE_TYPES.cluster_viewer
            ])
        if not request.user.old_prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role__in=roles_permitted, cluster__response_plan_id=response_plan_id)
        ).exists():
            self.permission_denied(request)

    def get_queryset(self, *args, **kwargs):
        response_plan_id = self.kwargs.get('response_plan_id')

        # Clear default ordering before distinct() to avoid issues in Django 4.2
        queryset = ClusterObjective.objects.select_related('cluster').filter(
            cluster__response_plan_id=response_plan_id).order_by('id').distinct()

        if not self.request.user.is_cluster_system_admin:
            queryset = queryset.filter(cluster__old_prp_roles__user=self.request.user).distinct()

        order = self.request.query_params.get('sort', None)
        if order:
            order_field = order.split('.')[0]
            if order_field in ('title', 'cluster'):
                queryset = queryset.order_by(order_field)
                if len(order.split('.')) > 1 and order.split('.')[1] == 'desc':
                    queryset = queryset.order_by('-%s' % order_field)
        return queryset

    def post(self, request, *args, **kwargs):
        """
        Create on ClusterObjective model
        :return: ClusterObjective object id
        """

        serializer = ClusterObjectiveSerializer(
            data=self.request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'id': serializer.instance.id}, status=statuses.HTTP_201_CREATED
        )


class ClusterActivityAPIView(APIView):
    """
    ClusterActivity object API - GET/PATCH/PUT/DELETE
    Authentication required.

    Parameters:
    - pk - ClusterActivity ID

    Returns:
        - GET method - ClusterActivitySerializer object.
        - PATCH method - ClusterActivityPatchSerializer object.
        - PUT method - ClusterActivitySerializer object.
    """
    permission_classes = (IsAuthenticated, )

    def check_cluster_activity_permission(self, request, obj):
        roles_permitted = [PRP_ROLE_TYPES.cluster_imo]
        if request.method == 'GET':
            roles_permitted.extend([
                PRP_ROLE_TYPES.cluster_member,
                PRP_ROLE_TYPES.cluster_coordinator,
                PRP_ROLE_TYPES.cluster_viewer
            ])

        if not request.user.old_prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role__in=roles_permitted, cluster__cluster_objectives=obj.cluster_objective_id)
        ).exists():
            self.permission_denied(request)

    def get_instance(self, request, pk=None):
        try:
            instance = ClusterActivity.objects.get(
                id=(pk or request.data['id']))
        except ClusterActivity.DoesNotExist:
            # TODO: log exception
            raise Http404
        self.check_cluster_activity_permission(request, instance)
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
        serializer.is_valid(raise_exception=True)
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
                data=self.request.data,
                context={'request': request},
            )
        else:
            raise ValidationError({"id": "This field is required!"})

        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=statuses.HTTP_200_OK)


class ClusterActivityListAPIView(ListCreateAPIView):
    """
    ClusterActivity object list API - GET/POST
    Authentication required.

    Parameters:
    - response_plan_id - Response plan ID

    Returns:
        - GET method - ClusterActivitySerializer object.
        - POST method - ClusterActivitySerializer object.
    """
    serializer_class = ClusterActivitySerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filterset_class = ClusterActivityFilter

    def check_permissions(self, request):
        super().check_permissions(request)

        response_plan_id = self.kwargs.get('response_plan_id')
        roles_permitted = [PRP_ROLE_TYPES.cluster_imo]
        if request.method == 'GET':
            roles_permitted.extend([
                PRP_ROLE_TYPES.cluster_member,
                PRP_ROLE_TYPES.cluster_coordinator,
                PRP_ROLE_TYPES.cluster_viewer
            ])
        if not request.user.old_prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role__in=roles_permitted, cluster__response_plan_id=response_plan_id)
        ).exists():
            self.permission_denied(request)

    def get_queryset(self, *args, **kwargs):
        response_plan_id = self.kwargs.get('response_plan_id')

        # Clear default ordering before distinct() to avoid issues in Django 4.2
        queryset = ClusterActivity.objects.select_related('cluster_objective__cluster').filter(
            cluster_objective__cluster__response_plan_id=response_plan_id).order_by('id').distinct()

        if not self.request.user.is_cluster_system_admin:
            queryset = queryset.filter(cluster_objective__cluster__old_prp_roles__user=self.request.user).distinct()

        order = self.request.query_params.get('sort', None)
        if order:
            order_field = order.split('.')[0]
            if order_field in ('title', 'cluster_objective'):
                queryset = queryset.order_by(order_field)
                if len(order.split('.')) > 1 and order.split('.')[1] == 'desc':
                    queryset = queryset.order_by('-%s' % order_field)

        return queryset

    def post(self, request, *args, **kwargs):
        """
        Create on ClusterActivity model
        :return: ClusterActivity object id
        """

        serializer = ClusterActivitySerializer(
            data=self.request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'id': serializer.instance.id},
                        status=statuses.HTTP_201_CREATED)


class IndicatorReportsListAPIView(ListAPIView, RetrieveAPIView):
    """
    Cluster IndicatorReport object list API - GET/POST
    Authentication required.

    Parameters:
    - response_plan_id - Response plan ID

    GET query parameters:
    * cluster - Integer ID for cluster
    * partner - Integer ID for partner
    * indicator - Integer ID for IndicatorReport
    * projects - A comma-seperated-list of Integer ID for projects
    * location - Integer ID for location
    * cluster_objective - Integer ID for cluster_objective
    * cluster_activity - Integer ID for cluster_activity
    * indicator_type - String value of choices: partner_activity, partner_project, cluster_objective, cluster_activity

    Returns:
        - GET method - ClusterIndicatorReportSerializer object.
        - POST method - ClusterIndicatorReportSerializer object.
    """
    permission_classes = (IsAuthenticated, )
    serializer_class = ClusterIndicatorReportSerializer
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filterset_class = ClusterIndicatorsFilter

    def check_permissions(self, request):
        super().check_permissions(request)

        response_plan_id = self.kwargs.get('response_plan_id')
        roles_permitted = [PRP_ROLE_TYPES.cluster_imo]
        if request.method == 'GET':
            roles_permitted.extend([
                PRP_ROLE_TYPES.cluster_member,
                PRP_ROLE_TYPES.cluster_coordinator,
                PRP_ROLE_TYPES.cluster_viewer
            ])
        if not request.user.old_prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role__in=roles_permitted, cluster__response_plan_id=response_plan_id)
        ).exists():
            self.permission_denied(request)

    def get_user_check_kwarg(self, key):
        key = key + 'old_prp_roles__user'
        if not self.request.user.is_cluster_system_admin:
            return {key: self.request.user}
        return {}

    def get_queryset(self):
        response_plan_id = self.kwargs['response_plan_id']
        # Clear default ordering before distinct() to avoid issues in Django 4.2
        queryset = IndicatorReport.objects.filter(
            Q(reportable__cluster_objectives__isnull=False) |
            Q(reportable__cluster_activities__isnull=False) |
            Q(reportable__partner_projects__isnull=False) |
            Q(reportable__partner_activity_project_contexts__isnull=False)
        ).filter(
            Q(reportable__cluster_objectives__cluster__response_plan=response_plan_id,
              **self.get_user_check_kwarg('reportable__cluster_objectives__cluster__')) |
            Q(reportable__cluster_activities__cluster_objective__cluster__response_plan=response_plan_id,
              **self.get_user_check_kwarg('reportable__cluster_activities__cluster_objective__cluster__')) |
            Q(reportable__partner_projects__clusters__response_plan=response_plan_id,
              **self.get_user_check_kwarg('reportable__partner_projects__clusters__')) |
            Q(reportable__partner_activity_project_contexts__activity__cluster_activity__cluster_objective__cluster__response_plan=response_plan_id,    # noqa: E501
              **self.get_user_check_kwarg('reportable__partner_activity_project_contexts__activity__cluster_activity__cluster_objective__cluster__')) |  # noqa: E501
            Q(reportable__partner_activity_project_contexts__activity__cluster_objective__cluster__response_plan=response_plan_id,   # noqa: E501
              **self.get_user_check_kwarg('reportable__partner_activity_project_contexts__activity__cluster_objective__cluster__'))   # noqa: E501
        ).order_by('id').distinct()
        return queryset


class IndicatorReportDetailAPIView(RetrieveAPIView):

    permission_classes = (IsAuthenticated, )
    serializer_class = ClusterIndicatorReportSerializer

    def check_permissions(self, request):
        super().check_permissions(request)

        response_plan_id = self.kwargs.get('response_plan_id')
        roles_permitted = [PRP_ROLE_TYPES.cluster_imo]
        if request.method == 'GET':
            roles_permitted.extend([
                PRP_ROLE_TYPES.cluster_member,
                PRP_ROLE_TYPES.cluster_coordinator,
                PRP_ROLE_TYPES.cluster_viewer
            ])
        if not request.user.old_prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role__in=roles_permitted, cluster__response_plan_id=response_plan_id)
        ).exists():
            self.permission_denied(request)

    def get_user_check_kwarg(self, key):
        key = key + 'old_prp_roles__user'
        if not self.request.user.is_cluster_system_admin:
            return {key: self.request.user}
        return {}

    def get_queryset(self):
        response_plan_id = self.kwargs['response_plan_id']
        queryset = IndicatorReport.objects.filter(
            Q(reportable__cluster_objectives__isnull=False) |
            Q(reportable__cluster_activities__isnull=False) |
            Q(reportable__partner_projects__isnull=False) |
            Q(reportable__partner_activity_project_contexts__isnull=False)
        ).filter(
            Q(reportable__cluster_objectives__cluster__response_plan=response_plan_id,
              **self.get_user_check_kwarg('reportable__cluster_objectives__cluster__')) |
            Q(reportable__cluster_activities__cluster_objective__cluster__response_plan=response_plan_id,
                **self.get_user_check_kwarg('reportable__cluster_activities__cluster_objective__cluster__')) |
            Q(reportable__partner_projects__clusters__response_plan=response_plan_id,
                **self.get_user_check_kwarg('reportable__partner_projects__clusters__')) |
            Q(reportable__partner_activity_project_contexts__activity__cluster_activity__cluster_objective__cluster__response_plan=response_plan_id,  # noqa: E501
                **self.get_user_check_kwarg('reportable__partner_activity_project_contexts__activity__cluster_activity__cluster_objective__cluster__')) |  # noqa: E501
            Q(reportable__partner_activity_project_contexts__activity__cluster_objective__cluster__response_plan=response_plan_id,  # noqa: E501
                **self.get_user_check_kwarg('reportable__partner_activity_project_contexts__activity__cluster_objective__cluster__'))  # noqa: E501
        ).distinct()
        return queryset


class ClusterReportablesIdListAPIView(ListAPIView):
    """
    API for grabbing all Cluster Indicator instances as id & title pairs - GET
    Authentication required.

    Parameters:
    - response_plan_id - Response plan ID

    Returns:
        - GET method - ReportableIdSerializer object.
        - POST method - ReportableIdSerializer object.
    """
    permission_classes = (IsAuthenticated, )
    serializer_class = ReportableIdSerializer
    pagination_class = filterset_class = None

    def check_permissions(self, request):
        super().check_permissions(request)

        response_plan_id = self.kwargs.get('response_plan_id')
        roles_permitted = [PRP_ROLE_TYPES.cluster_imo]
        if request.method == 'GET':
            roles_permitted.extend([
                PRP_ROLE_TYPES.cluster_member,
                PRP_ROLE_TYPES.cluster_coordinator,
                PRP_ROLE_TYPES.cluster_viewer
            ])
        if not request.user.old_prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role__in=roles_permitted, cluster__response_plan_id=response_plan_id)
        ).exists():
            self.permission_denied(request)

    def get_user_check_kwarg(self, key):
        key = key + 'old_prp_roles__user'
        if not self.request.user.is_cluster_system_admin:
            return {key: self.request.user}
        return {}

    def get_queryset(self):
        response_plan_id = self.kwargs['response_plan_id']
        queryset = Reportable.objects.filter(
            Q(cluster_objectives__isnull=False) |
            Q(cluster_activities__isnull=False) |
            Q(partner_projects__isnull=False) |
            Q(partner_activity_project_contexts__isnull=False)
        ).filter(
            Q(cluster_objectives__cluster__response_plan=response_plan_id,
              **self.get_user_check_kwarg('cluster_objectives__cluster__')) |
            Q(cluster_activities__cluster_objective__cluster__response_plan=response_plan_id,
                **self.get_user_check_kwarg('cluster_activities__cluster_objective__cluster__')) |
            Q(partner_projects__clusters__response_plan=response_plan_id,
                **self.get_user_check_kwarg('partner_projects__clusters__')) |
            Q(partner_activity_project_contexts__activity__cluster_objective__cluster__response_plan=response_plan_id,   # noqa: E501
                **self.get_user_check_kwarg('partner_activity_project_contexts__activity__cluster_objective__cluster__'))  # noqa: E501
        ).distinct()
        return queryset


class ResponsePlanClusterDashboardAPIView(APIView):
    """
    Repsonse plan dashbaord from a Cluster (non-partner) perspective - GET
    Authentication required.

    ResponsePlanClusterDashboardAPIView provides a high-level IMO-reserved
    dashboard info for the specified response plan.

    Parameters:
    - response_plan_id - Response plan ID
    - cluster_id - Comma separated lsit of Cluster ID's

    Returns:
        - GET method - ClusterDashboardSerializer object.
    """
    permission_classes = (IsAuthenticated, )

    def check_response_plan_permission(self, request, obj):
        roles_permitted = [PRP_ROLE_TYPES.cluster_imo]

        if not request.user.partner:
            roles_permitted.extend([
                PRP_ROLE_TYPES.cluster_member,
                PRP_ROLE_TYPES.cluster_viewer,
                PRP_ROLE_TYPES.cluster_coordinator
            ])

        if not request.user.old_prp_roles.filter(
            Q(cluster__response_plan=obj, role__in=roles_permitted) |
            Q(role=PRP_ROLE_TYPES.cluster_system_admin)
        ).exists():
            self.permission_denied(request)

    def get_instance(self, request, response_plan_id=None):
        try:
            instance = ResponsePlan.objects.get(
                id=response_plan_id)
        except ResponsePlan.DoesNotExist:
            # TODO: log exception
            raise Http404
        self.check_response_plan_permission(request, instance)
        return instance

    def get(self, request, response_plan_id, *args, **kwargs):
        response_plan = self.get_instance(request, response_plan_id)
        cluster_ids = request.GET.get('cluster_id', None)

        # validate this cluster belongs to the response plan
        if cluster_ids:
            cluster_ids = list(map(lambda x: int(x), cluster_ids.split(',')))
            user_kwarg = {} if request.user.is_cluster_system_admin else {'old_prp_roles__user': request.user}
            clusters = Cluster.objects.filter(id__in=cluster_ids,
                                              response_plan=response_plan,
                                              **user_kwarg)
            if not clusters:
                return Response(
                    {"message": "Invalid cluster ids"},
                    status=statuses.HTTP_400_BAD_REQUEST
                )
        else:
            if request.user.is_cluster_system_admin:
                clusters = Cluster.objects.filter(response_plan=response_plan)
            else:
                clusters = response_plan.clusters.filter(old_prp_roles__user=request.user)

        serializer = ResponsePlanClusterDashboardSerializer(
            instance=response_plan, context={'clusters': clusters})
        return Response(serializer.data, status=statuses.HTTP_200_OK)


class ResponsePlanPartnerDashboardAPIView(ResponsePlanClusterDashboardAPIView):
    """
    Cluster Partner Dashboard API - GET
    Authentication required.

    ResponsePlanPartnerDashboardAPIView provides a high-level
    partner-reserved dashboard info for the specified response plan

    Kwargs Parameters:
    - response_plan_id - Response plan ID

    GET Parameters:
    - cluster_id - Cluster ID

    Returns:
        - GET method - ResponsePlanPartnerDashboardSerializer object.
    """
    permission_classes = (IsAuthenticated, )

    def check_response_plan_permission(self, request, obj):
        # called in inherited get_instance method
        roles_permitted = (
            PRP_ROLE_TYPES.cluster_member,
            PRP_ROLE_TYPES.cluster_viewer,
            PRP_ROLE_TYPES.cluster_coordinator,
        )

        if not request.user.old_prp_roles.filter(cluster__response_plan=obj, role__in=roles_permitted).exists():
            self.permission_denied(request)

    def get(self, request, response_plan_id, *args, **kwargs):
        response_plan = self.get_instance(request, response_plan_id)
        cluster_ids = request.GET.get('cluster_id', None)

        if not request.user.partner:
            raise Exception('User has no partner associated')

        # validate this cluster belongs to the response plan
        if cluster_ids:
            cluster_ids = list(map(lambda x: int(x), cluster_ids.split(',')))
            clusters = Cluster.objects.filter(id__in=cluster_ids,
                                              response_plan=response_plan,
                                              old_prp_roles__user=request.user)
            if not clusters:
                raise Exception('Invalid cluster ids')
        else:
            clusters = response_plan.clusters.filter(old_prp_roles__user=request.user)

        serializer = ResponsePlanPartnerDashboardSerializer(
            instance=response_plan, context={
                'clusters': clusters,
                'partner': request.user.partner
            })
        return Response(serializer.data, status=statuses.HTTP_200_OK)


class ClusterIndicatorsListExcelImportView(APIView):

    permission_classes = (IsAuthenticated, )

    def post(self, request, response_plan_id, format=None):

        # IMO user are able to upload any partner data
        if request.user.old_prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role=PRP_ROLE_TYPES.cluster_imo, cluster__response_plan_id=response_plan_id)
        ).exists():
            partner = None
        elif request.user.old_prp_roles.filter(
                role=PRP_ROLE_TYPES.cluster_member, cluster__response_plan_id=response_plan_id
        ).exists():
            partner = request.user.partner

            if not partner:
                raise ValidationError({
                    'partner': "Cannot find partner from this user. Is this user correctly configured?"
                })
        else:
            self.permission_denied(request)

        up_file = request.FILES['file']
        filepath = "/tmp/" + up_file.name
        destination = open(filepath, 'wb+')

        for chunk in up_file.chunks():
            destination.write(chunk)
            destination.close()

        reader = IndicatorsXLSXReader(filepath, partner)
        result = reader.import_data()

        if result:
            return Response({'parsing_errors': [result, ]}, status=statuses.HTTP_400_BAD_REQUEST)

        else:
            return Response({}, status=statuses.HTTP_200_OK)


class ClusterIndicatorsListExcelExportView(ListAPIView):
    """
    Cluster Indicator list export as excel API - GET
    Authentication required.

    Used for generating excel file from filtered indicators

    Parameters:
    - response_plan_id - Response plan ID

    Returns:
        - GET method - Cluster indicator list data as Excel file
    """
    permission_classes = (IsAuthenticated, )
    serializer_class = ClusterIndicatorReportSerializer
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filterset_class = ClusterIndicatorsFilter
    lookup_field = lookup_url_kwarg = 'response_plan_id'

    def check_permissions(self, request):
        super().check_permissions(request)

        response_plan_id = self.kwargs.get('response_plan_id')
        roles_permitted = [PRP_ROLE_TYPES.cluster_imo, PRP_ROLE_TYPES.cluster_member]

        if not request.user.old_prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role__in=roles_permitted, cluster__response_plan_id=response_plan_id)
        ).exists():
            self.permission_denied(request)

    def get_user_check_kwarg(self, key):
        key = key + 'old_prp_roles__user'
        if not self.request.user.is_cluster_system_admin:
            return {key: self.request.user}
        return {}

    def get_queryset(self):
        response_plan_id = self.kwargs.get(self.lookup_field)

        queryset = IndicatorReport.objects.filter(
            Q(reportable__cluster_objectives__isnull=False) |
            Q(reportable__cluster_activities__isnull=False) |
            Q(reportable__partner_projects__isnull=False) |
            Q(reportable__partner_activity_project_contexts__isnull=False)
        ).filter(
            Q(reportable__cluster_objectives__cluster__response_plan=response_plan_id,
              **self.get_user_check_kwarg('reportable__cluster_objectives__cluster__')) |
            Q(reportable__cluster_activities__cluster_objective__cluster__response_plan=response_plan_id,
                **self.get_user_check_kwarg('reportable__cluster_activities__cluster_objective__cluster__')) |
            Q(reportable__partner_projects__clusters__response_plan=response_plan_id,
                **self.get_user_check_kwarg('reportable__partner_projects__clusters__')) |
            Q(reportable__partner_activity_project_contexts__activity__cluster_activity__cluster_objective__cluster__response_plan=response_plan_id,   # noqa: E501
                **self.get_user_check_kwarg('reportable__partner_activity_project_contexts__activity__cluster_activity__cluster_objective__cluster__')) |  # noqa: E501
            Q(reportable__partner_activity_project_contexts__activity__cluster_objective__cluster__response_plan=response_plan_id,   # noqa: E501
                **self.get_user_check_kwarg('reportable__partner_activity_project_contexts__activity__cluster_objective__cluster__'))  # noqa: E501
        )
        return queryset

    def generate_excel(self, writer):
        import os.path
        file_path = writer.export_data()
        file_name = os.path.basename(file_path)
        file_content = open(file_path, 'rb').read()
        response = HttpResponse(file_content,
                                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        response['Content-Disposition'] = 'attachment; filename=' + file_name
        return response

    def list(self, request, response_plan_id, *args, **kwargs):
        # Render to excel
        indicators = self.filter_queryset(self.get_queryset())
        writer = IndicatorsXLSXExporter(indicators, response_plan_id)
        return self.generate_excel(writer)


class ClusterIndicatorsListExcelExportForAnalysisView(
        ClusterIndicatorsListExcelExportView):
    """
    Cluster Indicator list export as excel API for analysis - GET
    Authentication required.

    Used for generating excel file from filtered indicators

    Parameters:
    - response_plan_id - Response plan ID

    Returns:
        - GET method - Cluster indicator list data as Excel file
    """
    permission_classes = (IsAuthenticated, )

    def check_permissions(self, request):
        super().check_permissions(request)

        response_plan_id = self.kwargs.get('response_plan_id')

        if not request.user.old_prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role=PRP_ROLE_TYPES.cluster_imo, cluster__response_plan_id=response_plan_id) |
                Q(role=PRP_ROLE_TYPES.cluster_member, cluster__response_plan_id=response_plan_id)
        ).exists():
            self.permission_denied(request)

    def list(self, request, response_plan_id, *args, **kwargs):
        # Render to excel
        indicators = self.filter_queryset(self.get_queryset())
        writer = IndicatorsXLSXExporter(indicators, response_plan_id, analysis=True)
        return self.generate_excel(writer)


class ClusterIndicatorsLocationListAPIView(ListAPIView):
    """
    Locations from Cluster IndicatorReport export as excel API - GET
    Authentication required.

    Endpoint for getting all Indicator Locations objects for given plan

    Parameters:
    - response_plan_id - Response plan ID

    Returns:
        - GET method - ShortLocationSerializer object list.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = ShortLocationSerializer
    lookup_field = lookup_url_kwarg = 'response_plan_id'

    def get_queryset(self):
        response_plan_id = self.kwargs.get(self.lookup_field)
        result = IndicatorReport.objects.filter(
            Q(reportable__cluster_objectives__isnull=False) |
            Q(reportable__partner_projects__isnull=False) |
            Q(reportable__partner_activity_project_contexts__isnull=False)
        ).filter(
            Q(reportable__cluster_objectives__cluster__response_plan=response_plan_id) |
            Q(reportable__partner_projects__clusters__response_plan=response_plan_id) |
            Q(reportable__partner_activity_project_contexts__activity__cluster_activity__cluster_objective__cluster__response_plan=response_plan_id)  # noqa: E501
        ).values_list('reportable__indicator_reports__indicator_location_data__location', flat=True).distinct()
        return Location.objects.filter(pk__in=result)


class PartnerAnalysisSummaryAPIView(APIView):
    """
    Cluster analysis API for Partner - GET
    Authentication required.

    PartnerAnalysisSummaryAPIView provides a high-level summary
    for the specified partner: # of Activities, Recent progresses, etc.

    GET Parameter filters:
    - partner
    - project
    - activity
    - ca_indicator
    - cluster
    - report_status

    Returns:
        - GET method - PartnerAnalysisSummarySerializer object.
    """
    permission_classes = (IsAuthenticated,)

    def check_partner_permissions(self, request, obj):
        if not request.user.old_prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role=PRP_ROLE_TYPES.cluster_imo, cluster__partners=obj)
        ).exists():
            self.permission_denied(request)

    def get(self, request, *args, **kwargs):
        if 'partner' not in request.query_params:
            raise ValidationError("partner GET parameter is required.")

        serializer_context = {}

        partner = get_object_or_404(Partner, id=request.query_params.get('partner'))
        self.check_partner_permissions(request, partner)

        if 'project' in request.query_params:
            if request.query_params.get('project'):
                project = get_object_or_404(
                    PartnerProject, id=request.query_params.get('project'))

                if project.partner.id != partner.id:
                    raise ValidationError({
                        'project': "project does not belong to partner."
                    })

                serializer_context['project'] = project

        if 'activity' in request.query_params:
            if request.query_params.get('activity'):
                activity = get_object_or_404(
                    PartnerActivity, id=request.query_params.get('activity'))

                if activity.partner.id != partner.id:
                    raise ValidationError({
                        'activity': 'activity does not belong to partner.'
                    })

                serializer_context['activity'] = activity

        if 'ca_indicator' in request.query_params:
            if request.query_params.get('ca_indicator'):
                ca_indicator = get_object_or_404(Reportable, id=request.query_params.get('ca_indicator'))

                serializer_context['ca_indicator'] = ca_indicator

        if 'cluster_id' in request.query_params:
            if request.query_params.get('cluster_id'):
                cluster = get_object_or_404(
                    Cluster, id=request.query_params.get('cluster_id'))

                if not partner.clusters.filter(id=cluster.id).exists():
                    raise ValidationError({
                        'cluster_id': "cluster does not belong to partner."
                    })

                serializer_context['cluster'] = cluster

        if 'report_status' in request.query_params:
            serializer_context['report_status'] = request.query_params.get('report_status')

        serializer = PartnerAnalysisSummarySerializer(
            partner, context=serializer_context)

        return Response(serializer.data, status=statuses.HTTP_200_OK)


class PartnerAnalysisIndicatorResultAPIView(APIView):
    """
    Data API for given Cluster Partner analysis indicator - GET
    Authentication required.

    PartnerAnalysisIndicatorResultAPIView provides indicator progress data and
    IndicatorReport data for current and previous state.

    Parameters:
    - response_plan_id - Response plan ID
    - reportable_id - Reportable ID

    Returns:
        - GET method - ClusterPartnerAnalysisIndicatorResultSerializer object.
    """
    permission_classes = (IsAuthenticated,)

    def check_permissions(self, request):
        super().check_permissions(request)

        response_plan_id = self.kwargs.get('response_plan_id')
        roles_permitted = [PRP_ROLE_TYPES.cluster_imo]

        if not request.user.old_prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role__in=roles_permitted, cluster__response_plan_id=response_plan_id)
        ).exists():
            self.permission_denied(request)

    def get(self, request, response_plan_id, reportable_id, *args, **kwargs):
        reportable = get_object_or_404(Reportable, id=reportable_id)

        serializer = ClusterPartnerAnalysisIndicatorResultSerializer(reportable)

        return Response(serializer.data, status=statuses.HTTP_200_OK)


class OperationalPresenceAggregationDataAPIView(APIView):
    """
    Aggregation Data for Clusters in a ResponsePlan - GET
    Authentication required.

    Can be filtered using Cluster, Cluster objective, Partner type, Location type, and Location IDs

    Parameters:
    - response_plan_id - Response plan ID

    Returns:
        - GET method - A JSON object of many aggregations.
    """
    permission_classes = (IsAuthenticated, )

    def check_permissions(self, request):
        super().check_permissions(request)

        response_plan_id = self.kwargs.get('response_plan_id')

        if not request.user.old_prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role__in=(PRP_ROLE_TYPES.cluster_imo, PRP_ROLE_TYPES.cluster_member, PRP_ROLE_TYPES.cluster_viewer),
                  cluster__response_plan_id=response_plan_id)
        ).exists():
            self.permission_denied(request)

    def query_data(self, response_plan_id):
        response_plan = get_object_or_404(
            ResponsePlan,
            id=response_plan_id)

        filter_parameters = {
            'clusters': self.request.GET.get('clusters', None),
            'cluster_objectives': self.request.GET.get('cluster_objectives', None),
            'partner_types': self.request.GET.get('partner_types', None),
            'loc_type': self.request.GET.get('loc_type', '1'),
            'locs': self.request.GET.get('locs', None),
            'narrow_loc_type': self.request.GET.get('narrow_loc_type', None),
        }

        response_data = {
            "clusters": None,
            "num_of_clusters": None,
            "num_of_partners": None,
            "partners_per_type": None,
            "partners_per_cluster": None,
            "partners_per_cluster_objective": None,
        }

        clusters = Cluster.objects.filter(response_plan=response_plan)
        if not self.request.user.is_cluster_system_admin:
            clusters = clusters.filter(prp_roles__user=self.request.user)

        if filter_parameters['clusters']:
            clusters = clusters.filter(id__in=map(lambda x: int(x), filter_parameters['clusters'].split(',')))

        objectives = ClusterObjective.objects.filter(cluster__in=clusters)

        if filter_parameters['cluster_objectives']:
            objectives = objectives.filter(
                id__in=map(lambda x: int(x), filter_parameters['cluster_objectives'].split(','))
            )

        if filter_parameters['partner_types']:
            partner_types = filter_parameters['partner_types'].split(',')

        else:
            partner_types = list(clusters.values_list('partners__partner_type', flat=True).distinct())

        response_data["clusters"] = ClusterSimpleSerializer(clusters.distinct(), many=True).data
        response_data["num_of_clusters"] = clusters.count()
        response_data["num_of_partners"] = Partner.objects.filter(clusters__in=clusters).distinct().count()
        response_data["partners_per_type"] = {}
        response_data["partners_per_cluster"] = {}
        response_data["partners_per_cluster_objective"] = {}

        partner_types = set(partner_types)
        partner_types.discard(None)

        # As long as clusters have any partners
        if partner_types:
            for partner_type in partner_types:
                response_data["partners_per_type"][PARTNER_TYPE[partner_type]] = Partner.objects.filter(
                    partner_type=partner_type, clusters__in=clusters
                ).distinct().values_list('title', flat=True)

            for cluster in clusters:
                cluster_type = cluster.type.capitalize()
                response_data["partners_per_cluster"][cluster_type] = cluster.partners.values_list('title', flat=True)

            for objective in objectives:
                cluster_type = objective.cluster.type.capitalize()
                objective_title = objective.title + " (" + cluster_type + ")"
                response_data["partners_per_cluster_objective"][objective_title] = \
                    Partner.objects.filter(clusters__cluster_objectives=objective).values_list('title', flat=True)

        return response_data

    def get(self, request, response_plan_id):
        if self.request.GET.get('narrow_loc_type', None):
            if int(self.request.GET.get('narrow_loc_type', None)) <= int(self.request.GET.get('loc_type', None)):
                return Response(
                    {"message": "narrow_loc_type cannot be equal or higher than loc_type."},
                    status=statuses.HTTP_400_BAD_REQUEST
                )

        return Response(self.query_data(response_plan_id))


class OperationalPresenceLocationListAPIView(GenericAPIView, ListModelMixin):
    """
    Locations for Clusters in a ResponsePlan as geoJSON list - GET
    Authentication required.

    Can be filtered using Cluster, Cluster objective, Partner type, Location type, and Location IDs

    Parameters:
    - response_plan_id - Response plan ID

    Returns:
        - GET method - OperationalPresenceLocationListSerializer object list.
    """
    permission_classes = (IsAuthenticated, )
    serializer_class = OperationalPresenceLocationListSerializer
    lookup_field = lookup_url_kwarg = 'response_plan_id'

    def check_permissions(self, request):
        super().check_permissions(request)

        response_plan_id = self.kwargs.get('response_plan_id')

        if not request.user.old_prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role__in=(PRP_ROLE_TYPES.cluster_imo, PRP_ROLE_TYPES.cluster_member, PRP_ROLE_TYPES.cluster_viewer),
                  cluster__response_plan_id=response_plan_id)
        ).exists():
            self.permission_denied(request)

    def get(self, request, response_plan_id):
        if self.request.GET.get('narrow_loc_type', None):
            if int(self.request.GET.get('narrow_loc_type', None)) <= int(self.request.GET.get('loc_type', None)):
                return Response(
                    {"message": "narrow_loc_type cannot be equal or higher than loc_type."},
                    status=statuses.HTTP_400_BAD_REQUEST
                )

        return self.list(request, response_plan_id)

    def get_queryset(self):
        response_plan = get_object_or_404(
            ResponsePlan,
            id=self.kwargs.get(self.lookup_field))

        filter_parameters = {
            'clusters': self.request.GET.get('clusters', None),
            'cluster_objectives': self.request.GET.get('cluster_objectives', None),
            'partner_types': self.request.GET.get('partner_types', None),
            'loc_type': self.request.GET.get('loc_type', '1'),
            'locs': self.request.GET.get('locs', None),
            'narrow_loc_type': self.request.GET.get('narrow_loc_type', None),
        }

        loc_ids = None
        clusters = Cluster.objects.filter(response_plan=response_plan)

        if filter_parameters['clusters']:
            clusters = clusters.filter(id__in=map(lambda x: int(x), filter_parameters['clusters'].split(',')))

        objectives = ClusterObjective.objects.filter(cluster__in=clusters)

        if filter_parameters['cluster_objectives']:
            objectives = objectives.filter(
                id__in=map(lambda x: int(x), filter_parameters['cluster_objectives'].split(','))
            )

        cluster_obj_pa_reportable_loc = ReportableLocationGoal.objects.filter(
            reportable__partner_activity_project_contexts__activity__cluster_activity__cluster_objective__in=objectives
        ).distinct().values_list('location_id', flat=True)

        cluster_obj_pa_custom_reportable_loc = ReportableLocationGoal.objects.filter(
            reportable__partner_activity_project_contexts__activity__cluster_objective__in=objectives
        ).distinct().values_list('location_id', flat=True)

        if filter_parameters['partner_types']:
            partner_types = filter_parameters['partner_types'].split(',')

        else:
            partner_types = list()

            if cluster_obj_pa_reportable_loc.exists():
                partner_types.extend(cluster_obj_pa_reportable_loc.values_list(
                    'reportable__partner_activity_project_contexts__activity'
                    '__cluster_activity__'
                    'cluster_objective__'
                    'cluster__partners__partner_type', flat=True).distinct()
                )

            if cluster_obj_pa_custom_reportable_loc.exists():
                partner_types.extend(cluster_obj_pa_custom_reportable_loc.values_list(
                    'reportable__'
                    'partner_activity_project_contexts__activity__'
                    'cluster_objective__'
                    'cluster__partners__'
                    'partner_type', flat=True)
                    .distinct()
                )

        partner_types_loc = list()

        if cluster_obj_pa_reportable_loc.exists():
            partner_types_loc.extend(cluster_obj_pa_reportable_loc.filter(
                reportable__partner_activity_project_contexts__activity__cluster_activity__cluster_objective__cluster__partners__partner_type__in=partner_types  # noqa: #E501
            ).distinct().values_list('location_id', flat=True))

        if cluster_obj_pa_custom_reportable_loc.exists():
            partner_types_loc.extend(cluster_obj_pa_custom_reportable_loc.filter(
                reportable__partner_activity_project_contexts__activity__cluster_objective__cluster__partners__partner_type__in=partner_types
            ).distinct().values_list('location_id', flat=True))

        loc_ids = set(partner_types_loc)
        result = Location.objects.filter(id__in=loc_ids)

        if filter_parameters['loc_type'] and filter_parameters['locs'] and filter_parameters['narrow_loc_type']:
            final_result = Location.objects.filter(
                Q(parent__id__in=map(lambda x: int(x), filter_parameters['locs'].split(','))) &
                Q(admin_level=int(filter_parameters['narrow_loc_type']))
            )

        else:
            final_result = result.filter(
                admin_level=int(filter_parameters['loc_type'])
            )

            if filter_parameters['locs']:
                final_result = final_result.filter(id__in=map(lambda x: int(x), filter_parameters['locs'].split(',')))

        return final_result.annotate(
            processed_geom_json=AsGeoJSON('geom', precision=3),
            processed_point_json=AsGeoJSON('point', precision=3)
        )


class ClusterAnalysisIndicatorsListAPIView(GenericAPIView, ListModelMixin):
    """
    Indicator list data for Clusters in a ResponsePlan - GET
    Authentication required.

    Can be filtered using Cluster, Cluster objective, Partner type, Location type, Indicator type, and Location IDs

    indicator_type GET parameter values -
    * cluster_activity
    * cluster_objective
    * partner_project
    * partner_activity

    Parameters:
    - response_plan_id - Response plan ID

    Returns:
        - GET method - ClusterAnalysisIndicatorsListSerializer object list.
    """
    permission_classes = (IsAuthenticated, )
    serializer_class = ClusterAnalysisIndicatorsListSerializer
    lookup_field = lookup_url_kwarg = 'response_plan_id'

    def check_permissions(self, request):
        super().check_permissions(request)

        response_plan_id = self.kwargs.get('response_plan_id')

        if not request.user.old_prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role=PRP_ROLE_TYPES.cluster_imo, cluster__response_plan_id=response_plan_id) |
                Q(role=PRP_ROLE_TYPES.cluster_member, cluster__response_plan_id=response_plan_id)
        ).exists():
            self.permission_denied(request)

    def get(self, request, response_plan_id):
        return self.list(request, response_plan_id)

    def get_queryset(self):
        response_plan = get_object_or_404(
            ResponsePlan,
            id=self.kwargs.get(self.lookup_field))

        filter_parameters = {
            'clusters': self.request.GET.get('clusters', None),
            'cluster_objectives': self.request.GET.get('cluster_objectives', None),
            'partner_types': self.request.GET.get('partner_types', None),
            'loc_type': self.request.GET.get('loc_type', '1'),
            'locs': self.request.GET.get('locs', None),
            'projects': self.request.GET.get('projects', None),
            'narrow_loc_type': self.request.GET.get('narrow_loc_type', None),
            'indicator_type': self.request.GET.get('indicator_type', 'all'),
        }

        clusters = Cluster.objects.filter(response_plan=response_plan)

        if filter_parameters['clusters']:
            clusters = clusters.filter(id__in=map(lambda x: int(x), filter_parameters['clusters'].split(',')))

            # validate this cluster belongs to the response plan
            if not clusters:
                raise Exception('Invalid cluster ids')

        objectives = ClusterObjective.objects.filter(cluster__in=clusters)

        if filter_parameters['cluster_objectives']:
            objectives = objectives.filter(
                id__in=map(lambda x: int(x), filter_parameters['cluster_objectives'].split(','))
            )

        if filter_parameters['projects']:
            projects = PartnerProject.objects.filter(
                id__in=map(lambda x: int(x), filter_parameters['projects'].split(','))
            )

        else:
            # Defaulting partner projects from given clusters
            projects = PartnerProject.objects.filter(
                partner__clusters__in=clusters
            ).distinct()

        if filter_parameters['partner_types']:
            partner_types = filter_parameters['partner_types'].split(',')

            cluster_activity_q = Q(
                content_type__model="clusteractivity",
                cluster_activities__cluster_objective__in=objectives,
                cluster_activities__cluster_objective__cluster__partners__partner_type__in=partner_types,
            )

            cluster_objective_q = Q(
                content_type__model="clusterobjective",
                cluster_objectives__in=objectives,
                cluster_objectives__cluster__partners__partner_type__in=partner_types,
            )

            partner_activity_q = Q(
                content_type__model="partneractivityprojectcontext",
                partner_activity_project_contexts__activity__partner__clusters__in=clusters,
                partner_activity_project_contexts__activity__partner__partner_type__in=partner_types,
                partner_activity_project_contexts__activity__projects__in=projects,
            )

            partner_project_q = Q(
                content_type__model="partnerproject",
                partner_projects__clusters__in=clusters,
                partner_projects__partner__partner_type__in=partner_types,
                partner_projects__in=projects,
            )

        else:
            cluster_activity_q = Q(
                content_type__model="clusteractivity",
                cluster_activities__cluster_objective__in=objectives,
            )

            cluster_objective_q = Q(
                content_type__model="clusterobjective",
                cluster_objectives__in=objectives,
            )

            partner_activity_q = Q(
                content_type__model="partneractivityprojectcontext",
                partner_activity_project_contexts__activity__partner__clusters__in=clusters,
                partner_activity_project_contexts__activity__projects__in=projects,
            )

            partner_project_q = Q(
                content_type__model="partnerproject",
                partner_projects__clusters__in=clusters,
                partner_projects__in=projects,
            )

        if filter_parameters['indicator_type'] == 'all':
            indicators = Reportable.objects.filter(
                cluster_activity_q | cluster_objective_q | partner_activity_q | partner_project_q)

        elif filter_parameters['indicator_type'] == 'cluster_activity':
            indicators = Reportable.objects.filter(cluster_activity_q)

        elif filter_parameters['indicator_type'] == 'cluster_objective':
            indicators = Reportable.objects.filter(cluster_objective_q)

        elif filter_parameters['indicator_type'] == 'partner_project':
            indicators = Reportable.objects.filter(partner_project_q)

        elif filter_parameters['indicator_type'] == 'partner_activity':
            indicators = Reportable.objects.filter(partner_activity_q)

        if filter_parameters['loc_type'] and filter_parameters['locs'] and filter_parameters['narrow_loc_type']:
            indicators = indicators.filter(
                Q(reportablelocationgoal__location__parent__id__in=map(
                    lambda x: int(x), filter_parameters['locs'].split(','))) &
                Q(reportablelocationgoal__location__admin_level=int(filter_parameters['narrow_loc_type']))
            )

        else:
            indicators = indicators.filter(
                reportablelocationgoal__location__admin_level=int(filter_parameters['loc_type'])
            )

            if filter_parameters['locs']:
                indicators = indicators.filter(reportablelocationgoal__location__id__in=map(
                    lambda x: int(x), filter_parameters['locs'].split(','))
                )

        return indicators.distinct()


class ClusterAnalysisIndicatorDetailsAPIView(APIView):
    """
    Indicator expansion detail data for Clusters in a ResponsePlan - GET
    Authentication required.

    Parameters:
    - response_plan_id - Response plan ID
    - reportable_id - Reportable ID

    Returns:
        - GET method - ClusterAnalysisIndicatorDetailSerializer object list.
    """
    permission_classes = (IsAuthenticated,)

    def check_permissions(self, request):
        super().check_permissions(request)

        response_plan_id = self.kwargs.get('response_plan_id')
        roles_permitted = [PRP_ROLE_TYPES.cluster_imo, PRP_ROLE_TYPES.cluster_member]

        if not request.user.old_prp_roles.filter(
                Q(role=PRP_ROLE_TYPES.cluster_system_admin) |
                Q(role__in=roles_permitted, cluster__response_plan_id=response_plan_id)
        ).exists():
            self.permission_denied(request)

    def get(self, request, response_plan_id, reportable_id, *args, **kwargs):
        reportable = get_object_or_404(
            Reportable, id=reportable_id)

        serializer = ClusterAnalysisIndicatorDetailSerializer(reportable)

        return Response(serializer.data, status=statuses.HTTP_200_OK)


class AssignableClustersListView(ListAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = ClusterIDManagementSerializer

    def get_queryset(self):
        user = self.request.user
        user_prp_roles = set(user.role_list)

        queryset = Cluster.objects.select_related('response_plan', 'response_plan__workspace')

        if PRP_ROLE_TYPES.cluster_system_admin in user_prp_roles:
            return queryset
        if PRP_ROLE_TYPES.cluster_imo in user_prp_roles:
            return queryset.filter(old_prp_roles__user=user, old_prp_roles__role=PRP_ROLE_TYPES.cluster_imo)
        if PRP_ROLE_TYPES.cluster_member in user_prp_roles:
            return queryset.filter(old_prp_roles__user=user, old_prp_roles__role=PRP_ROLE_TYPES.cluster_member)

        raise PermissionDenied()
