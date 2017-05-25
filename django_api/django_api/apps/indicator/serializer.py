from django.conf import settings
from rest_framework import serializers

from .models import IndicatorReport


class PDReportsSerializer(serializers.ModelSerializer):

    reporting_period = serializers.SerializerMethodField()
    # submission_date = serializers.SerializerMethodField()

    class Meta:
        model = IndicatorReport
        fields = (
            'id',
            'title',
            'time_period_start',
            'time_period_end',
            'reporting_period',
            'report_status',
            # 'submission_date',
        )

    def get_reporting_period(self, obj):
        return "%s - %s " % (
            obj.time_period_start.strftime(settings.PRINT_DATA_FORMAT),
            obj.time_period_end.strftime(settings.PRINT_DATA_FORMAT)
        )

    def get_submission_date(self, obj):
        return obj.submission_date.strftime(settings.PRINT_DATA_FORMAT)
