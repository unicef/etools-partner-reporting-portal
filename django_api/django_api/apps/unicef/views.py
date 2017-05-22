from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework import status as statuses

from core.permissions import IsAuthenticated
from .serializer import (
    ProgrammeDocumentSerializer,
)

from .models import ProgrammeDocument
from .filters import ProgrammeDocumentFilter


class ProgrammeDocumentAPIView(ListAPIView):
    """
    Endpoint for getting Programme Document.
    """
    serializer_class = ProgrammeDocumentSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        return ProgrammeDocument.objects.all()
        # TODO: we should filter PD to partner I guess?
        # return ProgrammeDocument.objects.filter(reportable__project__partner=self.request.user.partner)

    def list(self, request, *args, **kwargs):
        """
        Get Programme Document list.
        """
        queryset = self.get_queryset()
        filtered = ProgrammeDocumentFilter(request.GET, queryset=queryset)
        serializer = self.get_serializer(filtered.qs, many=True)
        return Response(
            serializer.data,
            status=statuses.HTTP_200_OK
        )
