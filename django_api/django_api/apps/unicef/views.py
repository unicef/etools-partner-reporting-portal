import logging

from datetime import datetime

from django.http import Http404
from django.db.models import Q
from django.http import HttpResponse
from django.conf import settings
from django.db import transaction

from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as statuses

import django_filters.rest_framework
from easy_pdf.rendering import render_to_pdf

from core.common import (
    PROGRESS_REPORT_STATUS,
    INDICATOR_REPORT_STATUS,
    OVERALL_STATUS,
)

from core.paginations import SmallPagination
from core.permissions import IsAuthenticated
from core.models import Location
from core.serializers import ShortLocationSerializer

from indicator.models import Reportable, IndicatorReport
from indicator.serializers import IndicatorListSerializer, PDReportsSerializer
from indicator.filters import PDReportsFilter



from .serializers import (
    ProgrammeDocumentSerializer,
    ProgrammeDocumentDetailSerializer,
    ProgressReportSerializer
)

from .models import ProgrammeDocument, ProgressReport
from .filters import ProgrammeDocumentFilter, ProgressReportFilter, ProgrammeDocumentIndicatorFilter

logger = logging.getLogger(__name__)



class ProgrammeDocumentAPIView(ListAPIView):
    """
    Endpoint for getting Programme Document.
    """
    serializer_class = ProgrammeDocumentSerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = ProgrammeDocumentFilter

    def get_queryset(self):
        return ProgrammeDocument.objects.filter(partner=self.request.user.partner)

    def list(self, request, workspace_id, *args, **kwargs):
        queryset = self.get_queryset().filter(workspace=workspace_id)
        filtered = ProgrammeDocumentFilter(request.GET, queryset=queryset)

        page = self.paginate_queryset(filtered.qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(filtered.qs, many=True)
        return Response(
            serializer.data,
            status=statuses.HTTP_200_OK
        )


class ProgrammeDocumentDetailsAPIView(RetrieveAPIView):

    serializer_class = ProgrammeDocumentDetailSerializer
    permission_classes = (IsAuthenticated, )

    def get(self, request, workspace_id, pk, *args, **kwargs):
        """
        Get Programme Document Details by given pk.
        """
        self.workspace_id = workspace_id
        serializer = self.get_serializer(
            self.get_object(pk)
        )
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def get_object(self, pk):
        try:
            return ProgrammeDocument.objects.get(partner=self.request.user.partner, workspace=self.workspace_id, pk=pk)
        except ProgrammeDocument.DoesNotExist as exp:
            logger.exception({
                "endpoint": "ProgrammeDocumentDetailsAPIView",
                "request.data": self.request.data,
                "pk": pk,
                "exception": exp,
            })
            raise Http404

class ProgrammeDocumentLocationsAPIView(ListAPIView):

    queryset = Location.objects.all()
    serializer_class = ShortLocationSerializer
    permission_classes = (IsAuthenticated,)

    def list(self, request, workspace_id, *args, **kwargs):
        pd = ProgrammeDocument.objects.filter(partner=self.request.user.partner, workspace=workspace_id)
        queryset = self.get_queryset().filter(reportables__indicator_reports__progress_report__programme_document__in=pd).distinct()
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

    queryset = Reportable.objects.all()
    serializer_class = IndicatorListSerializer
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)

    def list(self, request, workspace_id, *args, **kwargs):
        pd = ProgrammeDocument.objects.filter(partner=self.request.user.partner, workspace=workspace_id)
        queryset = self.get_queryset().filter(indicator_reports__progress_report__programme_document__in=pd)
        filtered = ProgrammeDocumentIndicatorFilter(request.GET, queryset=queryset)

        page = self.paginate_queryset(filtered.qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(filtered.qs, many=True)
        return Response(
            serializer.data,
            status=statuses.HTTP_200_OK
        )

class ProgressReportAPIView(ListAPIView):
    """
    Endpoint for getting list of all PD Progress Reports
    """
    serializer_class = ProgressReportSerializer
    pagination_class = SmallPagination
    permission_classes = (IsAuthenticated, )
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = ProgressReportFilter

    def get_queryset(self):
        # Limit reports to partner only
        return ProgressReport.objects.filter(programme_document__partner=self.request.user.partner)

    def list(self, request, workspace_id, *args, **kwargs):
        queryset = self.get_queryset().filter(programme_document__workspace=workspace_id)
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


class ProgressReportPDFView(RetrieveAPIView):
    """
        Endpoint for getting PDF of Progress Report Annex C.
    """
    permission_classes = (IsAuthenticated,)

    def prepare_reportable(self, indicator_reports):
        result = list()
        temp = None
        d = list()
        for r in indicator_reports:
            if not temp:
                temp = r.reportable.id
            elif temp != r.reportable.id:
                result.append(d)
                temp = None
                d = list()
            d.append(r)
        if d:
            result.append(d)
        return result

    def get(self, request, pk, *args, **kwargs):
        # Render to pdf
        report = ProgressReport.objects.get(id=pk)

        data = dict()

        data['unicef_office'] = report.programme_document.unicef_office
        data['title'] = report.programme_document.title
        data['reference_number'] = report.programme_document.reference_number
        data['start_date'] = report.programme_document.start_date.strftime(settings.PRINT_DATA_FORMAT)
        data['end_date'] = report.programme_document.end_date.strftime(settings.PRINT_DATA_FORMAT)
        data['cso_contribution'] = report.programme_document.cso_contribution
        data['budget'] = report.programme_document.budget
        data['funds_received_to_date'] = report.funds_received_to_date
        data['challenges_in_the_reporting_period'] = report.challenges_in_the_reporting_period
        data['proposed_way_forward'] = report.proposed_way_forward
        data['partner_contribution_to_date'] = report.partner_contribution_to_date
        data['submission_date'] = report.get_submission_date()
        data['reporting_period'] = report.get_reporting_period()

        data['partner'] = report.programme_document.partner

        data['authorized_officer'] = report.programme_document.unicef_officers.first()
        data['focal_point'] = report.programme_document.unicef_focal_point.first()

        data['outputs'] = self.prepare_reportable(report.indicator_reports.all().order_by('reportable'))

        pdf = render_to_pdf("report_annex_c_pdf.html", data)
        return HttpResponse(pdf, content_type='application/pdf')


class ProgressReportDetailsAPIView(RetrieveAPIView):
    """
    Endpoint for getting Progress Report
    """
    serializer_class = ProgressReportSerializer
    permission_classes = (IsAuthenticated, )
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )

    def get(self, request, workspace_id, pk, *args, **kwargs):
        """
        Get Progress Report Details by given pk.
        """
        self.workspace_id = workspace_id
        serializer = self.get_serializer(
            self.get_object(pk)
        )
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def get_object(self, pk):
        try:
            return ProgressReport.objects.get(programme_document__partner=self.request.user.partner, programme_document__workspace=self.workspace_id, pk=pk)
        except ProgressReport.DoesNotExist as exp:
            logger.exception({
                "endpoint": "ProgressReportDetailsAPIView",
                "request.data": self.request.data,
                "pk": pk,
                "exception": exp,
            })
            raise Http404

class ProgressReportIndicatorsAPIView(ListAPIView):
    serializer_class = PDReportsSerializer
    pagination_class = SmallPagination
    permission_classes = (IsAuthenticated,)
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = PDReportsFilter

    def get_queryset(self):
        # Limit reports to partner only
        return IndicatorReport.objects.filter(progress_report__programme_document__partner=self.request.user.partner)

    def list(self, request, workspace_id, progress_report_id, *args, **kwargs):
        """
        Get Programme Document Details by given pk.
        """
        queryset = self.get_queryset().filter(progress_report__id=progress_report_id, progress_report__programme_document__workspace=workspace_id)
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
            return ProgressReport.objects.get(programme_document__partner=self.request.user.partner, programme_document__workspace=self.workspace_id, pk=pk)
        except ProgressReport.DoesNotExist as exp:
            logger.exception({
                "endpoint": "ProgressReportDetailsAPIView",
                "request.data": self.request.data,
                "pk": pk,
                "exception": exp,
            })
            raise Http404

    def list(self, request, workspace_id, progress_report_id, *args, **kwargs):
        self.workspace_id = workspace_id
        pr = self.get_object(progress_report_id)
        queryset = self.get_queryset().filter(
            reportables__indicator_reports__progress_report__programme_document__progress_reports=pr).distinct()
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
    permission_classes = (IsAuthenticated,)

    def get_object(self, pk):
        try:
            return ProgressReport.objects.get(programme_document__partner=self.request.user.partner, programme_document__workspace=self.workspace_id, pk=pk)
        except ProgressReport.DoesNotExist as exp:
            logger.exception({
                "endpoint": "ProgressReportDetailsAPIView",
                "request.data": self.request.data,
                "pk": pk,
                "exception": exp,
            })
            raise Http404

    @transaction.atomic
    def post(self, request, workspace_id, pk, *args, **kwargs):
        self.workspace_id = workspace_id
        progress_report = self.get_object(pk)

        for ir in progress_report.indicator_reports.all():
            # Check if all indicator data is fulfilled for IR status different then Met or No Progress
            if ir.overall_status not in (OVERALL_STATUS.met, OVERALL_STATUS.no_progress):
                for data in ir.indicator_location_data.all():
                    for key, vals in data.disaggregation.iteritems():
                        if ir.is_percentage and (vals.get('c', None) in [None, '']):
                            _errors = [{
                                "message": "You have not completed all required indicators for this progress report. Unless your Output status is Met or has No Progress, all indicator data needs to be completed."}]
                            return Response({"errors": _errors},
                                            status=statuses.HTTP_400_BAD_REQUEST)
                        elif ir.is_number and (vals.get('v', None) in [None, '']):
                            _errors = [{
                                "message": "You have not completed all required indicators for this progress report. Unless your Output status is Met or has No Progress, all indicator data needs to be completed."}]
                            return Response({"errors": _errors},
                                            status=statuses.HTTP_400_BAD_REQUEST)

            # Check if indicator was already submitted or SENT BACK
            if ir.submission_date is None or ir.report_status == INDICATOR_REPORT_STATUS.sent_back:
                ir.submission_date = datetime.now().date()
                ir.report_status = INDICATOR_REPORT_STATUS.submitted
                ir.save()

        if progress_report.submission_date is None or progress_report.status == PROGRESS_REPORT_STATUS.sent_back:
            progress_report.status = PROGRESS_REPORT_STATUS.submitted
            progress_report.submission_date = datetime.now().date()
            progress_report.submitted_by = self.request.user
            progress_report.save()
            serializer = ProgressReportSerializer(instance=progress_report)
            return Response(serializer.data, status=statuses.HTTP_200_OK)
        else:
            _errors = [{
                           "message": "Progress report was already submitted. Your IMO will need to send it back for you to edit your submission."}]
            return Response({"errors": _errors},
                            status=statuses.HTTP_400_BAD_REQUEST)