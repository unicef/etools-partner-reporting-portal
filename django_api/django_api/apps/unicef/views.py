from rest_framework.generics import RetrieveAPIView, ListAPIView, ListCreateAPIView
import django_filters
import django_filters.rest_framework

from core.permissions import IsAuthenticated
from .serializer import (
    ProgrammeDocumentSerializer,
)

from .models import ProgrammeDocument
from .filters import ProgrammeDocumentFilter


class ProgrammeDocumentAPIView(ListCreateAPIView):
    """
    Endpoint for getting Programme Document.
    """
    serializer_class = ProgrammeDocumentSerializer
    permission_classes = (IsAuthenticated, )
    filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    filter_class = ProgrammeDocumentFilter

    def get_queryset(self):
        return ProgrammeDocument.objects.all()
        # TODO: we should filter PD to partner I guess?
        # return ProgrammeDocument.objects.filter(reportable__project__partner=self.request.user.partner)
