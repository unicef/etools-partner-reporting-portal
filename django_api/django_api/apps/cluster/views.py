import logging

from django.db.models import Q
from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, ListAPIView, RetrieveAPIView
from rest_framework import status as statuses

import django_filters

from core.permissions import IsAuthenticated
from core.paginations import SmallPagination
from core.serializers import ShortLocationSerializer
from core.models import Location, ResponsePlan
from indicator.serializers import (
    ClusterIndicatorReportSerializer, ClusterIndicatorReportSimpleSerializer,
    ClusterPartnerAnalysisIndicatorResultSerializer,
)
from indicator.models import IndicatorReport, Reportable
from partner.models import (
    Partner,
    PartnerProject,
    PartnerActivity,
)

from cluster.export_indicators import IndicatorsXLSXExporter
from cluster.models import ClusterObjective, ClusterActivity, Cluster
from cluster.serializers import (
    ClusterSimpleSerializer,
    ClusterObjectiveSerializer,
    ClusterObjectivePatchSerializer,
    ClusterActivitySerializer,
    ClusterActivityPatchSerializer,
    ResponsePlanClusterDashboardSerializer,
    ResponsePlanPartnerDashboardSerializer,
    PartnerAnalysisSummarySerializer,
)
from cluster.filters import (
    ClusterObjectiveFilter,
    ClusterActivityFilter,
    ClusterIndicatorsFilter,
    ClusterFilter,
)

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
    filter_class = ClusterFilter

    def get_queryset(self, *args, **kwargs):
        queryset = Cluster.objects
        response_plan_id = self.kwargs.get(self.lookup_field)
        if response_plan_id:
            return queryset.filter(response_plan_id=response_plan_id)
        return queryset.all()


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
        - DELETE method - 204 response code
    """
    serializer_class = ClusterObjectiveSerializer
    permission_classes = (IsAuthenticated, )

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
        return instance

    def get(self, request, pk, *args, **kwargs):
        instance = self.get_instance(request, pk)
        serializer = ClusterObjectiveSerializer(instance=instance)
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def patch(self, request, pk, *args, **kwargs):
        serializer = ClusterObjectivePatchSerializer(
            instance=self.get_instance(self.request, pk=pk),
            data=self.request.data
        )
        if not serializer.is_valid():
            return Response(serializer.errors,
                            status=statuses.HTTP_400_BAD_REQUEST)
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
            return Response({"id": "This field is required!"},
                            status=statuses.HTTP_400_BAD_REQUEST)

        if not serializer.is_valid():
            return Response(serializer.errors,
                            status=statuses.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        instance = self.get_instance(request)
        instance.delete()
        return Response(status=statuses.HTTP_204_NO_CONTENT)


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
    filter_class = ClusterObjectiveFilter

    #
    # def get_queryset(self, *args, **kwargs):
    #     return ClusterObjective.objects.select_related('cluster').all()

    def get_queryset(self, *args, **kwargs):
        response_plan_id = self.kwargs.get('response_plan_id')

        queryset = ClusterObjective.objects.select_related('cluster').filter(
            cluster__response_plan_id=response_plan_id)

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
        serializer = ClusterObjectiveSerializer(data=self.request.data)

        if not serializer.is_valid():
            return Response(serializer.errors,
                            status=statuses.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response({'id': serializer.instance.id},
                        status=statuses.HTTP_201_CREATED)


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
        - DELETE method - 204 response code
    """
    permission_classes = (IsAuthenticated, )

    def get_instance(self, request, pk=None):
        try:
            instance = ClusterActivity.objects.get(
                id=(pk or request.data['id']))
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
            return Response(serializer.errors,
                            status=statuses.HTTP_400_BAD_REQUEST)
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
            return Response({"id": "This field is required!"},
                            status=statuses.HTTP_400_BAD_REQUEST)

        if not serializer.is_valid():
            return Response(serializer.errors,
                            status=statuses.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def delete(self, request, pk, *args, **kwargs):
        instance = self.get_instance(request, pk)
        instance.delete()
        return Response(status=statuses.HTTP_204_NO_CONTENT)


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
    filter_class = ClusterActivityFilter

    def get_queryset(self, *args, **kwargs):
        response_plan_id = self.kwargs.get('response_plan_id')

        queryset = ClusterActivity.objects.select_related('cluster_objective__cluster').filter(
            cluster_objective__cluster__response_plan_id=response_plan_id)

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
        serializer = ClusterActivitySerializer(data=self.request.data)

        if not serializer.is_valid():
            return Response(serializer.errors,
                            status=statuses.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response({'id': serializer.instance.id},
                        status=statuses.HTTP_201_CREATED)


class IndicatorReportsListAPIView(ListCreateAPIView, RetrieveAPIView):
    """
    Cluster IndicatorReport object list API - GET/POST
    Authentication required.

    Parameters:
    - response_plan_id - Response plan ID

    GET query parameters:
    * cluster - Integer ID for cluster
    * partner - Integer ID for partner
    * indicator - Integer ID for IndicatorReport
    * project - Integer ID for project
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
    filter_class = ClusterIndicatorsFilter

    def get_queryset(self):
        response_plan_id = self.kwargs['response_plan_id']
        queryset = IndicatorReport.objects.filter(
            Q(reportable__cluster_objectives__isnull=False)
            | Q(reportable__cluster_activities__isnull=False)
            | Q(reportable__partner_projects__isnull=False)
            | Q(reportable__partner_activities__isnull=False)
        ).filter(
            Q(reportable__cluster_objectives__cluster__response_plan=response_plan_id)
            | Q(reportable__cluster_activities__cluster_objective__cluster__response_plan=response_plan_id)
            | Q(reportable__partner_projects__clusters__response_plan=response_plan_id)
            | Q(reportable__partner_activities__cluster_activity__cluster_objective__cluster__response_plan=response_plan_id)  # noqa: E501
        )
        return queryset


class IndicatorReportDetailAPIView(RetrieveAPIView):

    permission_classes = (IsAuthenticated, )
    serializer_class = ClusterIndicatorReportSerializer
    get_queryset = IndicatorReportsListAPIView.get_queryset


class IndicatorReportsSimpleListAPIView(IndicatorReportsListAPIView):
    """
    Cluster IndicatorReportsListAPIView simplified API - GET/POST
    Authentication required.

    Parameters:
    - response_plan_id - Response plan ID

    Returns:
        - GET method - ClusterIndicatorReportSimpleSerializer object.
        - POST method - ClusterIndicatorReportSimpleSerializer object.
    """
    serializer_class = ClusterIndicatorReportSimpleSerializer
    pagination_class = filter_class = None


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

    def get_instance(self, request, response_plan_id=None):
        try:
            instance = ResponsePlan.objects.get(
                id=response_plan_id)
        except ResponsePlan.DoesNotExist:
            # TODO: log exception
            raise Http404
        return instance

    def get(self, request, response_plan_id, *args, **kwargs):
        response_plan = self.get_instance(request, response_plan_id)
        cluster_ids = request.GET.get('cluster_id', None)

        # validate this cluster belongs to the response plan
        if cluster_ids:
            cluster_ids = cluster_ids.split(',')
            clusters = Cluster.objects.filter(id__in=cluster_ids,
                                              response_plan=response_plan)
            if not clusters:
                raise Exception('Invalid cluster ids')
        else:
            clusters = []

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

    def get(self, request, response_plan_id, *args, **kwargs):
        response_plan = self.get_instance(request, response_plan_id)
        cluster_ids = request.GET.get('cluster_id', None)

        if not request.user.partner:
            raise Exception('User has no partner associated')

        # validate this cluster belongs to the response plan
        if cluster_ids:
            cluster_ids = cluster_ids.split(',')
            clusters = Cluster.objects.filter(id__in=cluster_ids,
                                              response_plan=response_plan)
            if not clusters:
                raise Exception('Invalid cluster ids')
        else:
            clusters = []

        serializer = ResponsePlanPartnerDashboardSerializer(
            instance=response_plan, context={
                'clusters': clusters,
                'partner': request.user.partner
            })
        return Response(serializer.data, status=statuses.HTTP_200_OK)


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
    permission_classes = (IsAuthenticated,)
    serializer_class = ClusterIndicatorReportSerializer
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = ClusterIndicatorsFilter
    lookup_field = lookup_url_kwarg = 'response_plan_id'

    def get_queryset(self):
        response_plan_id = self.kwargs.get(self.lookup_field)
        queryset = IndicatorReport.objects.filter(
            Q(reportable__cluster_objectives__isnull=False)
            | Q(reportable__cluster_activities__isnull=False)
            | Q(reportable__partner_projects__isnull=False)
            | Q(reportable__partner_activities__isnull=False)
        ).filter(
            Q(reportable__cluster_objectives__cluster__response_plan=response_plan_id)
            | Q(reportable__cluster_activities__cluster_objective__cluster__response_plan=response_plan_id)
            | Q(reportable__partner_projects__clusters__response_plan=response_plan_id)
            | Q(reportable__partner_activities__cluster_activity__cluster_objective__cluster__response_plan=response_plan_id)  # noqa: E501
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
    permission_classes = (IsAuthenticated, )
    serializer_class = ShortLocationSerializer
    lookup_field = lookup_url_kwarg = 'response_plan_id'

    def get_queryset(self):
        response_plan_id = self.kwargs.get(self.lookup_field)
        result = IndicatorReport.objects.filter(
            Q(reportable__partner_projects__isnull=False)
            | Q(reportable__partner_activities__isnull=False)
        ).filter(
            Q(reportable__partner_projects__clusters__response_plan=response_plan_id)
            | Q(reportable__partner_activities__cluster_activity__cluster_objective__cluster__response_plan=response_plan_id)  # noqa: E501
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
    permission_classes = (IsAuthenticated, )

    def get(self, request, *args, **kwargs):
        if 'partner' not in request.query_params:
            return Response({'message': "partner GET parameter is required."}, status=statuses.HTTP_400_BAD_REQUEST)

        serializer_context = {}

        partner = get_object_or_404(
            Partner, id=request.query_params.get('partner'))

        if 'project' in request.query_params:
            if request.query_params.get('project'):
                project = get_object_or_404(
                    PartnerProject, id=request.query_params.get('project'))

                if project.partner.id != partner.id:
                    return Response(
                        {'message': "project does not belong to partner."}, status=statuses.HTTP_400_BAD_REQUEST
                    )

                serializer_context['project'] = project

        if 'activity' in request.query_params:
            if request.query_params.get('activity'):
                activity = get_object_or_404(
                    PartnerActivity, id=request.query_params.get('activity'))

                if activity.partner.id != partner.id:
                    return Response(
                        {'message': "activity does not belong to partner."}, status=statuses.HTTP_400_BAD_REQUEST
                    )

                serializer_context['activity'] = activity

        if 'ca_indicator' in request.query_params:
            if request.query_params.get('ca_indicator'):
                ca_indicator = get_object_or_404(
                    Reportable,
                    id=request.query_params.get('ca_indicator'))

                serializer_context['ca_indicator'] = ca_indicator

        if 'cluster_id' in request.query_params:
            if request.query_params.get('cluster_id'):
                cluster = get_object_or_404(
                    Cluster, id=request.query_params.get('cluster_id'))

                if not partner.clusters.filter(id=cluster.id).exists():
                    return Response(
                        {'message': "cluster does not belong to partner."}, status=statuses.HTTP_400_BAD_REQUEST
                    )

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
    permission_classes = (IsAuthenticated, )

    def get(self, request, response_plan_id, reportable_id, *args, **kwargs):
        reportable = get_object_or_404(Reportable, id=reportable_id)

        serializer = ClusterPartnerAnalysisIndicatorResultSerializer(reportable)

        return Response(serializer.data, status=statuses.HTTP_200_OK)
