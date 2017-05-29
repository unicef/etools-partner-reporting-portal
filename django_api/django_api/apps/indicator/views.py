from rest_framework.response import Response
from rest_framework import status as statuses
from rest_framework.generics import ListAPIView
from core.permissions import IsAuthenticated

from .models import IndicatorReport
from .serializer import (
    PDReportsSerializer,
)


class PDReportsAPIView(ListAPIView):

    serializer_class = PDReportsSerializer
    permission_classes = (IsAuthenticated, )
    # filter_backends = (django_filters.rest_framework.DjangoFilterBackend, )
    # filter_class = PDReportsFilter

    def get_queryset(self):
        # draft
        from unicef.models import ProgrammeDocument
        pd = ProgrammeDocument.objects.get(pk=self.pd_id)
        pks = pd.reportable_queryset.values_list('indicator_reports__pk', flat=True)
        return IndicatorReport.objects.filter(id__in=pks)

    def list(self, request, pd_id, *args, **kwargs):
        """
        Get Programme Document Details by given pk.
        """
        self.pd_id = pd_id
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=statuses.HTTP_200_OK)
