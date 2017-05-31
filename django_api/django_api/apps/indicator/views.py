from django.contrib.contenttypes.models import ContentType
from rest_framework.response import Response
from rest_framework import status as statuses
from rest_framework.generics import ListCreateAPIView, ListAPIView

from core.permissions import IsAuthenticated
from core.paginations import SmallPagination
from unicef.models import LowerLevelOutput

from .serializers import IndicatorListSerializer, IndicatorDataSerializer
from .models import Reportable


class IndicatorListCreateAPIView(ListCreateAPIView):
    """
    REST API endpoint to get a list of Indicator objects and to create a new Indicator object.
    """
    serializer_class = IndicatorListSerializer
    pagination_class = SmallPagination

    def get_queryset(self):
        return Reportable.objects.filter(indicator_reports__isnull=False, content_type=ContentType.objects.get_for_model(LowerLevelOutput))


class IndicatorDataAPIView(ListAPIView):

    serializer_class = IndicatorDataSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        return Reportable.objects.filter(
            indicator_reports__id=self.ir_id,
            content_type=ContentType.objects.get_for_model(LowerLevelOutput)
        )

    def list(self, request, ir_id, *args, **kwargs):
        self.ir_id = ir_id
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            serializer.data,
            status=statuses.HTTP_200_OK
        )
