from rest_framework.generics import RetrieveAPIView
from core.permissions import IsAuthenticated

from .models import IndicatorReport
from .serializer import (
    PDReportsSerializer,
)


class PDReportsAPIView(RetrieveAPIView):

    serializer_class = PDReportsSerializer
    permission_classes = (IsAuthenticated, )
    # filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    # filter_class = PDReportsFilter

    def get_queryset(self):
        # draft
        return IndicatorReport.objects.all()
