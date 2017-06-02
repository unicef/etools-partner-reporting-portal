from django.contrib.contenttypes.models import ContentType
from rest_framework.response import Response
from rest_framework import status as statuses
from rest_framework.generics import ListCreateAPIView
from rest_framework.views import APIView

from core.permissions import IsAuthenticated
from core.paginations import SmallPagination
from unicef.models import LowerLevelOutput
from unicef.serializer import ProgressReportSerializer

from .serializers import IndicatorListSerializer, IndicatorDataSerializer
from .models import Reportable, IndicatorReport


class IndicatorListCreateAPIView(ListCreateAPIView):
    """
    REST API endpoint to get a list of Indicator objects and to create a new Indicator object.
    """
    serializer_class = IndicatorListSerializer
    pagination_class = SmallPagination

    def get_queryset(self):
        return Reportable.objects.filter(indicator_reports__isnull=False, content_type=ContentType.objects.get_for_model(LowerLevelOutput))


class IndicatorDataAPIView(APIView):

    permission_classes = (IsAuthenticated, )

    def get_queryset(self):
        return Reportable.objects.filter(
            indicator_reports__id=self.ir_id,
            lower_level_outputs__isnull=False
        )

    def get_indicator_report(self, id):
        try:
            return IndicatorReport.objects.get(id=id)
        except IndicatorReport.DoesNotExist:
            return None

    def get_narrative_object(self, id):
        ir = self.get_indicator_report(id)
        return ir and ir.progress_report

    def get(self, request, ir_id, *args, **kwargs):
        self.ir_id = ir_id
        ir = self.get_indicator_report(ir_id)
        narrative = self.get_narrative_object(ir_id)
        response = ProgressReportSerializer(narrative).data
        queryset = self.get_queryset()
        serializer = IndicatorDataSerializer(queryset, many=True)

        response['outputs'] = serializer.data

        return Response(
            response,
            status=statuses.HTTP_200_OK
        )
