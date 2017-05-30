from rest_framework.generics import RetrieveAPIView, ListAPIView, ListCreateAPIView
from rest_framework.response import Response
from rest_framework import status as statuses

import django_filters
import django_filters.rest_framework

from core.paginations import SmallPagination
from core.permissions import IsAuthenticated
from .serializer import (
    ProgrammeDocumentSerializer,
)
from indicator.models import Reportable

from .models import ProgrammeDocument
from .filters import ProgrammeDocumentFilter


class ProgrammeDocumentAPIView(ListCreateAPIView):
    """
    Endpoint for getting Programme Document.
    """
    serializer_class = ProgrammeDocumentSerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = SmallPagination
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = ProgrammeDocumentFilter

    def get_queryset(self):
        pd_ids = Reportable.objects.filter(
            locations__id=self.location_id
        ).values_list(
             'lower_level_outputs__indicator__programme_document__id',
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
