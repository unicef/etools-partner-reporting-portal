from django.conf import settings
from rest_framework import serializers

from core.serializers import SimpleLocationSerializer

from .models import (
    Reportable, IndicatorBlueprint,
    IndicatorReport, IndicatorLocationData,
    Disaggregation, DisaggregationValue,
)


class IndicatorBlueprintSimpleSerializer(serializers.ModelSerializer):

    class Meta:
        model = IndicatorBlueprint
        fields = (
            'id', 'title', 'unit',
        )


class DisaggregationValueListSerializer(serializers.ModelSerializer):

    class Meta:
        model = DisaggregationValue
        fields = (
            'id', 'value',
            'active',
        )


class DisaggregationListSerializer(serializers.ModelSerializer):
    choices = DisaggregationValueListSerializer(many=True, read_only=True, source='disaggregation_value')

    class Meta:
        model = Disaggregation
        fields = (
            'id', 'name',
            'active',
            'choices',
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
            'ref_num', 'achieved', 'progress_percentage',
        )


class SimpleIndicatorLocationDataListSerializer(serializers.ModelSerializer):

    location = SimpleLocationSerializer(read_only=True)
    disaggregation = serializers.JSONField()

    class Meta:
        model = IndicatorLocationData
        fields = (
            'id',
            'location',
            'disaggregation',
            'num_disaggregation',
            'level_reported',
            'disaggregation_reported_on',
        )


class IndicatorReportListSerializer(serializers.ModelSerializer):
    indicator_location_data = SimpleIndicatorLocationDataListSerializer(many=True, read_only=True)
    disagg_lookup_map = serializers.SerializerMethodField()
    disagg_choice_lookup_map = serializers.SerializerMethodField()

    def get_disagg_lookup_map(self, obj):
        serializer = DisaggregationListSerializer(obj.disaggregations, many=True)

        return serializer.data

    def get_disagg_choice_lookup_map(self, obj):
        lookup_array = []

        for disaggregation in obj.disaggregations:
            disaggregation_value = disaggregation.disaggregation_value.values_list('id', 'value')

            lookup_array.append(list(disaggregation_value))

        lookup_array.sort(key=len)

        return lookup_array

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
            'disagg_lookup_map',
            'disagg_choice_lookup_map',
        )


class PDReportsSerializer(serializers.ModelSerializer):

    reporting_period = serializers.SerializerMethodField()
    submission_date = serializers.SerializerMethodField()
    due_date = serializers.SerializerMethodField()

    class Meta:
        model = IndicatorReport
        fields = (
            'id',
            'reporting_period',
            'progress_report_status',
            'submission_date',
            'is_draft',
            'due_date',
        )

    def get_reporting_period(self, obj):
        return "%s - %s " % (
            obj.time_period_start.strftime(settings.PRINT_DATA_FORMAT),
            obj.time_period_end.strftime(settings.PRINT_DATA_FORMAT)
        )

    def get_submission_date(self, obj):
        return obj.submission_date and obj.submission_date.strftime(settings.PRINT_DATA_FORMAT)

    def get_due_date(self, obj):
        return obj.due_date and obj.due_date.strftime(settings.PRINT_DATA_FORMAT)
