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
    IsAuthenticated,
    IsPartnerEditorOrPartnerAuthorizedOfficer,
    IsIMO,
)
from core.paginations import SmallPagination
from core.models import Location
from core.common import (
    PROGRESS_REPORT_STATUS,
    INDICATOR_REPORT_STATUS,
    REPORTABLE_LLO_CONTENT_OBJECT,
    REPORTABLE_CO_CONTENT_OBJECT,
    REPORTABLE_CA_CONTENT_OBJECT,
    REPORTABLE_PP_CONTENT_OBJECT,
    REPORTABLE_PA_CONTENT_OBJECT,
    OVERALL_STATUS,
)
from core.serializers import ShortLocationSerializer
from unicef.serializers import ProgressReportSerializer, ProgressReportUpdateSerializer
from unicef.models import ProgressReport
from utils.emails import send_email_from_template

from .disaggregators import (
    QuantityIndicatorDisaggregator,
    RatioIndicatorDisaggregator,
)
from .serializers import (
    IndicatorListSerializer,
    IndicatorReportListSerializer,
    PDReportContextIndicatorReportSerializer,
    IndicatorLLoutputsSerializer,
    IndicatorLocationDataUpdateSerializer,
    OverallNarrativeSerializer,
    ClusterIndicatorSerializer,
    DisaggregationListSerializer,
    IndicatorReportReviewSerializer,
    IndicatorReportSimpleSerializer,
    ReportableLocationGoalBaselineInNeedSerializer,
    ClusterIndicatorIMOMessageSerializer,
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

        pks = pd.reportable_queryset.values_list(
            'indicator_reports__pk', flat=True)
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


class PDReportsDetailAPIView(RetrieveAPIView):

    serializer_class = PDReportContextIndicatorReportSerializer
    permission_classes = (IsAuthenticated, )

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
    permission_classes = (IsAuthenticated, )
    lookup_url_kwarg = 'reportable_id'

    def patch(self, request, reportable_id, *args, **kwargs):
        pass


class ReportableLocationGoalBaselineInNeedAPIView(ListAPIView, UpdateAPIView):
    """
    Updates Reportable's ReportableLocationGoal instances' baseline and in_need.
    Reserved for IMO only.
    """
    serializer_class = ReportableLocationGoalBaselineInNeedSerializer
    permission_classes = (IsAuthenticated, )
    lookup_url_kwarg = 'reportable_id'

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

        return Response(serializer.data)


class IndicatorDataAPIView(APIView):
    """
    Takes an indicator report id to do various operations.
    TODO: check on the GET data being sent / used in the frontend and other
    HTTP operations being opened here.
    """
    permission_classes = (IsAuthenticated, )

    def get_queryset(self, id):
        queryset = Reportable.objects.filter(
            indicator_reports__id=id,
            lower_level_outputs__isnull=False
        )
        reportable_id = self.request.query_params.get('reportable_id', None)
        if reportable_id:
            queryset = queryset.filter(id=reportable_id)

        location = self.request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(
                indicator_reports__indicator_location_data__location=location)

        incomplete = self.request.query_params.get('incomplete', None)
        if incomplete == "1":
            queryset = queryset.exclude(
                indicator_reports__progress_report__status=PROGRESS_REPORT_STATUS.submitted
            )
        return queryset

    def get_indicator_report(self, id):
        try:
            return IndicatorReport.objects.get(id=id)
        except IndicatorReport.DoesNotExist as exp:
            logger.exception({
                "endpoint": "IndicatorDataAPIView",
                "request.data": self.request.data,
                "id": id,
                "exception": exp,
            })
            return None

    def get_narrative_object(self, id):
        ir = self.get_indicator_report(id)
        return ir and ir.progress_report

    def get(self, request, ir_id, *args, **kwargs):
        narrative = self.get_narrative_object(ir_id)
        response = ProgressReportSerializer(narrative).data
        queryset = self.get_queryset(ir_id)
        serializer = IndicatorLLoutputsSerializer(queryset, many=True)

        response['outputs'] = serializer.data

        return Response(
            response,
            status=status.HTTP_200_OK
        )

    def put(self, request, ir_id, *args, **kwargs):
        """TODO: check usage of this"""
        if 'progress_report' not in request.data:
            raise ValidationError("No progress_report found in PUT request data.")

        pr = get_object_or_404(ProgressReport, pk=request.data['progress_report'].get('id'))
        progress_report = ProgressReportUpdateSerializer(
            instance=pr,
            data=request.data['progress_report']
        )

        if progress_report.is_valid():
            progress_report.save()

        return Response(dict(progress_report=progress_report.data),
                        status=status.HTTP_200_OK)

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

            # set status on progress report
            if ir.progress_report is not None:
                ir.report_status = INDICATOR_REPORT_STATUS.submitted
                ir.save()
                ir.progress_report.status = PROGRESS_REPORT_STATUS.submitted
                ir.progress_report.save()
            else:
                # cluster IR's go to accepted directly
                ir.report_status = INDICATOR_REPORT_STATUS.accepted
                ir.save()

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
    permission_classes = (
        IsAuthenticated,
        IsPartnerEditorOrPartnerAuthorizedOfficer,
    )

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
            indicator_reports = reportable.indicator_reports.all().order_by('-time_period_start')

        if 'limit' in self.request.query_params:
            limit = int(self.request.query_params.get('limit', '2'))
            indicator_reports = indicator_reports[:limit]

        return indicator_reports

    def get(self, request, *args, **kwargs):
        indicator_reports = self.get_queryset()
        serializer = IndicatorReportListSerializer(indicator_reports, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class IndicatorReportReviewAPIView(APIView):
    """
    Called by IMO to accept or send back a submitted indicator report.

    Only a IMO should be allowed to do this action.
    """
    permission_classes = (IsIMO,)

    def get_object(self):
        try:
            return IndicatorReport.objects.get(pk=self.kwargs['pk'])
        except IndicatorReport.DoesNotExist as exp:
            logger.exception({
                "endpoint": "IndicatorReportReviewAPIView",
                "request.data": self.request.data,
                "pk": self.kwargs['pk'],
                "exception": exp,
            })
            raise Http404

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

    def get_object(self, request, pk=None):
        return get_object_or_404(IndicatorLocationData, id=pk)

    def put(self, request, *args, **kwargs):
        if 'id' not in request.data:
            raise Http404('id is required in request body')

        indicator_location_data = self.get_object(
            request, pk=request.data['id'])

        serializer = IndicatorLocationDataUpdateSerializer(
            instance=indicator_location_data, data=request.data)

        serializer.is_valid(raise_exception=True)
        serializer.save()

        blueprint = indicator_location_data.indicator_report.reportable.blueprint

        if blueprint.unit == IndicatorBlueprint.NUMBER:
            QuantityIndicatorDisaggregator.post_process(indicator_location_data)

        if blueprint.unit == IndicatorBlueprint.PERCENTAGE:
            RatioIndicatorDisaggregator.post_process(indicator_location_data)

        serializer.data['disaggregation'] = indicator_location_data.disaggregation

        return Response(serializer.data, status=status.HTTP_200_OK)


class ClusterIndicatorAPIView(CreateAPIView, UpdateAPIView):
    """
    Add and Update Indicator on cluster reporting screen.
    """

    serializer_class = ClusterIndicatorSerializer
    permission_classes = (IsAuthenticated, )
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
        IsPartnerEditorOrPartnerAuthorizedOfficer,
    )

    def post(self, request, *args, **kwargs):
        serializer = ClusterIndicatorIMOMessageSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)

        reportable = serializer.validated_data['reportable']
        imo_user = serializer.validated_data['cluster'].imo_users.first()

        template_data = {
            "indicator_name": reportable.blueprint.title,
            "partner_name": request.user.partner.title,
            "partner_email": request.user.email,
            "imo_user": imo_user,
            "message": serializer.validated_data['message'],
        }

        send_email_from_template(
            'email/notify_imo_on_cluster_indicator_change_request_subject.txt',
            'email/notify_imo_on_cluster_indicator_change_request.txt',
            template_data,
            settings.DEFAULT_FROM_EMAIL,
            [imo_user.email, ],
            fail_silently=False
        )

        return Response(serializer.data, status=status.HTTP_200_OK)
