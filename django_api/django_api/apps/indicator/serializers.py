from ast import literal_eval as make_tuple

from django.conf import settings

from rest_framework import serializers

from unicef.models import LowerLevelOutput
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
            'id',
            'title',
            'unit',
        )


class DisaggregationValueListSerializer(serializers.ModelSerializer):

    class Meta:
        model = DisaggregationValue
        fields = (
            'id',
            'value',
            'active',
        )


class DisaggregationListSerializer(serializers.ModelSerializer):
    choices = DisaggregationValueListSerializer(
        many=True, read_only=True, source='disaggregation_value')

    class Meta:
        model = Disaggregation
        fields = (
            'id',
            'name',
            'active',
            'choices',
        )


class IndicatorReportSimpleSerializer(serializers.ModelSerializer):

    indicator_name = serializers.SerializerMethodField()
    target = serializers.SerializerMethodField()
    achieved = serializers.SerializerMethodField()

    class Meta:
        model = IndicatorReport
        fields = (
            'id',
            'indicator_name',
            'target',
            'achieved',
        )

    def get_indicator_name(self, obj):
        # indicator_name can be indicator serialized or comes from blueprint
        # but when should be presented from blueprint? when entering data?
        return obj.reportable.blueprint.title

    def get_target(self, obj):
        return obj.reportable and obj.reportable.target

    def get_achieved(self, obj):
        return str(obj.total)


class IndicatorReportStatusSerializer(serializers.ModelSerializer):

    report_status = serializers.CharField(source='get_report_status_display')

    class Meta:
        model = IndicatorReport
        fields = (
            'remarks',
            'report_status',
        )


class IndicatorListSerializer(serializers.ModelSerializer):
    blueprint = IndicatorBlueprintSimpleSerializer()
    ref_num = serializers.CharField()
    achieved = serializers.IntegerField()
    progress_percentage = serializers.FloatField()

    class Meta:
        model = Reportable
        fields = (
            'id',
            'target',
            'baseline',
            'blueprint',
            'ref_num',
            'achieved',
            'progress_percentage',
        )


class IndicatorLLoutputsSerializer(serializers.ModelSerializer):

    name = serializers.SerializerMethodField()
    llo_id = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    indicator_reports = serializers.SerializerMethodField()

    class Meta:
        model = Reportable
        fields = (
            'id',
            'name',
            'llo_id',
            'status',
            'indicator_reports',
        )

    def get_name(self, obj):
        if isinstance(obj.content_object, LowerLevelOutput):
            return obj.blueprint.title
        else:
            return ''

    def get_llo_id(self, obj):
        if isinstance(obj.content_object, LowerLevelOutput):
            return obj.content_object.id
        else:
            return ''

    def get_status(self, obj):
        # first indicator report associated with this output
        indicator_report = obj.indicator_reports.first()
        serializer = IndicatorReportStatusSerializer(indicator_report)
        return serializer.data

    def get_indicator_reports(self, obj):
        children = obj.indicator_reports.all()
        serializer = IndicatorReportSimpleSerializer(children, many=True)
        return serializer.data


class SimpleIndicatorLocationDataListSerializer(serializers.ModelSerializer):

    location = SimpleLocationSerializer(read_only=True)
    disaggregation = serializers.JSONField()

    class Meta:
        model = IndicatorLocationData
        fields = (
            'id',
            'indicator_report',
            'location',
            'disaggregation',
            'num_disaggregation',
            'level_reported',
            'disaggregation_reported_on',
        )

    def validate(self, data):
        """
        Check IndicatorLocationData object's disaggregation
        field is correctly mapped to the disaggregation values.
        """

        # Disaggregation data coordinate space check from level_reported
        for key in data['disaggregation'].keys():
            if len(make_tuple(key)) > data['level_reported']:
                raise serializers.ValidationError(
                    "%s Disaggregation data coordinate " % (key)
                    + "space cannot be higher than "
                    + "specified level_reported"
                )

        try:
            indicator_report = IndicatorReport.objects.get(
                id=data['indicator_report'])

        except IndicatorReport.DoesNotExist:
            raise serializers.ValidationError(
                "IndicatorReport ID %d" % (data['indicator_report'])
                + "does not exist for "
                + "IndicatorLocationData ID %d" % (data['id']))

        disaggregation_value_id_list = \
            indicator_report.disaggregation_values(id_only=True, flat=True)

        # Disaggregation data coordinate space check
        # from disaggregation choice ids
        for key in data['disaggregation'].keys():
            tuple_key = make_tuple(key)

            disagg_value_check_list = map(
                lambda k: k not in disaggregation_value_id_list, tuple_key
            )

            if not all(disagg_value_check_list):
                raise serializers.ValidationError(
                    "%s coordinate space does not " % (key)
                    + "belong to disaggregation value id list")

        return data


class IndicatorReportListSerializer(serializers.ModelSerializer):
    indicator_location_data = \
        SimpleIndicatorLocationDataListSerializer(many=True, read_only=True)
    disagg_lookup_map = serializers.SerializerMethodField()
    disagg_choice_lookup_map = serializers.SerializerMethodField()

    def get_disagg_lookup_map(self, obj):
        serializer = DisaggregationListSerializer(
            obj.disaggregations, many=True)

        return serializer.data

    def get_disagg_choice_lookup_map(self, obj):
        lookup_array = obj.disaggregation_values(id_only=False)
        lookup_array.sort(key=len)

        return lookup_array

    class Meta:
        model = IndicatorReport
        fields = (
            'id',
            'title',
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

    id = serializers.SerializerMethodField()
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

    def get_id(self, obj):
        return str(obj.id)

    def get_reporting_period(self, obj):
        return "%s - %s " % (
            obj.time_period_start.strftime(settings.PRINT_DATA_FORMAT),
            obj.time_period_end.strftime(settings.PRINT_DATA_FORMAT)
        )

    def get_submission_date(self, obj):
        return obj.submission_date and obj.submission_date.strftime(settings.PRINT_DATA_FORMAT)

    def get_due_date(self, obj):
        return obj.due_date and obj.due_date.strftime(settings.PRINT_DATA_FORMAT)
