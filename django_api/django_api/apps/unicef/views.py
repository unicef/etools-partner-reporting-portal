import logging
from django.http import Http404
from django.db.models import Q

from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework import status as statuses

import django_filters.rest_framework

from core.paginations import SmallPagination
from core.permissions import IsAuthenticated
from core.models import Location
from core.serializers import ShortLocationSerializer

from .serializers import (
    ProgrammeDocumentSerializer,
    ProgrammeDocumentDetailSerializer,
    ProgressReportSerializer,
)

from .models import ProgrammeDocument, ProgressReport
from .filters import ProgrammeDocumentFilter, ProgressReportFilter

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
        queryset = self.get_queryset().filter(reportable__indicator_reports__progress_report__programme_document__in=pd)
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
