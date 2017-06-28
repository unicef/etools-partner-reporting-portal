from ast import literal_eval as make_tuple
from collections import OrderedDict

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
    achieved = serializers.JSONField()
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

    __narrative_and_assessment = None

    name = serializers.SerializerMethodField()
    llo_id = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    indicator_reports = serializers.SerializerMethodField()
    overall_status = serializers.SerializerMethodField()
    narrative_assessemnt = serializers.SerializerMethodField()

    class Meta:
        model = Reportable
        fields = (
            'id',
            'name',
            'llo_id',
            'status',
            'overall_status',
            'narrative_assessemnt',
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

    def get_overall_status(self, obj):
        capture = self.__get_narrative_and_assessment(obj)
        if capture is not None:
            return capture['overall_status']
        return ''

    def get_narrative_assessemnt(self, obj):
        capture = self.__get_narrative_and_assessment(obj)
        if capture is not None:
            return capture['narrative_assessemnt'] or ''
        return ''

    def __get_narrative_and_assessment(self, obj):
        if self.__narrative_and_assessment is not None:
            return self.__narrative_and_assessment
        indicator_report = obj.indicator_reports.first()
        if indicator_report:
            self.__narrative_and_assessment = Reportable.get_narrative_and_assessment(
                indicator_report.progress_report_id)
        return self.__narrative_and_assessment




class SimpleIndicatorLocationDataListSerializer(serializers.ModelSerializer):

    location = SimpleLocationSerializer(read_only=True)
    disaggregation = serializers.SerializerMethodField()

    def get_disaggregation(self, obj):
        ordered_dict = obj.disaggregation.copy()
        keys = ordered_dict.keys()

        for key in keys:
            ordered_dict[make_tuple(key)] = ordered_dict[key]
            ordered_dict.pop(key)

        ordered_dict = OrderedDict(sorted(ordered_dict.items()), reverse=True)
        keys = ordered_dict.keys()

        for key in keys:
            ordered_dict[str(key)] = ordered_dict[key]
            ordered_dict.pop(key)

        return ordered_dict

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


class IndicatorReportListSerializer(serializers.ModelSerializer):
    indicator_location_data = \
        SimpleIndicatorLocationDataListSerializer(many=True, read_only=True)
    disagg_lookup_map = serializers.SerializerMethodField()
    disagg_choice_lookup_map = serializers.SerializerMethodField()
    total = serializers.JSONField()

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
