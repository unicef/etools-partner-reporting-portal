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
        pd_ids = Location.objects.filter(
            Q(id=self.location_id) |
            Q(parent_id=self.location_id) |
            Q(parent__parent_id=self.location_id) |
            Q(parent__parent__parent_id=self.location_id) |
            Q(parent__parent__parent__parent_id=self.location_id)
        ).values_list(
             'reportable__lower_level_outputs__cp_output__programme_document__id',
             flat=True
        )
        return ProgrammeDocument.objects.filter(pk__in=pd_ids)

    def list(self, request, location_id, *args, **kwargs):
        self.location_id = location_id
        queryset = self.get_queryset()
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

    def get(self, request, pk, *args, **kwargs):
        """
        Get Programme Document Details by given pk.
        """
        serializer = self.get_serializer(
            self.get_object(pk)
        )
        return Response(serializer.data, status=statuses.HTTP_200_OK)

    def get_object(self, pk):
        # TODO: permission to object should be checked and raise 403 if fail!!!
        try:
            return ProgrammeDocument.objects.get(pk=pk)
        except ProgrammeDocument.DoesNotExist as exp:
            logger.exception({
                "endpoint": "ProgrammeDocumentDetailsAPIView",
                "request.data": self.request.data,
                "pk": pk,
                "exception": exp,
            })
            raise Http404


class ProgressReportAPIView(ListAPIView):
    """
    Endpoint for getting list of all PD Progress Reports
    """
    # queryset = ProgressReport.objects.all()
    serializer_class = ProgressReportSerializer
    pagination_class = SmallPagination
    permission_classes = (IsAuthenticated, )
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = ProgressReportFilter

    def get_queryset(self):
        pd_ids = Location.objects.filter(
            Q(id=self.location_id) |
            Q(parent_id=self.location_id) |
            Q(parent__parent_id=self.location_id) |
            Q(parent__parent__parent_id=self.location_id) |
            Q(parent__parent__parent__parent_id=self.location_id)
        ).values_list(
             'reportable__lower_level_outputs__cp_output__programme_document__id',
             flat=True
        )
        return ProgressReport.objects.filter(programme_document_id__in=pd_ids)

    def list(self, request, location_id, *args, **kwargs):
        self.location_id = location_id
        queryset = self.get_queryset()
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
