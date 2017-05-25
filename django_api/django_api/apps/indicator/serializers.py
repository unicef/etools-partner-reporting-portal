from rest_framework import serializers

from core.serializers import SimpleLocationSerializer

from .models import (
    Reportable, IndicatorBlueprint,
    IndicatorReport, IndicatorLocationData
)


class IndicatorBlueprintSimpleSerializer(serializers.ModelSerializer):

    class Meta:
        model = IndicatorBlueprint
        fields = (
            'id', 'title', 'unit',
        )


class IndicatorListSerializer(serializers.ModelSerializer):
    blueprint = IndicatorBlueprintSimpleSerializer()
    ref_num = serializers.CharField()
    achieved = serializers.IntegerField()
    progress_percentage = serializers.FloatField()

    class Meta:
        model = Reportable
        fields = (
            'id', 'target', 'baseline', 'blueprint',
            'ref_num', 'achieved', 'progress_percentage'
        )


class SimpleIndicatorLocationDataListSerializer(serializers.ModelSerializer):

    location = SimpleLocationSerializer(read_only=True)
    disaggregation = serializers.JSONField()

    class Meta:
        model = IndicatorLocationData
        fields = (
            'id',
            'location'
            'disaggregation',
        )


class IndicatorReportListSerializer(serializers.ModelSerializer):
    indicator_location_data = SimpleIndicatorLocationDataListSerializer(many=True, read_only=True)

    class Meta:
        model = IndicatorReport
        fields = (
            'id', 'title',
            'indicator_location_data',
            'time_period_start',
            'time_period_end',
            'total',
            'remarks',
            'report_status',
        )
