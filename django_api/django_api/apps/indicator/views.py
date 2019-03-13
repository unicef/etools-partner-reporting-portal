from datetime import date, datetime
import operator
import logging

from django.conf import settings
from django.db.models import Q
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.http import Http404

from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListCreateAPIView, ListAPIView, RetrieveAPIView, CreateAPIView, UpdateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

import django_filters.rest_framework

from core.permissions import (
    AnyPermission,
    IsUNICEFAPIUser,
    IsAuthenticated,
    IsPartnerAuthorizedOfficerForCurrentWorkspace,
    IsPartnerEditorForCurrentWorkspace,
    HasAnyRole,
)
from core.paginations import SmallPagination
from core.models import Location
from core.common import (
    INDICATOR_REPORT_STATUS,
    REPORTABLE_LLO_CONTENT_OBJECT,
    REPORTABLE_CO_CONTENT_OBJECT,
    REPORTABLE_CA_CONTENT_OBJECT,
    REPORTABLE_PP_CONTENT_OBJECT,
    REPORTABLE_PA_CONTENT_OBJECT,
    OVERALL_STATUS,
    REPORTABLE_FREQUENCY_LEVEL,
    PRP_ROLE_TYPES,
)
from core.serializers import ShortLocationSerializer
from unicef.models import ProgressReport
from unicef.permissions import UnicefPartnershipManagerOrRead
from utils.emails import send_email_from_template

from .disaggregators import (
    QuantityIndicatorDisaggregator,
    RatioIndicatorDisaggregator,
)
from .serializers import (
    IndicatorListSerializer,
    IndicatorReportListSerializer,
    PDReportContextIndicatorReportSerializer,
    IndicatorLocationDataUpdateSerializer,
    OverallNarrativeSerializer,
    ClusterIndicatorSerializer,
    DisaggregationListSerializer,
    IndicatorReportReviewSerializer,
    IndicatorReportSimpleSerializer,
    ReportRefreshSerializer,
    ReportableLocationGoalBaselineInNeedSerializer,
    ClusterIndicatorIMOMessageSerializer,
    ReportableReportingFrequencyIdSerializer,
)
from .filters import IndicatorFilter, PDReportsFilter
from .models import (
    IndicatorBlueprint,
    IndicatorReport,
    Reportable,
    IndicatorLocationData,
    Disaggregation,
    ReportableLocationGoal
)
from .utilities import delete_all_ilds_for_ir, delete_all_irs_for_pr
from functools import reduce

logger = logging.getLogger(__name__)


class DisaggregationListCreateAPIView(ListCreateAPIView):
    """
    Endpoint to view and create new disaggregations
    """
    serializer_class = DisaggregationListSerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = SmallPagination

    def get_queryset(self, *args, **kwargs):
        response_plan_id = self.kwargs.get('response_plan_id')
        return Disaggregation.objects.filter(
            response_plan__id=response_plan_id)


class PDReportsAPIView(ListAPIView):

    serializer_class = PDReportContextIndicatorReportSerializer
    pagination_class = SmallPagination
    permission_classes = (IsAuthenticated, )
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = PDReportsFilter

    def get_queryset(self):
        from unicef.models import ProgrammeDocument

        pd = get_object_or_404(ProgrammeDocument, pk=self.pd_id)

        if pd.partner != self.request.user.partner:
            self.permission_denied(self.request)

        pks = pd.reportable_queryset.values_list(
            'indicator_reports__pk', flat=True)
        return IndicatorReport.objects.filter(id__in=pks)

    def list(self, request, pd_id, *args, **kwargs):
        """
        Get Indicator reports by given Programme Document pk.
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


class PDReportsDetailAPIView(RetrieveAPIView):

    serializer_class = PDReportContextIndicatorReportSerializer
    permission_classes = (IsAuthenticated, )

    def check_permissions(self, request):
        super().check_permissions(request)
        pd_id = self.kwargs['pd_id']
        if not request.user.partner.programmedocument_set.filter(id=pd_id).exists():
            self.permission_denied(request)

    def get_indicator_report(self, report_id):
        try:
            return IndicatorReport.objects.get(id=report_id)
        except IndicatorReport.DoesNotExist as exp:
            logger.exception({
                "endpoint": "PDReportsDetailAPIView",
                "request.data": self.request.data,
                "report_id": report_id,
                "exception": exp,
            })
            raise Http404

    def get(self, request, pd_id, report_id, *args, **kwargs):
        indicator_report = self.get_indicator_report(report_id)
        serializer = self.get_serializer(indicator_report)
        return Response(serializer.data, status=status.HTTP_200_OK)


class IndicatorListAPIView(ListAPIView):
    """
    REST API endpoint to get a list of Indicator objects and to create a new
    Indicator object.

    List filtering keywords:
    - locations (A comma-separated location id list)
    - pds (A comma-separated programme document id list)
    - pd_statuses (A comma-separated PD_STATUS string list)
    - blueprint__title (string as Indicator title)

    Filtering list Example:
     - /api/indicator/<content_object>/?blueprint__title=indicator_blueprint_0
     - /api/indicator/<content_object>/?locations=20,21,24&blueprint__title=indicator_blueprint_17
     - /api/indicator/<content_object>/?pds=37,63,65
     - /api/indicator/<content_object>/?content_object=co,object_id=34    [for cluster objective indicators]
     - /api/indicator/<content_object>/                                   [will throw exception]
    """
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
    serializer_class = IndicatorListSerializer
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = IndicatorFilter
    lookup_url_kwarg = 'content_object'

    def get_queryset(self):
        content_object = self.kwargs.get(self.lookup_url_kwarg)
        if content_object == REPORTABLE_LLO_CONTENT_OBJECT:
            queryset = Reportable.objects.filter(
                lower_level_outputs__isnull=False)
        elif content_object == REPORTABLE_CO_CONTENT_OBJECT:
            queryset = Reportable.objects.filter(
                cluster_objectives__isnull=False)
        elif content_object == REPORTABLE_CA_CONTENT_OBJECT:
            queryset = Reportable.objects.filter(
                cluster_activities__isnull=False)
        elif content_object == REPORTABLE_PP_CONTENT_OBJECT:
            queryset = Reportable.objects.filter(
                partner_projects__isnull=False)
        elif content_object == REPORTABLE_PA_CONTENT_OBJECT:
            queryset = Reportable.objects.filter(
                partner_activities__isnull=False)
        else:
            raise Http404

        object_id = self.request.query_params.get('object_id', None)
        if content_object is not None and object_id is not None:
            queryset = queryset.filter(object_id=object_id)

        q_list = []

        locations = self.request.query_params.get('locations', None)
        pds = self.request.query_params.get('pds', None)

        clusters = self.request.query_params.get('clusters', None)
        pd_statuses = self.request.query_params.get('pd_statuses', None)

        if locations:
            location_list = map(
                lambda item: int(item),
                filter(
                    lambda item: item != '' and item.isdigit(),
                    locations.split(',')))
            q_list.append(Q(locations__id__in=location_list))

        if pds:
            pd_list = map(
                lambda item: int(item),
                filter(
                    lambda item: item != '' and item.isdigit(),
                    pds.split(',')))
            q_list.append(
                Q(lower_level_outputs__cp_output__programme_document__id__in=pd_list))

        if clusters:
            cluster_list = list(map(lambda item: int(item), filter(
                lambda item: item != '' and item.isdigit(), clusters.split(
                    ','))))
            q_list.append(Q(cluster_objectives__cluster__id__in=cluster_list))
            q_list.append(Q(
                cluster_activities__cluster_objective__cluster__id__in=cluster_list))
            q_list.append(Q(partner_projects__clusters__id__in=cluster_list))
            q_list.append(Q(
                partner_activities__project__clusters__id__in=cluster_list))

        if pd_statuses:
            pd_status_list = map(
                lambda item: item,
                filter(
                    lambda item: item != '' and item.isdigit(),
                    pd_statuses.split(',')))
            q_list.append(
                Q(lower_level_outputs__cp_output__programme_document__status__in=pd_status_list))

        if q_list:
            queryset = queryset.filter(reduce(operator.or_, q_list))

        queryset = queryset.distinct()

        return queryset


class ReportableDetailAPIView(RetrieveAPIView):
    """
    Get details about a single Reportable, its blueprint, its disaggregations
    etc.
    """
    serializer_class = IndicatorListSerializer
    queryset = Reportable.objects.all()
    permission_classes = (
        IsAuthenticated,
        HasAnyRole(
            PRP_ROLE_TYPES.cluster_system_admin,
            PRP_ROLE_TYPES.cluster_imo,
            PRP_ROLE_TYPES.ip_authorized_officer,
            PRP_ROLE_TYPES.ip_admin,
            PRP_ROLE_TYPES.ip_editor,
            PRP_ROLE_TYPES.ip_viewer,
        ),
    )
    lookup_url_kwarg = 'reportable_id'

    def patch(self, request, reportable_id, *args, **kwargs):
        pass


class ReportableLocationGoalBaselineInNeedAPIView(ListAPIView, UpdateAPIView):
    """
    Updates Reportable's ReportableLocationGoal instances' baseline and in_need.
    Reserved for IMO only.
    """
    serializer_class = ReportableLocationGoalBaselineInNeedSerializer
    permission_classes = (IsAuthenticated,)
    lookup_url_kwarg = 'reportable_id'

    def check_permissions(self, request):
        super().check_permissions(request)
        reportable_id = self.kwargs.get('reportable_id')

        if not request.user.is_cluster_system_admin and not request.user.prp_roles.filter(
            Q(role=PRP_ROLE_TYPES.cluster_imo),
            Q(cluster__cluster_objectives__reportables=reportable_id) |
            Q(cluster__cluster_objectives__cluster_activities__reportables=reportable_id) |
            Q(cluster__partner_projects__reportables=reportable_id) |
            Q(cluster__cluster_objectives__cluster_activities__partner_activities__reportables=reportable_id) |
            Q(cluster__cluster_objectives__partner_activities__reportables=reportable_id),
        ).exists():
            self.permission_denied(request)

    def get_queryset(self, *args, **kwargs):
        reportable_id = self.kwargs.get('reportable_id', None)

        if reportable_id:
            return ReportableLocationGoal.objects.filter(reportable_id=reportable_id)
        else:
            raise Http404

    def list(self, request, reportable_id, *args, **kwargs):
        queryset = self.get_queryset(reportable_id)
        serializer = self.get_serializer(queryset, many=True)

        return Response(serializer.data)

    def update(self, request, reportable_id, *args, **kwargs):
        instances = ReportableLocationGoal.objects.filter(
            id__in=map(lambda x: x['id'], request.data)
        )
        serializer = self.get_serializer(
            instances,
            data=request.data,
            many=True,
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Update its child indicators for ReportableLocationGoal update
        reportable = Reportable.objects.get(id=self.kwargs.get('reportable_id', None))
        loc_goals_by_loc = {item.location: item for item in instances}

        for child in reportable.children.all():
            for loc_goal in child.reportablelocationgoal_set.all():
                if loc_goal.location in loc_goals_by_loc:
                    loc_goal.baseline = loc_goals_by_loc[loc_goal.location].baseline
                    loc_goal.in_need = loc_goals_by_loc[loc_goal.location].in_need
                    loc_goal.save()

        return Response(serializer.data)


class IndicatorDataAPIView(APIView):
    """
    Accepts an incoming submitted Cluster indicator report and mark it as accepted if satisfied.
    """
    permission_classes = (IsAuthenticated, )

    def check_indicator_report_permission(self, request, obj):
        if not request.user.is_cluster_system_admin and not request.user.prp_roles.filter(
            Q(role__in=(PRP_ROLE_TYPES.cluster_imo, PRP_ROLE_TYPES.cluster_member)),
            Q(cluster__cluster_objectives__reportables__indicator_reports=obj) |
            Q(cluster__cluster_objectives__cluster_activities__reportables__indicator_reports=obj) |
            Q(cluster__partner_projects__reportables__indicator_reports=obj) |
            Q(cluster__cluster_objectives__cluster_activities__partner_activities__reportables__indicator_reports=obj) |
            Q(cluster__cluster_objectives__partner_activities__reportables__indicator_reports=obj)
        ).exists():
            self.permission_denied(request)

    def get_indicator_report(self, id):
        try:
            instance = IndicatorReport.objects.get(id=id)
        except IndicatorReport.DoesNotExist as exp:
            logger.exception({
                "endpoint": "IndicatorDataAPIView",
                "request.data": self.request.data,
                "id": id,
                "exception": exp,
            })
            return None
        else:
            self.check_indicator_report_permission(self.request, instance)
            return instance

    @transaction.atomic
    def post(self, request, ir_id, *args, **kwargs):
        ir = self.get_indicator_report(ir_id)

        if not ir.can_submit:
            raise ValidationError("Please check that data for all locations has been entered.")

        # Check if all indicator data is fulfilled for IR status different then
        # Met or No Progress
        if ir.overall_status not in (
                OVERALL_STATUS.met, OVERALL_STATUS.no_progress):
            for data in ir.indicator_location_data.all():
                for key, vals in data.disaggregation.items():
                    if ir.is_percentage and (vals.get('c', None) in [None, '']):
                        raise ValidationError(
                            "You have not completed all required indicators for this progress report. Unless your "
                            "Output status is Met or has No Progress, all indicator data needs to be completed."
                        )
                    elif ir.is_number and (vals.get('v', None) in [None, '']):
                        raise ValidationError(
                            "You have not completed all required indicators for this progress report. Unless your "
                            "Output status is Met or has No Progress, all indicator data needs to be completed."
                        )

        # Check if indicator was already submitted or SENT BACK
        if ir.submission_date is None or ir.report_status == INDICATOR_REPORT_STATUS.sent_back:
            ir.submission_date = date.today()

            # Throw validation error if Indicator report is being submitted directly without its Progress Report
            if ir.progress_report is not None:
                raise ValidationError(
                    "This indicator report has Progress Report linked. Please submit the progress report for"
                    "this indicator report instead."
                )
            else:
                # cluster IR's go to accepted directly
                ir.report_status = INDICATOR_REPORT_STATUS.accepted
                ir.save()

            # IndicatorLocationData lock marking
            IndicatorLocationData.objects.filter(indicator_report=ir).update(is_locked=True)

            child_irs = ir.children.values_list('id', flat=True)
            IndicatorLocationData.objects.filter(indicator_report__in=child_irs).update(is_locked=True)

            serializer = PDReportContextIndicatorReportSerializer(instance=ir)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            raise ValidationError(
                "Indicator was already submitted. Your IMO will need to send it back for you to edit your submission."
            )

    def patch(self, request, ir_id, *args, **kwargs):
        """
        Sets the overall status and narrative assessment of this indicator report.
        """
        indicator_report = self.get_indicator_report(ir_id)
        if indicator_report:
            serializer = OverallNarrativeSerializer(data=request.data,
                                                    instance=indicator_report)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        raise Http404


class PDLowerLevelOutputStatusAPIView(APIView):
    """
    Store the overall status and narrative assessment of the lower level
    output in a PD progress report. TODO: move to 'unicef' app?
    """
    serializer_class = OverallNarrativeSerializer
    permission_classes = (IsAuthenticated, )

    def check_permissions(self, request):
        super().check_permissions(request)
        pd_progress_report_id = self.kwargs.get('pd_progress_report_id')
        if not request.user.prp_roles.filter(
                role__in=[PRP_ROLE_TYPES.ip_authorized_officer, PRP_ROLE_TYPES.ip_editor],
                workspace__partner_focal_programme_documents__progress_reports__id=pd_progress_report_id
        ).exists():
            self.permission_denied(request)

    def patch(self, request, pd_progress_report_id, llo_id, *args, **kwargs):
        """
        Since LLO's don't store overall status etc. we push that data down
        to the all the indicator reports on that LLO, in the context
        of this progress report.
        """
        pd_progress_report = get_object_or_404(ProgressReport,
                                               id=pd_progress_report_id)
        ir_qset = IndicatorReport.objects.filter(
            progress_report=pd_progress_report).filter(
                reportable__object_id=llo_id
        )
        if ir_qset:
            for indicator_report in ir_qset.all():
                serializer = OverallNarrativeSerializer(
                    data=request.data,
                    instance=indicator_report
                )
                serializer.is_valid(raise_exception=True)
                serializer.save()

            return Response(serializer.data, status=status.HTTP_200_OK)

        raise ValidationError("Reportable doesn't contain indicator.")


class IndicatorReportListAPIView(APIView):
    """
    REST API endpoint to get a list of IndicatorReport objects, including each
    set of disaggregation data per report.

    kwargs:
    - reportable_id: Reportable pk (if given, the API will only return
    IndicatorReport objects tied to this Reportable)

    GET parameter:
    - pks = A comma-separated string for IndicatorReport pks (If this GET
    parameter is given, Reportable pk kwargs will be ignored) - TODO: not
    ideal design, since frontend is sending to this endpoint with irrelevant
    reportable_id many times.
    """
    permission_classes = (
        IsAuthenticated,
        HasAnyRole(
            PRP_ROLE_TYPES.ip_authorized_officer,
            PRP_ROLE_TYPES.ip_admin,
            PRP_ROLE_TYPES.ip_editor,
            PRP_ROLE_TYPES.ip_viewer,
            PRP_ROLE_TYPES.cluster_system_admin,
            PRP_ROLE_TYPES.cluster_imo,
            PRP_ROLE_TYPES.cluster_member,
            PRP_ROLE_TYPES.cluster_coordinator,
            PRP_ROLE_TYPES.cluster_viewer
        )
    )

    def get_queryset(self, *args, **kwargs):
        pks = self.request.query_params.get('pks', None)
        reportable_id = self.kwargs.get('reportable_id', None)

        if not pks and not reportable_id:
            raise Http404

        if pks:
            pk_list = map(lambda item: int(item), filter(
                lambda item: item != '' and item.isdigit(), pks.split(',')))
            indicator_reports = IndicatorReport.objects.filter(id__in=pk_list)
        else:
            reportable = get_object_or_404(Reportable, pk=reportable_id)
            indicator_reports = reportable.indicator_reports.filter(
                report_status__in=[INDICATOR_REPORT_STATUS.submitted, INDICATOR_REPORT_STATUS.accepted]
            ).order_by('-time_period_start')

        if 'limit' in self.request.query_params:
            limit = int(self.request.query_params.get('limit', '2'))
            indicator_reports = indicator_reports[:limit]

        return indicator_reports

    def get(self, request, *args, **kwargs):
        pd_id_for_locations = int(self.request.query_params.get('pd_id_for_locations', '-1'))
        hide_children = int(self.request.query_params.get('hide_children', '-1'))

        indicator_reports = self.get_queryset()
        serializer = IndicatorReportListSerializer(
            indicator_reports,
            many=True,
            context={
                'pd_id_for_locations': pd_id_for_locations,
                'hide_children': hide_children,
            }
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


class IndicatorReportReviewAPIView(APIView):
    """
    Called by IMO to accept or send back a submitted indicator report.

    Only a IMO should be allowed to do this action.
    """
    permission_classes = (IsAuthenticated, )

    def check_indicator_report_permission(self, request, obj):
        if not request.user.is_cluster_system_admin and not request.user.prp_roles.filter(
            Q(role=PRP_ROLE_TYPES.cluster_imo),
            Q(cluster__cluster_objectives__reportables__indicator_reports=obj) |
            Q(cluster__cluster_objectives__cluster_activities__reportables__indicator_reports=obj) |
            Q(cluster__partner_projects__reportables__indicator_reports=obj) |
            Q(cluster__cluster_objectives__cluster_activities__partner_activities__reportables__indicator_reports=obj) |
            Q(cluster__cluster_objectives__partner_activities__reportables__indicator_reports=obj),
        ).exists():
            self.permission_denied(request)

    def get_object(self):
        try:
            instance = IndicatorReport.objects.get(pk=self.kwargs['pk'])
        except IndicatorReport.DoesNotExist as exp:
            logger.exception({
                "endpoint": "IndicatorReportReviewAPIView",
                "request.data": self.request.data,
                "pk": self.kwargs['pk'],
                "exception": exp,
            })
            raise Http404
        else:
            self.check_indicator_report_permission(self.request, instance)
            return instance

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        indicator_report = self.get_object()

        if indicator_report.report_status not in {
            INDICATOR_REPORT_STATUS.submitted,
            INDICATOR_REPORT_STATUS.accepted,
        }:
            raise ValidationError("This report is not in submitted / accepted state.")

        serializer = IndicatorReportReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        indicator_report.report_status = serializer.validated_data['status']
        indicator_report.review_date = datetime.now().date()

        if indicator_report.report_status == INDICATOR_REPORT_STATUS.sent_back:
            indicator_report.sent_back_feedback = serializer.validated_data['comment']

        indicator_report.save()
        serializer = IndicatorReportSimpleSerializer(instance=indicator_report)
        return Response(serializer.data, status=status.HTTP_200_OK)


class IndicatorLocationDataUpdateAPIView(APIView):
    """
    REST API endpoint to update one IndicatorLocationData, including disaggregation data.
    """
    permission_classes = (
        IsAuthenticated,
        HasAnyRole(
            PRP_ROLE_TYPES.ip_authorized_officer,
            PRP_ROLE_TYPES.ip_editor,
            PRP_ROLE_TYPES.cluster_system_admin,
            PRP_ROLE_TYPES.cluster_imo,
            PRP_ROLE_TYPES.cluster_member,
        )
    )

    def get_object(self, request, pk=None):
        return get_object_or_404(IndicatorLocationData, id=pk)

    def put(self, request, *args, **kwargs):
        if 'id' not in request.data:
            raise Http404('id is required in request body')

        indicator_location_data = self.get_object(
            request, pk=request.data['id'])

        if indicator_location_data.is_locked:
            raise ValidationError("This location data is locked to be updated.")

        serializer = IndicatorLocationDataUpdateSerializer(
            instance=indicator_location_data, data=request.data)

        serializer.is_valid(raise_exception=True)
        serializer.save()

        blueprint = indicator_location_data.indicator_report.reportable.blueprint

        if blueprint.unit == IndicatorBlueprint.NUMBER:
            QuantityIndicatorDisaggregator.post_process(indicator_location_data)

        if blueprint.unit == IndicatorBlueprint.PERCENTAGE:
            RatioIndicatorDisaggregator.post_process(indicator_location_data)

        # Re-calculating the child IR's ILD instance if exists
        if indicator_location_data.indicator_report.children.exists():
            try:
                # Grab LLO Reportable's indicator reports from parent-child
                ild = IndicatorLocationData.objects.get(
                    indicator_report=indicator_location_data.indicator_report.children.first(),
                    location=indicator_location_data.location,
                )

                if ild.indicator_report.reportable.blueprint.unit == IndicatorBlueprint.NUMBER:
                    QuantityIndicatorDisaggregator.post_process(ild)

                if ild.indicator_report.reportable.blueprint.unit == IndicatorBlueprint.PERCENTAGE:
                    RatioIndicatorDisaggregator.post_process(ild)

            # If IndicatorLocationData is not marked as dual reporting then skip
            except IndicatorLocationData.DoesNotExist:
                pass

        serializer.data['disaggregation'] = indicator_location_data.disaggregation

        return Response(serializer.data, status=status.HTTP_200_OK)


class ClusterIndicatorAPIView(CreateAPIView, UpdateAPIView):
    """
    Add and Update Indicator on cluster reporting screen.
    """

    serializer_class = ClusterIndicatorSerializer
    permission_classes = (
        IsAuthenticated,
        HasAnyRole(
            PRP_ROLE_TYPES.cluster_system_admin,
            PRP_ROLE_TYPES.cluster_imo,
            PRP_ROLE_TYPES.cluster_member,
        )
    )
    queryset = Reportable.objects.all()

    def get_object(self):
        return get_object_or_404(self.get_queryset(), pk=self.request.data.get("id"))


class IndicatorDataLocationAPIView(ListAPIView):
    """
    REST API endpoint to fill location filter on PD reports screen.
    """

    serializer_class = ShortLocationSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self, *args, **kwargs):
        ir_id = self.kwargs.get('ir_id', None)
        if ir_id:
            ir = get_object_or_404(IndicatorReport, id=ir_id)
            return Location.objects.filter(reportables=ir.reportable_id)
        raise Http404


class ClusterIndicatorSendIMOMessageAPIView(APIView):
    """
    ClusterIndicatorSendIMOMessageAPIView sends
    an message to belonging cluster's IMO
    via e-mail.

    Raises:
        Http404 -- Throws 404 HTTP response

    Returns:
        Response -- DRF Response object
    """

    permission_classes = (
        IsAuthenticated,
        HasAnyRole(
            PRP_ROLE_TYPES.ip_authorized_officer,
            PRP_ROLE_TYPES.ip_editor,
            PRP_ROLE_TYPES.cluster_member,
        ),
    )

    def post(self, request, *args, **kwargs):
        serializer = ClusterIndicatorIMOMessageSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)

        reportable = serializer.validated_data['reportable']
        cluster = serializer.validated_data['cluster']
        imo_users = cluster.imo_users.all()

        imo_frontend_indicators_url = \
            '{}/app/{}/cluster-reporting/plan/{}/response-parameters/clusters/activity/{}/indicators'.format(
                settings.FRONTEND_HOST,
                cluster.response_plan.workspace.workspace_code,
                cluster.response_plan.id,
                reportable.content_object.cluster_activity.id
            )

        try:
            project_name = reportable.content_object.project.title
        except Exception:
            project_name = ''

        context = {
            "indicator_name": reportable.blueprint.title,
            "partner_name": request.user.partner.title,
            "sender_user": request.user,
            "message": serializer.validated_data['message'],
            "target_url": imo_frontend_indicators_url,
            "project_name": project_name,
            "response_plan_name": cluster.response_plan.title,
            "locations": reportable.locations.all(),
        }

        for imo_user in imo_users:
            context["imo_user"] = imo_user
            send_email_from_template(
                'email/notify_imo_on_cluster_indicator_change_request_subject.txt',
                'email/notify_imo_on_cluster_indicator_change_request.html',
                context,
                to_email_list=[imo_user.email, ],
                fail_silently=False,
                reply_to=[request.user.email],
                content_subtype='html',
            )

        return Response('OK', status=status.HTTP_200_OK)


class ReportableReportingFrequencyListAPIView(APIView):
    """
    Called by PO to get a list of unique reporting frequencies given a list of Reportable ids.
    Called from outside of PRP.

    Only a PO (not a partner user) should be allowed to do this action.
    """
    permission_classes = (
        AnyPermission(
            IsUNICEFAPIUser,
            UnicefPartnershipManagerOrRead,
        ),
    )

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = ReportableReportingFrequencyIdSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reportables = Reportable.objects.filter(id__in=serializer.validated_data['reportable_ids'])
        non_custom_freq_reportables = reportables.exclude(frequency=REPORTABLE_FREQUENCY_LEVEL.custom_specific_dates)
        custom_freq_reportables = reportables.filter(frequency=REPORTABLE_FREQUENCY_LEVEL.custom_specific_dates)

        response = list()

        for freq in set(non_custom_freq_reportables.values_list('frequency', flat=True)):
            frequency_data = {'frequency': freq, 'cs_dates': []}
            response.append(frequency_data)

        for freq, cs_dates in custom_freq_reportables.values_list('frequency', 'cs_dates'):
            response.append({'frequency': freq, 'cs_dates': cs_dates})

        return Response(response, status=status.HTTP_200_OK)


class ReportRefreshAPIView(APIView):

    permission_classes = (
        AnyPermission(
            IsPartnerAuthorizedOfficerForCurrentWorkspace,
            IsPartnerEditorForCurrentWorkspace),
    )

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        """
        Removes all IndicatorReport instances for given ProgressReport, including underlying IndicatorLocationData instances
        """
        serializer = ReportRefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if serializer.validated_data['report_type'] == 'PR':
            report = get_object_or_404(ProgressReport, id=serializer.validated_data['report_id'])
        else:
            report = get_object_or_404(IndicatorReport, id=serializer.validated_data['report_id'])

            if report.progress_report:
                raise ValidationError("This indicator report is linked to a progress report. Use the progress report ID instead.")

        return Response({"response": "OK"}, status=status.HTTP_200_OK)
