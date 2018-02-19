import logging
from datetime import datetime

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.http import HttpResponse, Http404, HttpResponseRedirect, HttpResponseNotFound
from django.shortcuts import get_object_or_404

from rest_framework import status as statuses
from rest_framework import mixins, viewsets
from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.parsers import FileUploadParser, FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

import django_filters.rest_framework
from easy_pdf.rendering import render_to_pdf

from core.api_error_codes import APIErrorCode
from core.common import (
    PROGRESS_REPORT_STATUS,
    INDICATOR_REPORT_STATUS,
    OVERALL_STATUS,
    PD_STATUS
)
from core.paginations import SmallPagination
from core.permissions import (
    IsAuthenticated,
    IsPartnerAuthorizedOfficer,
    IsPartnerEditorOrPartnerAuthorizedOfficer
)
from core.models import Location
from core.serializers import ShortLocationSerializer

from indicator.models import Reportable, IndicatorReport, IndicatorBlueprint
from indicator.serializers import (
    IndicatorListSerializer,
    PDReportContextIndicatorReportSerializer
)
from indicator.filters import PDReportsFilter
from indicator.serializers import IndicatorBlueprintSimpleSerializer
from partner.models import Partner
from unicef.tasks import create_user_for_person

from unicef.exports.annex_c_excel import AnnexCXLSXExporter, SingleProgressReportsXLSXExporter
from unicef.exports.programme_documents import ProgrammeDocumentsXLSXExporter, ProgrammeDocumentsPDFExporter
from unicef.exports.progress_reports import ProgressReportDetailPDFExporter, ProgressReportListPDFExporter
from unicef.exports.utilities import group_indicator_reports_by_lower_level_output
from utils.mixins import ListExportMixin, ObjectExportMixin


from .serializers import (
    ProgrammeDocumentSerializer,
    ProgrammeDocumentDetailSerializer,
    ProgressReportSimpleSerializer,
    ProgressReportSerializer,
    ProgressReportReviewSerializer,
    LLOutputSerializer,
    ProgrammeDocumentCalculationMethodsSerializer,
    ProgrammeDocumentProgressSerializer,
    ProgressReportUpdateSerializer,
    ProgressReportAttachmentSerializer
)
from .models import ProgrammeDocument, ProgressReport
from .permissions import (
    CanChangePDCalculationMethod,
    UnicefPartnershipManagerOrRead
)
from .filters import (
    ProgrammeDocumentFilter, ProgressReportFilter,
    ProgrammeDocumentIndicatorFilter
)

logger = logging.getLogger(__name__)


class ProgrammeDocumentAPIView(ListExportMixin, ListAPIView):
    """
    Endpoint for getting a list of Programme Documents and being able to
    filter by them.
    """
    serializer_class = ProgrammeDocumentSerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = ProgrammeDocumentFilter
    exporters = {
        'xlsx': ProgrammeDocumentsXLSXExporter,
        'pdf': ProgrammeDocumentsPDFExporter,
    }

    def get_queryset(self):
        return ProgrammeDocument.objects.filter(
            partner=self.request.user.partner, workspace=self.kwargs['workspace_id']
        )


class ProgrammeDocumentDetailsAPIView(RetrieveAPIView):

    serializer_class = ProgrammeDocumentDetailSerializer
    permission_classes = (IsAuthenticated, )
    lookup_url_kwarg = 'pd_id'

    def get(self, request, workspace_id, pd_id, *args, **kwargs):
        """
        Get Programme Document Details by given pk.
        """
        self.workspace_id = workspace_id
        serializer = self.get_serializer(
            self.get_object(pd_id)
        )
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def get_object(self, pd_id):
        try:
            return ProgrammeDocument.objects.get(
                partner=self.request.user.partner,
                workspace=self.workspace_id,
                pk=pd_id)
        except ProgrammeDocument.DoesNotExist as exp:
            logger.exception({
                "endpoint": "ProgrammeDocumentDetailsAPIView",
                "request.data": self.request.data,
                "pk": pd_id,
                "exception": exp,
            })
            raise Http404


class ProgrammeDocumentProgressAPIView(RetrieveAPIView):

    serializer_class = ProgrammeDocumentProgressSerializer
    permission_classes = (IsAuthenticated, )
    lookup_url_kwarg = 'pd_id'

    def get(self, request, workspace_id, pd_id, *args, **kwargs):
        """
        Get Programme Document Details by given pk.
        """
        self.workspace_id = workspace_id
        serializer = self.get_serializer(
            self.get_object(pd_id)
        )
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def get_object(self, pd_id):
        user_has_global_view = self.request.user.is_unicef
        external_request = self.request.query_params.get('external', False)
        search_by = 'external_id' if external_request else 'pk'
        query_params = {}
        if not user_has_global_view:
            query_params['partner'] = self.request.user.partner
        query_params['workspace'] = self.workspace_id,
        query_params[search_by] = pd_id
        try:
            return ProgrammeDocument.objects.get(**query_params)
        except ProgrammeDocument.DoesNotExist as exp:
            logger.exception({
                "endpoint": "ProgrammeDocumentProgressAPIView",
                "request.data": self.request.data,
                search_by: pd_id,
                "exception": exp,
            })
            raise Http404


class ProgrammeDocumentLocationsAPIView(ListAPIView):

    queryset = Location.objects.all()
    serializer_class = ShortLocationSerializer
    permission_classes = (IsAuthenticated,)

    def list(self, request, workspace_id, *args, **kwargs):
        pd = ProgrammeDocument.objects.filter(
            partner=self.request.user.partner,
            workspace=workspace_id)
        queryset = self.get_queryset().filter(
            indicator_location_data__indicator_report__progress_report__programme_document__in=pd).distinct()
        filtered = ProgressReportFilter(request.GET, queryset=queryset)

        page = self.paginate_queryset(filtered.qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(filtered.qs, many=True)
        return Response(
            serializer.data,
            status=statuses.HTTP_200_OK
        )


class ProgrammeDocumentIndicatorsAPIView(ListAPIView):

    queryset = Reportable.objects.filter(lower_level_outputs__isnull=False)
    serializer_class = IndicatorListSerializer
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)

    def list(self, request, workspace_id, *args, **kwargs):
        """
        Return list of Reportable objects that are associated with LLO's
        of the PD's that this users partner belongs to.
        """
        pds = ProgrammeDocument.objects.filter(
            partner=self.request.user.partner, workspace=workspace_id)
        queryset = self.get_queryset().filter(
            indicator_reports__progress_report__programme_document__in=pds).distinct()

        # filter for checkbox
        active_pds_only = self.request.query_params.get(
            'activepdsonly', None)
        if active_pds_only is not None and active_pds_only == '1':
            queryset = queryset.filter(
                lower_level_outputs__cp_output__programme_document__status=PD_STATUS.active)

        filtered = ProgrammeDocumentIndicatorFilter(request.GET,
                                                    queryset=queryset)
        page = self.paginate_queryset(filtered.qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(filtered.qs, many=True)
        return Response(
            serializer.data,
            status=statuses.HTTP_200_OK
        )


class ProgressReportAPIView(ListExportMixin, ListAPIView):
    """
    Endpoint for getting list of all Progress Reports. Supports filtering
    as per ProgressReportFilter by status, pd_ref_title, programme_document
    (id) etc.

    Supports additional GET param to filter by external_partner_id
    """
    serializer_class = ProgressReportSimpleSerializer
    pagination_class = SmallPagination
    permission_classes = (IsAuthenticated, )
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = ProgressReportFilter
    exporters = {
        'xlsx': AnnexCXLSXExporter,
        'pdf': ProgressReportListPDFExporter,
    }

    def get_queryset(self):
        user_has_global_view = self.request.user.is_unicef

        external_partner_id = self.request.GET.get('external_partner_id')
        if external_partner_id is not None:
            partners = Partner.objects.filter(external_id=external_partner_id)
            queryset = ProgressReport.objects.filter(programme_document__partner__in=partners)
        else:
            # TODO: In case of UNICEF user.. allow for all (maybe create a special group for the unicef api user?)
            # Limit reports to this user's partner only
            if user_has_global_view:
                queryset = ProgressReport.objects.all()
            else:
                queryset = ProgressReport.objects.filter(programme_document__partner=self.request.user.partner)
        return queryset.filter(programme_document__workspace=self.kwargs['workspace_id']).distinct()

    def list(self, request, *args, **kwargs):
        filtered = ProgressReportFilter(request.GET, queryset=self.get_queryset())

        qs = filtered.qs
        order = request.query_params.get('sort', None)
        if order:
            order_field = order.split('.')[0]
            if order_field in ('due_date', 'status', 'programme_document__reference_number', 'submission_date', 'start_date'):
                qs = qs.order_by(order_field)
                if len(order.split('.')) > 1 and order.split('.')[1] == 'desc':
                    qs = qs.order_by('-%s' % order_field)

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(
            serializer.data,
            status=statuses.HTTP_200_OK
        )


class ProgressReportPDFView(RetrieveAPIView):
    """
        Endpoint for getting PDF of Progress Report Annex C.
    """
    queryset = ProgressReport.objects.all()

    def get(self, request, *args, **kwargs):
        report = self.get_object()

        data = {
            'report': report,
            'pd': report.programme_document,
            'challenges_in_the_reporting_period': report.challenges_in_the_reporting_period,
            'proposed_way_forward': report.proposed_way_forward,
            'partner_contribution_to_date': report.partner_contribution_to_date,
            'submission_date': report.get_submission_date(),
            'authorized_officer': report.programme_document.unicef_officers.first(),
            'focal_point': report.programme_document.unicef_focal_point.first(),
            'outputs': group_indicator_reports_by_lower_level_output(report.indicator_reports.all())
        }

        pdf = render_to_pdf("report_annex_c_pdf.html", data)
        return HttpResponse(pdf, content_type='application/pdf')


class ProgressReportDetailsUpdateAPIView(APIView):
    """
        Endpoint for updating Progress Report narrative fields
    """
    permission_classes = (IsAuthenticated,
                          IsPartnerEditorOrPartnerAuthorizedOfficer)

    def get_object(self, pk):
        try:
            return ProgressReport.objects.get(
                programme_document__partner=self.request.user.partner,  # TODO: check if needed?
                programme_document__workspace=self.workspace_id,
                pk=pk)
        except ProgressReport.DoesNotExist as exp:
            logger.exception({
                "endpoint": "ProgressReportDetailsUpdateAPIView",
                "request.data": self.request.data,
                "pk": pk,
                "exception": exp,
            })
            raise Http404

    def put(self, request, workspace_id, pk, *args, **kwargs):
        self.workspace_id = workspace_id
        pr = self.get_object(pk)
        serializer = ProgressReportUpdateSerializer(
            instance=pr, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=statuses.HTTP_200_OK)

        else:
            return Response(serializer.errors,
                            status=statuses.HTTP_400_BAD_REQUEST)


class ProgressReportDetailsAPIView(ObjectExportMixin, RetrieveAPIView):
    """
    Endpoint for getting a single Progress Report
    """
    serializer_class = ProgressReportSerializer
    permission_classes = (IsAuthenticated, )
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    exporters = {
        'pdf': ProgressReportDetailPDFExporter,
        'xlsx': SingleProgressReportsXLSXExporter,
    }

    def get_object(self):
        pk = self.kwargs['pk']
        user_has_global_view = self.request.user.is_unicef
        query_params = {}
        if not user_has_global_view:
            query_params["programme_document__partner"] = self.request.user.partner
        query_params['programme_document__workspace'] = self.kwargs['workspace_id']
        query_params['pk'] = pk
        try:
            return ProgressReport.objects.get(**query_params)
        except ProgressReport.DoesNotExist as exp:
            logger.exception({
                "endpoint": "ProgressReportDetailsAPIView",
                "request.data": self.request.data,
                "pk": pk,
                "exception": exp,
            })
            raise Http404


class ProgressReportIndicatorsAPIView(ListAPIView):
    serializer_class = PDReportContextIndicatorReportSerializer
    pagination_class = SmallPagination
    permission_classes = (IsAuthenticated,)
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = PDReportsFilter

    def get_queryset(self):
        # Limit reports to partner only
        return IndicatorReport.objects.filter(
            progress_report__programme_document__partner=self.request.user.partner)

    def list(self, request, workspace_id, progress_report_id, *args, **kwargs):
        """
        Get Programme Document Details by given pk.
        """
        queryset = self.get_queryset().filter(
            progress_report__id=progress_report_id,
            progress_report__programme_document__workspace=workspace_id)
        filtered = PDReportsFilter(request.GET, queryset=queryset)

        page = self.paginate_queryset(filtered.qs)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(filtered.qs, many=True)
        return Response(serializer.data, status=statuses.HTTP_200_OK)


class ProgressReportLocationsAPIView(ListAPIView):
    queryset = Location.objects.all()
    serializer_class = ShortLocationSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self, pk):
        try:
            return ProgressReport.objects.get(
                programme_document__partner=self.request.user.partner, programme_document__workspace=self.workspace_id, pk=pk)
        except ProgressReport.DoesNotExist as exp:
            logger.exception({
                "endpoint": "ProgressReportLocationsAPIView",
                "request.data": self.request.data,
                "pk": pk,
                "exception": exp,
            })
            raise Http404

    def list(self, request, workspace_id, progress_report_id, *args, **kwargs):
        self.workspace_id = workspace_id
        pr = self.get_object(progress_report_id)
        queryset = self.get_queryset().filter(
            indicator_location_data__indicator_report__progress_report=pr).distinct()
        filtered = ProgressReportFilter(request.GET, queryset=queryset)

        page = self.paginate_queryset(filtered.qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(filtered.qs, many=True)
        return Response(
            serializer.data,
            status=statuses.HTTP_200_OK
        )


class ProgressReportSubmitAPIView(APIView):
    """
    Only a partner authorized officer can submit a progress report.
    """
    permission_classes = (IsAuthenticated, IsPartnerAuthorizedOfficer)

    def get_object(self):
        try:
            return ProgressReport.objects.get(
                programme_document__partner=self.request.user.partner,
                programme_document__workspace=self.kwargs['workspace_id'],
                pk=self.kwargs['pk'])
        except ProgressReport.DoesNotExist as exp:
            logger.exception({
                "endpoint": "ProgressReportSubmitAPIView",
                "request.data": self.request.data,
                "pk": self.kwargs['pk'],
                "exception": exp,
            })
            raise Http404

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        progress_report = self.get_object()
        if not progress_report.programme_document.status == PD_STATUS.active:
            _errors = [{
                "message": "Updating Progress Report for a {} Programme Document is not allowed. Only Active "
                           "PDs can be reported on.".format(progress_report.programme_document.get_status_display())
            }]
            return Response({"errors": _errors}, status=statuses.HTTP_400_BAD_REQUEST)

        for ir in progress_report.indicator_reports.all():
            # Check if all indicator data is fulfilled for IR status different
            # then Met or No Progress
            if ir.overall_status not in {OVERALL_STATUS.met, OVERALL_STATUS.no_progress}:
                for data in ir.indicator_location_data.all():
                    for key, vals in data.disaggregation.items():
                        if ir.is_percentage and (vals.get('c', None) in [None, '']):
                            _errors = [{
                                "message": "You have not completed all required indicators for this progress report. "
                                           "Unless your Output status is Met or has No Progress, all indicator data "
                                           "needs to be completed."
                            }]
                            return Response({"errors": _errors}, status=statuses.HTTP_400_BAD_REQUEST)

                        elif ir.is_number and (vals.get('v', None) in [None, '']):
                            _errors = [{
                                "message": "You have not completed all required indicators for this progress report. "
                                           "Unless your Output status is Met or has No Progress, all indicator data "
                                           "needs to be completed."
                            }]
                            return Response({"errors": _errors}, status=statuses.HTTP_400_BAD_REQUEST)
                if not ir.narrative_assessment:
                    _errors = [{
                        "message": "You have not completed narrative assessment for one of Outputs (%s). Unless your "
                                   "Output status is Met or has No Progress, all indicator data needs to "
                                   "be completed." % ir.reportable.content_object
                    }]
                    return Response({"errors": _errors}, status=statuses.HTTP_400_BAD_REQUEST)

            # Check if indicator was already submitted or SENT BACK
            if ir.submission_date is None or ir.report_status == INDICATOR_REPORT_STATUS.sent_back:
                ir.submission_date = datetime.now().date()
                ir.report_status = INDICATOR_REPORT_STATUS.submitted
                ir.save()

        # Check if PR other tab is fulfilled
        if not progress_report.partner_contribution_to_date:
            _errors = [{
                "message": "You have not completed Partner Contribution To Date field on Other Info tab."
            }]
            return Response({"errors": _errors}, status=statuses.HTTP_400_BAD_REQUEST)
        if not progress_report.challenges_in_the_reporting_period:
            _errors = [{
                "message": "You have not completed Challenges / bottlenecks in the reporting period field on "
                           "Other Info tab."
            }]
            return Response({"errors": _errors}, status=statuses.HTTP_400_BAD_REQUEST)
        if not progress_report.proposed_way_forward:
            _errors = [{
                "message": "You have not completed Proposed way forward field on Other Info tab."
            }]
            return Response({"errors": _errors}, status=statuses.HTTP_400_BAD_REQUEST)

        if progress_report.submission_date is None or progress_report.status == PROGRESS_REPORT_STATUS.sent_back:
            provided_email = request.data.get('submitted_by_email')

            authorized_officer_person = progress_report.programme_document.partner_focal_point.filter(
                    email=provided_email or self.request.user.email
            ).first()
            if not authorized_officer_person:
                if provided_email:
                    _error_message = 'Report could not be submitted, because {} is not the authorized ' \
                                     'officer assigned to the PCA that is connected to that PD.'.format(provided_email)
                else:
                    _error_message = 'Your report could not be submitted, because you are not the authorized ' \
                                     'officer assigned to the PCA that is connected to that PD.'

                _errors = [{
                    "message": _error_message,
                    "code": APIErrorCode.PR_SUBMISSION_FAILED_USER_NOT_AUTHORIZED_OFFICER,
                }]
                return Response({"errors": _errors}, status=statuses.HTTP_400_BAD_REQUEST)

            if provided_email:
                authorized_officer_user = get_user_model().objects.filter(email=provided_email).first()
                if not authorized_officer_user:
                    authorized_officer_user = create_user_for_person(authorized_officer_person)
            else:
                authorized_officer_user = self.request.user

            progress_report.status = PROGRESS_REPORT_STATUS.submitted
            progress_report.submission_date = datetime.now().date()
            progress_report.submitted_by = authorized_officer_user
            progress_report.submitting_user = self.request.user
            progress_report.save()

            serializer = ProgressReportSerializer(instance=progress_report)
            return Response(serializer.data, status=statuses.HTTP_200_OK)
        else:
            _errors = [{
                "message": "Progress report was already submitted. Your IMO will need to send it "
                           "back for you to edit your submission."
            }]
            return Response({"errors": _errors}, status=statuses.HTTP_400_BAD_REQUEST)


class ProgressReportReviewAPIView(APIView):
    """
    Called by PO to accept or send back a submitted progress report. Called
    from outside of PRP.

    Only a PO (not a partner user) should be allowed to do this action.
    """
    permission_classes = (UnicefPartnershipManagerOrRead,)

    def get_object(self, pk):
        try:
            return ProgressReport.objects.get(
                programme_document__workspace=self.workspace_id,
                pk=pk)
        except ProgressReport.DoesNotExist as exp:
            logger.exception({
                "endpoint": "ProgressReportReviewAPIView",
                "request.data": self.request.data,
                "pk": pk,
                "exception": exp,
            })
            raise Http404

    @transaction.atomic
    def post(self, request, workspace_id, pk, *args, **kwargs):
        """
        Only if the progress report is in submitted state that this POST
        request will be successful.
        """
        self.workspace_id = workspace_id
        progress_report = self.get_object(pk)

        if progress_report.status != PROGRESS_REPORT_STATUS.submitted:
            _errors = [{"message": "This report is not in submitted state."}]
            return Response({"errors": _errors},
                            status=statuses.HTTP_400_BAD_REQUEST)

        serializer = ProgressReportReviewSerializer(data=request.data)
        if serializer.is_valid():
            progress_report.status = serializer.validated_data['status']
            progress_report.review_date = datetime.now().date()
            if progress_report.status == PROGRESS_REPORT_STATUS.sent_back:
                progress_report.sent_back_feedback = serializer.validated_data[
                    'comment']
            elif progress_report.status == PROGRESS_REPORT_STATUS.accepted:
                progress_report.review_overall_status = serializer.validated_data[
                    'overall_status']

            progress_report.save()
            serializer = ProgressReportSerializer(instance=progress_report)
            return Response(serializer.data, status=statuses.HTTP_200_OK)

        return Response({"errors": serializer.errors},
                        status=statuses.HTTP_400_BAD_REQUEST)


class ProgrammeDocumentCalculationMethodsAPIView(APIView):
    """
    Supports GET request to get the unit and calculation for each indicator
    grouped by LLO for a particular PD.

    POST request takes same format data to update the calculation methods then.
    Only partner authorized officer and partner editor can change the
    calculation methods.
    """
    permission_classes = (IsAuthenticated, CanChangePDCalculationMethod)
    serializer_class = ProgrammeDocumentCalculationMethodsSerializer

    def get(self, request, workspace_id, pd_id):
        """
        Construct the input data to the serializer for the LLO and its
        associated indicators.
        """
        pd = get_object_or_404(ProgrammeDocument,
                               id=pd_id,
                               workspace__id=workspace_id)

        data = {'ll_outputs_and_indicators': []}
        for llo in pd.lower_level_outputs:
            indicator_blueprints = []
            for reportable in llo.reportables.all():
                indicator_blueprints.append(reportable.blueprint)

            inner_data = {}
            inner_data['ll_output'] = LLOutputSerializer(instance=llo).data
            inner_data['indicators'] = IndicatorBlueprintSimpleSerializer(
                indicator_blueprints, many=True).data

            data['ll_outputs_and_indicators'].append(inner_data)

        return Response(ProgrammeDocumentCalculationMethodsSerializer(
            data).data)

    @transaction.atomic
    def post(self, request, workspace_id, pd_id, *args, **kwargs):
        """
        The goal of this is to set the calculation methods for the indicators
        associated with lower level outputs of this PD.
        """
        serializer = ProgrammeDocumentCalculationMethodsSerializer(
            data=request.data)
        if serializer.is_valid():
            for llo_and_indicators in serializer.validated_data[
                    'll_outputs_and_indicators']:
                for indicator_blueprint in llo_and_indicators['indicators']:
                    instance = get_object_or_404(IndicatorBlueprint,
                                                 id=indicator_blueprint['id'])
                    instance.calculation_formula_across_periods = \
                        indicator_blueprint[
                            'calculation_formula_across_periods']
                    instance.calculation_formula_across_locations = \
                        indicator_blueprint[
                            'calculation_formula_across_locations']
                    instance.clean()
                    instance.save()
            return Response(serializer.data, status=statuses.HTTP_200_OK)

        return Response({"errors": serializer.errors},
                        status=statuses.HTTP_400_BAD_REQUEST)


class ProgressReportAttachmentAPIView(APIView):
    permission_classes = (IsAuthenticated,)
    parser_classes = (FormParser, MultiPartParser, FileUploadParser)

    def get(self, request, workspace_id, progress_report_id):
        pr = get_object_or_404(
            ProgressReport,
            id=progress_report_id,
            programme_document__workspace_id=workspace_id)

        if pr.attachment:
            serializer = ProgressReportAttachmentSerializer(
                ProgressReport.objects.filter(
                    id=progress_report_id,
                    programme_document__workspace_id=workspace_id),
                many=True)
            return Response(serializer.data, status=statuses.HTTP_200_OK)
        else:
            return Response({"message": "Attachment does not exist."}, status=statuses.HTTP_404_NOT_FOUND)

    @transaction.atomic
    def delete(self, request, workspace_id, progress_report_id):
        pr = get_object_or_404(
            ProgressReport,
            id=progress_report_id,
            programme_document__workspace_id=workspace_id)

        if pr.attachment:
            try:
                pr.attachment.delete()
                return Response({}, status=statuses.HTTP_204_NO_CONTENT)
            except ValueError:
                pass
        else:
            return Response({"message": "Attachment does not exist."}, status=statuses.HTTP_404_NOT_FOUND)

    @transaction.atomic
    def put(self, request, workspace_id, progress_report_id):
        pr = get_object_or_404(
            ProgressReport,
            id=progress_report_id,
            programme_document__workspace_id=workspace_id)

        serializer = ProgressReportAttachmentSerializer(
            instance=pr,
            data=request.data
        )

        if serializer.is_valid():
            if pr.attachment:
                try:
                    pr.attachment.delete()
                except ValueError:
                    pass

            serializer.save()
            return Response(ProgressReportAttachmentSerializer(
                ProgressReport.objects.filter(id=progress_report_id,
                programme_document__workspace_id=workspace_id),
                many=True).data, status=statuses.HTTP_200_OK)

        else:
            return Response({"errors": serializer.errors},
                            status=statuses.HTTP_400_BAD_REQUEST)
