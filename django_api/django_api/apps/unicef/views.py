from django.http import Http404
from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework import status as statuses

import django_filters.rest_framework

from core.permissions import IsAuthenticated
from .serializer import (
    ProgrammeDocumentSerializer,
    ProgrammeDocumentDetailSerializer,
)

from .models import ProgrammeDocument
from .filters import ProgrammeDocumentFilter


class ProgrammeDocumentAPIView(ListAPIView):
    """
    Endpoint for getting Programme Document.
    """
    serializer_class = ProgrammeDocumentSerializer
    permission_classes = (IsAuthenticated, )
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    filter_class = ProgrammeDocumentFilter

    def get_queryset(self):
        return ProgrammeDocument.objects.all()
        # TODO: we should filter PD to partner I guess?
        # return ProgrammeDocument.objects.filter(reportable__project__partner=self.request.user.partner)


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
        except ProgrammeDocument.DoesNotExist:
            raise Http404
