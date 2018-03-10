from ast import literal_eval as make_tuple

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from unicef.models import LowerLevelOutput
from partner.models import PartnerProject, PartnerActivity
from cluster.models import ClusterObjective, ClusterActivity

from core.common import INDICATOR_REPORT_STATUS, FINAL_OVERALL_STATUS
from core.serializers import LocationSerializer, IdLocationSerializer, ShortLocationSerializer
from core.models import Location
from core.validators import add_indicator_object_type_validator
from core.helpers import (
    generate_data_combination_entries,
    get_sorted_ordered_dict_by_keys,
    get_cast_dictionary_keys_as_tuple,
    get_cast_dictionary_keys_as_string,
)

from .models import (
    Reportable, IndicatorBlueprint,
    IndicatorReport, IndicatorLocationData,
    Disaggregation, DisaggregationValue,
    get_reportable_data_to_clone,
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
        many=True, source='disaggregation_values')

    def create(self, validated_data):
        disaggregation_values = validated_data.pop('disaggregation_values')
        instance = Disaggregation.objects.create(**validated_data)
        for choice in disaggregation_values:
            DisaggregationValue.objects.create(disaggregation=instance,
                                               value=choice['value'])
        return instance

    class Meta:
        model = Disaggregation
        fields = (
            'id',
            'name',
            'active',
            'response_plan',
            'choices',
        )


class IdDisaggregationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disaggregation
        fields = ('id',)


class IndicatorBlueprintSimpleSerializer(serializers.ModelSerializer):
    # id added explicitly here since it gets stripped out from validated_data as its read_only.
    # https://stackoverflow.com/questions/36473795/django-rest-framework-model-id-field-in-nested-relationship-serializer
    id = serializers.IntegerField()

    class Meta:
        model = IndicatorBlueprint
        fields = (
            'id',
            'title',
            'unit',
            'display_type',
            'calculation_formula_across_periods',
            'calculation_formula_across_locations',
        )


class IndicatorReportSimpleSerializer(serializers.ModelSerializer):

    indicator_name = serializers.SerializerMethodField()
    target = serializers.SerializerMethodField()
    achieved = serializers.JSONField(source="total")

    class Meta:
        model = IndicatorReport
        fields = (
            'id',
            'indicator_name',
            'target',
            'achieved',
            'total',
            'report_status',
            'review_date',
            'sent_back_feedback'
        )

    def get_indicator_name(self, obj):
        # indicator_name can be indicator serialized or comes from blueprint
        # but when should be presented from blueprint? when entering data?
        return obj.reportable.blueprint.title

    def get_target(self, obj):
        return obj.reportable and obj.reportable.target


class IndicatorReportStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = IndicatorReport
        fields = (
            'remarks',
            'report_status',
        )


class ReportableSimpleSerializer(serializers.ModelSerializer):
    blueprint = IndicatorBlueprintSimpleSerializer()
    ref_num = serializers.CharField()
    achieved = serializers.JSONField()
    progress_percentage = serializers.FloatField()
    content_type_key = serializers.SerializerMethodField()
    content_object_title = serializers.SerializerMethodField()

    class Meta:
        model = Reportable
        fields = (
            'id',
            'target',
            'baseline',
            'in_need',
            'blueprint',
            'ref_num',
            'achieved',
            'progress_percentage',
            'content_type_key',
            'content_object_title',
            'object_id',
        )

    def get_content_type_key(self, obj):
        return '.'.join(obj.content_type.natural_key())

    def get_content_object_title(self, obj):
        return obj.content_object.title


class IndicatorListSerializer(ReportableSimpleSerializer):
    """
    Useful anywhere a list of indicators needs to be shown with minimal
    amount of data.
    """
    disaggregations = DisaggregationListSerializer(many=True, read_only=True)
    locations = ShortLocationSerializer(many=True, read_only=True)

    class Meta:
        model = Reportable
        fields = ReportableSimpleSerializer.Meta.fields + (
            'means_of_verification',
            'cs_dates',
            'frequency',
            'pd_id',
            'disaggregations',
            'locations',
        )


class IndicatorLLoutputsSerializer(serializers.ModelSerializer):
    """
    Returns all indicator reports that belong to this reportable.
    """
    __narrative_and_assessment = None

    name = serializers.SerializerMethodField()
    llo_id = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    indicator_reports = serializers.SerializerMethodField()
    overall_status = serializers.SerializerMethodField()
    overall_status_display = serializers.CharField(
        source='get_overall_status_display')
    narrative_assessment = serializers.SerializerMethodField()
    display_type = serializers.SerializerMethodField()

    class Meta:
        model = Reportable
        fields = (
            'id',
            'name',
            'llo_id',
            'status',
            'overall_status',
            'overall_status_display',
            'narrative_assessment',
            'indicator_reports',
            'display_type',
            'total',
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

    def get_narrative_assessment(self, obj):
        capture = self.__get_narrative_and_assessment(obj)
        if capture is not None:
            return capture['narrative_assessment'] or ''
        return ''

    def __get_narrative_and_assessment(self, obj):
        if self.__narrative_and_assessment is not None:
            return self.__narrative_and_assessment
        indicator_report = obj.indicator_reports.first()
        if indicator_report:
            self.__narrative_and_assessment = Reportable.get_narrative_and_assessment(
                indicator_report.progress_report_id)
        return self.__narrative_and_assessment

    def get_display_type(self, obj):
        return obj.blueprint.display_type


class OverallNarrativeSerializer(serializers.ModelSerializer):
    """
    Sets the overall status and narrative assessment on an IndicatorReport instance.
    """
    class Meta:
        model = IndicatorReport
        fields = (
            'overall_status',
            'narrative_assessment',
        )

    def validate_overall_status(self, overall_status):
        if self.instance and self.instance.progress_report and self.instance.progress_report.is_final:
            if overall_status not in FINAL_OVERALL_STATUS:
                error_msg = 'Only {} statuses are allowed for indicators within a final Progress Report.'.format(
                    ', '.join([v[1] for v in FINAL_OVERALL_STATUS])
                )
                raise ValidationError(error_msg)

        return overall_status


class SimpleIndicatorLocationDataListSerializer(serializers.ModelSerializer):

    location = LocationSerializer(read_only=True)
    disaggregation = serializers.SerializerMethodField()
    location_progress = serializers.SerializerMethodField()
    previous_location_progress = serializers.SerializerMethodField()
    display_type = serializers.SerializerMethodField()
    is_complete = serializers.SerializerMethodField()

    def get_is_complete(self, obj):
        return obj.is_complete

    def get_display_type(self, obj):
        return obj.indicator_report.display_type

    def get_disaggregation(self, obj):
        ordered_dict = get_cast_dictionary_keys_as_tuple(obj.disaggregation)

        ordered_dict = get_sorted_ordered_dict_by_keys(
            ordered_dict, reverse=True)

        ordered_dict = get_cast_dictionary_keys_as_string(ordered_dict)

        return ordered_dict

    def get_location_progress(self, obj):
        return obj.disaggregation['()']

    def get_previous_location_progress(self, obj):
        previous_location_data = obj.previous_location_data
        empty_progress = {'c': 0, 'd': 0, 'v': 0}
        if previous_location_data:
            return previous_location_data.disaggregation.get('()', empty_progress)

    class Meta:
        model = IndicatorLocationData
        fields = (
            'id',
            'indicator_report',
            'location',
            'display_type',
            'disaggregation',
            'num_disaggregation',
            'level_reported',
            'disaggregation_reported_on',
            'location_progress',
            'previous_location_progress',
            'is_complete',
        )


class IndicatorLocationDataUpdateSerializer(serializers.ModelSerializer):

    disaggregation = serializers.JSONField()
    is_complete = serializers.SerializerMethodField()

    class Meta:
        model = IndicatorLocationData
        fields = (
            'id',
            'indicator_report',
            'disaggregation',
            'num_disaggregation',
            'level_reported',
            'disaggregation_reported_on',
            'is_complete',
        )

    def get_is_complete(self, obj):
        return obj.is_complete

    def validate(self, data):
        """
        Check IndicatorLocationData object's disaggregation
        field is correctly mapped to the disaggregation values.
        """

        # level_reported and num_disaggregation validation
        if data['level_reported'] > data['num_disaggregation']:
            raise serializers.ValidationError(
                "level_reported cannot be higher than "
                + "its num_disaggregation"
            )

        # level_reported and disaggregation_reported_on validation
        if data['level_reported'] != len(data['disaggregation_reported_on']):
            raise serializers.ValidationError(
                "disaggregation_reported_on list must have "
                + "level_reported # of elements"
            )

        disaggregation_id_list = data[
            'indicator_report'].disaggregations.values_list('id', flat=True)

        # num_disaggregation validation with actual Disaggregation count
        # from Reportable
        if data['num_disaggregation'] != len(disaggregation_id_list):
            raise serializers.ValidationError(
                "num_disaggregation is not matched with "
                + "its IndicatorReport's Reportable disaggregation counts"
            )

        # IndicatorReport membership validation
        if self.instance.id not in data['indicator_report'] \
                .indicator_location_data.values_list('id', flat=True):
            raise serializers.ValidationError(
                "IndicatorLocationData does not belong to "
                + "this {}".format(data['indicator_report'])
            )

        # disaggregation_reported_on element-wise assertion
        for disagg_id in data['disaggregation_reported_on']:
            if disagg_id not in disaggregation_id_list:
                raise serializers.ValidationError(
                    "disaggregation_reported_on list must have "
                    + "all its elements mapped to disaggregation ids"
                )

        # Filter disaggregation option IDs
        # from given disaggregation_reported_on Disaggregation IDs
        disaggregation_value_id_list = \
            data['indicator_report'].disaggregation_values(
                id_only=True,
                filter_by_id__in=data['disaggregation_reported_on'])

        valid_disaggregation_value_pairs = \
            generate_data_combination_entries(
                disaggregation_value_id_list,
                entries_only=True, key_type=set, r=data['level_reported'])

        if set() not in valid_disaggregation_value_pairs:
            valid_disaggregation_value_pairs.append(set())

        disaggregation_data_keys = data['disaggregation'].keys()

        valid_entry_count = len(valid_disaggregation_value_pairs)
        disaggregation_data_key_count = len(list(disaggregation_data_keys))

        # Assertion on all combinatoric entries for num_disaggregation and
        # level_reported against submitted disaggregation data
        if valid_entry_count < disaggregation_data_key_count:
            raise serializers.ValidationError(
                "Submitted disaggregation data entries contains "
                + "extra combination pair keys"
            )

        valid_level_reported_key_count = len(list(filter(
            lambda key: len(key) == data['level_reported'],
            valid_disaggregation_value_pairs
        )))
        level_reported_key_count = 0

        # Disaggregation data coordinate space check from level_reported
        for key in disaggregation_data_keys:
            try:
                parsed_tuple = make_tuple(key)

            except Exception:
                raise serializers.ValidationError(
                    "%s key is not in tuple format" % (key)
                )

            if len(parsed_tuple) > data['level_reported']:
                raise serializers.ValidationError(
                    "%s Disaggregation data coordinate " % (key)
                    + "space cannot be higher than "
                    + "specified level_reported"
                )

            # Disaggregation data coordinate space check
            # from disaggregation choice ids
            elif set(parsed_tuple) not in valid_disaggregation_value_pairs:
                raise serializers.ValidationError(
                    "%s coordinate space does not " % (key)
                    + "belong to disaggregation value id list")

            elif not isinstance(data['disaggregation'][key], dict):
                raise serializers.ValidationError(
                    "%s coordinate space does not " % (key)
                    + "have a correct value dictionary")

            elif list(data['disaggregation'][key].keys()) != ['c', 'd', 'v']:
                raise serializers.ValidationError(
                    "%s coordinate space value does not " % (key)
                    + "have correct value key structure: c, d, v")

            if len(parsed_tuple) == data['level_reported']:
                level_reported_key_count += 1

            # Sanitizing data value
            if isinstance(data['disaggregation'][key]['c'], str):
                data['disaggregation'][key]['c'] = \
                    int(data['disaggregation'][key]['c'])

            if isinstance(data['disaggregation'][key]['d'], str):
                data['disaggregation'][key]['d'] = \
                    int(data['disaggregation'][key]['d'])

            if isinstance(data['disaggregation'][key]['v'], str):
                data['disaggregation'][key]['v'] = \
                    int(data['disaggregation'][key]['v'])

        if level_reported_key_count != valid_level_reported_key_count:
            raise serializers.ValidationError(
                "Submitted disaggregation data entries do not contain "
                + "all level %d combination pair keys" % (data['level_reported'])
            )

        return data


class IndicatorReportListSerializer(serializers.ModelSerializer):
    indicator_location_data = SimpleIndicatorLocationDataListSerializer(many=True, read_only=True)
    disagg_lookup_map = serializers.SerializerMethodField()
    disagg_choice_lookup_map = serializers.SerializerMethodField()
    total = serializers.JSONField()
    display_type = serializers.SerializerMethodField()
    overall_status_display = serializers.CharField(
        source='get_overall_status_display')

    class Meta:
        model = IndicatorReport
        fields = (
            'id',
            'title',
            'indicator_location_data',
            'time_period_start',
            'time_period_end',
            'due_date',
            'display_type',
            'submission_date',
            'total',
            'remarks',
            'report_status',
            'disagg_lookup_map',
            'disagg_choice_lookup_map',
            'overall_status',
            'overall_status_display',
            'narrative_assessment'
        )

    def get_display_type(self, obj):
        return obj.display_type

    def get_disagg_lookup_map(self, obj):
        serializer = DisaggregationListSerializer(obj.disaggregations, many=True)

        disagg_lookup_list = serializer.data
        disagg_lookup_list.sort(key=lambda item: len(item['choices']))

        return disagg_lookup_list

    def get_disagg_choice_lookup_map(self, obj):
        lookup_array = obj.disaggregation_values(id_only=False)
        lookup_array.sort(key=len)

        return lookup_array


class ClusterIndicatorReportListSerializer(IndicatorReportListSerializer):
    cluster = serializers.SerializerMethodField()
    partner = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    indicator_id = serializers.SerializerMethodField()

    def get_cluster(self, obj):
        cluster = obj.reportable.content_object.partner.clusters.first()

        if cluster:
            return cluster.type

        else:
            return ''

    def get_partner(self, obj):
        return obj.reportable.content_object.partner.title

    def get_progress_percentage(self, obj):
        return obj.reportable.progress_percentage

    def get_indicator_id(self, obj):
        return obj.reportable.id

    class Meta(IndicatorReportListSerializer.Meta):
        fields = IndicatorReportListSerializer.Meta.fields + (
            'cluster',
            'partner',
            'progress_percentage',
            'indicator_id',
        )


class PDReportContextIndicatorReportSerializer(serializers.ModelSerializer):
    """
    A serializer for IndicatorReport model but specific information
    that is helpful in IP reporting from a Programme Document / Progress
    Report perspective (TODO: specify what is PD specfic?).
    """
    id = serializers.SerializerMethodField()
    reporting_period = serializers.SerializerMethodField()
    reportable_object_id = serializers.SerializerMethodField()
    submission_date = serializers.SerializerMethodField()
    due_date = serializers.SerializerMethodField()
    is_cluster_indicator = serializers.SerializerMethodField()
    reportable = ReportableSimpleSerializer()
    report_status_display = serializers.CharField(
        source='get_report_status_display')
    overall_status_display = serializers.CharField(
        source='get_overall_status_display')

    class Meta:
        model = IndicatorReport
        fields = (
            'id',
            'progress_report',
            'reportable',
            'reportable_object_id',
            'reporting_period',
            'progress_report_status',
            'report_status',
            'report_status_display',
            'submission_date',
            'is_draft',
            'is_cluster_indicator',
            'due_date',
            'total',
            'overall_status',
            'overall_status_display',
            'narrative_assessment',
        )

    def get_id(self, obj):
        return str(obj.id)

    def get_reporting_period(self, obj):
        return "%s - %s " % (
            obj.time_period_start.strftime(settings.PRINT_DATA_FORMAT),
            obj.time_period_end.strftime(settings.PRINT_DATA_FORMAT)
        )

    def get_reportable_object_id(self, obj):
        return obj.reportable.object_id

    def get_is_cluster_indicator(self, obj):
        return obj.reportable.is_cluster_indicator

    def get_submission_date(self, obj):
        return obj.submission_date and obj.submission_date.strftime(
            settings.PRINT_DATA_FORMAT)

    def get_due_date(self, obj):
        return obj.due_date and obj.due_date.strftime(
            settings.PRINT_DATA_FORMAT)


class IndicatorBlueprintSerializer(serializers.ModelSerializer):

    class Meta:
        model = IndicatorBlueprint
        fields = (
            'id',
            'title',
            'unit',
            'description',
            'disaggregatable',
            'calculation_formula_across_periods',
            'calculation_formula_across_locations',
            'display_type',
        )


class ClusterIndicatorSerializer(serializers.ModelSerializer):

    disaggregations = IdDisaggregationSerializer(many=True, read_only=True)
    object_type = serializers.CharField(validators=[add_indicator_object_type_validator], write_only=True)
    blueprint = IndicatorBlueprintSerializer()
    locations = IdLocationSerializer(many=True, read_only=True)
    target = serializers.CharField(required=False)
    baseline = serializers.CharField(required=False)

    class Meta:
        model = Reportable
        fields = (
            'id',
            'means_of_verification',
            'blueprint',
            'object_id',
            'object_type',
            'locations',
            'disaggregations',
            'frequency',
            'cs_dates',
            'target',
            'baseline',
            'in_need',
        )

    def check_locations_merge_to_list(self, locations):
        if isinstance(locations, dict) and 'id' in locations:
            return [locations]

        if isinstance(locations, list) and all([loc.get('id', None) for loc in locations]):
            return locations

        raise ValidationError({
            "locations": "List of dict location or one dict location expected"
        })

    def check_disaggregation(self, disaggregations):
        if not isinstance(disaggregations, list) or False in [dis.get('id', False) for dis in disaggregations]:
            raise ValidationError(
                {"disaggregations": "List of dict disaggregation expected"}
            )

    def check_progress_values(self, validated_data):
        """
        Validates baseline, target, in-need
        """
        if float(validated_data['baseline']) > float(validated_data['target']):
            raise ValidationError(
                {"baseline": "Baseline cannot be greater than target"}
            )

        if float(validated_data['target']) > float(validated_data['in_need']):
            raise ValidationError(
                {"target": "Target cannot be greater than In Need"}
            )

    def check_location_admin_levels(self, location_queryset):
        if location_queryset.values_list('gateway__admin_level', flat=True).distinct().count() != 1:
            raise ValidationError({"locations": "Selected locations should share same admin level"})

    @transaction.atomic
    def create(self, validated_data):
        locations = self.check_locations_merge_to_list(self.initial_data.get('locations'))
        self.check_disaggregation(self.initial_data.get('disaggregations'))
        self.check_progress_values(validated_data)

        if validated_data['blueprint']['display_type'] == IndicatorBlueprint.RATIO:
            validated_data['blueprint']['unit'] = IndicatorBlueprint.PERCENTAGE
        else:
            validated_data['blueprint']['unit'] = validated_data['blueprint']['display_type']
        validated_data['blueprint']['disaggregatable'] = True
        blueprint = IndicatorBlueprintSerializer(data=validated_data['blueprint'])
        blueprint.is_valid(raise_exception=True)

        validated_data['blueprint'] = blueprint.save()

        reportable_object_content_type = ContentType.objects.get_by_natural_key(
            *validated_data.pop('object_type').split('.')
        )
        reportable_object_content_model = reportable_object_content_type.model_class()

        if reportable_object_content_model == ClusterObjective:
            get_object_or_404(ClusterObjective, pk=validated_data['object_id'])
            validated_data['is_cluster_indicator'] = True
        elif reportable_object_content_model == ClusterActivity:
            get_object_or_404(ClusterActivity, pk=validated_data['object_id'])
            validated_data['is_cluster_indicator'] = True
        elif reportable_object_content_model == PartnerProject:
            get_object_or_404(PartnerProject, pk=validated_data['object_id'])
            validated_data['is_cluster_indicator'] = False
        elif reportable_object_content_model == PartnerActivity:
            get_object_or_404(PartnerActivity, pk=validated_data['object_id'])
            validated_data['is_cluster_indicator'] = False
        else:
            raise NotImplemented()

        validated_data['content_type'] = reportable_object_content_type

        self.instance = Reportable.objects.create(**validated_data)

        location_queryset = Location.objects.filter(id__in=[l['id'] for l in locations])
        self.check_location_admin_levels(location_queryset)

        self.instance.locations.add(*location_queryset)

        disaggregations = self.initial_data.get('disaggregations')
        self.instance.disaggregations.add(*Disaggregation.objects.filter(id__in=[d['id'] for d in disaggregations]))

        reportable_data_to_sync = get_reportable_data_to_clone(self.instance)

        for pa in self.instance.content_object.partner_activities.all():
            reportable_data_to_sync["content_object"] = pa
            reportable_data_to_sync["blueprint"] = self.instance.blueprint
            reportable_data_to_sync["parent_indicator"] = self.instance
            reportable = Reportable.objects.create(**reportable_data_to_sync)

            reportable.disaggregations.add(*self.instance.disaggregations.all())

        return self.instance

    def update(self, reportable, validated_data):
        locations = self.check_locations_merge_to_list(self.initial_data.get('locations'))
        locations_ids = [l['id'] for l in locations]
        location_queryset = Location.objects.filter(id__in=locations_ids)
        self.check_location_admin_levels(location_queryset)

        blueprint_data = validated_data.pop('blueprint', {})
        reportable.blueprint.title = blueprint_data.get('title', reportable.blueprint.title)
        reportable.blueprint.save()

        reportable.locations.through.objects.exclude(location_id__in=locations_ids).delete()
        reportable.locations.add(*location_queryset)

        return super(ClusterIndicatorSerializer, self).update(reportable, validated_data)


class ClusterIndicatorDataSerializer(serializers.ModelSerializer):

    disaggregations = DisaggregationListSerializer(many=True)
    blueprint = IndicatorBlueprintSerializer()
    locations = IdLocationSerializer(many=True)

    class Meta:
        model = Reportable
        fields = (
            'id',
            'means_of_verification',
            'blueprint',
            'locations',
            'disaggregations',
            'frequency',
            'cs_dates',
        )


class ClusterIndicatorForPartnerActivitySerializer(
        serializers.ModelSerializer):
    blueprint = IndicatorBlueprintSerializer()
    locations = LocationSerializer(many=True)

    class Meta:
        model = Reportable
        fields = (
            'id',
            'blueprint',
            'locations',
            'frequency',
            'cs_dates',
        )


class IndicatorReportUpdateSerializer(serializers.ModelSerializer):

    overall_status = serializers.SerializerMethodField()
    narrative_assessment = serializers.SerializerMethodField()

    class Meta:
        model = IndicatorReport
        fields = (
            'reporting_period',
        )


class IndicatorReportReviewSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[
        INDICATOR_REPORT_STATUS.sent_back,
        INDICATOR_REPORT_STATUS.accepted
    ])
    comment = serializers.CharField(required=False)

    def validate(self, data):
        """
        Make sure status is only accepted or sent back. Also overall_status
        should be set if accepting
        """
        if data['status'] not in [INDICATOR_REPORT_STATUS.sent_back,
                                  INDICATOR_REPORT_STATUS.accepted]:
            raise serializers.ValidationError(
                'Report status should be accepted or sent back')
        if data.get('status', None) == INDICATOR_REPORT_STATUS.sent_back and data.get(
                'comment') is None:
            raise serializers.ValidationError(
                'Comment required when sending back report')

        return data


class ClusterIndicatorReportSerializer(serializers.ModelSerializer):
    """
    Used to represent an individual indicator report in the cluster.
    """
    indicator_name = serializers.SerializerMethodField()
    reportable = IndicatorListSerializer()
    reporting_period = serializers.SerializerMethodField()
    cluster = serializers.SerializerMethodField()
    cluster_id = serializers.SerializerMethodField()
    project = serializers.SerializerMethodField()
    partner = serializers.SerializerMethodField()
    partner_id = serializers.SerializerMethodField()
    partner_activity = serializers.SerializerMethodField()
    cluster_objective = serializers.SerializerMethodField()
    cluster_activity = serializers.SerializerMethodField()
    is_draft = serializers.SerializerMethodField()
    can_submit = serializers.SerializerMethodField()

    class Meta:
        model = IndicatorReport
        fields = (
            'id',
            'indicator_name',
            'title',
            'reportable',
            'reporting_period',
            'due_date',
            'submission_date',
            'frequency',
            'total',
            'remarks',
            'report_status',
            'overall_status',
            'narrative_assessment',
            'sent_back_feedback',
            'review_date',
            'cluster',
            'cluster_id',
            'project',
            'partner',
            'partner_id',
            'partner_activity',
            'cluster_objective',
            'cluster_activity',
            'is_draft',
            'can_submit',
            'time_period_start',
            'time_period_end',
        )

    def get_indicator_name(self, obj):
        return obj.reportable.blueprint.title

    def get_reporting_period(self, obj):
        return "%s - %s " % (
            obj.time_period_start.strftime(settings.PRINT_DATA_FORMAT),
            obj.time_period_end.strftime(settings.PRINT_DATA_FORMAT)
        )

    def _get_cluster(self, obj):
        if isinstance(obj.reportable.content_object, (ClusterObjective, )):
            return obj.reportable.content_object.cluster
        elif isinstance(obj.reportable.content_object, (ClusterActivity, )):
            return obj.reportable.content_object.cluster_objective.cluster
        elif isinstance(obj.reportable.content_object, (PartnerActivity, )):
            if obj.reportable.content_object.cluster_activity:
                return obj.reportable.content_object.cluster_activity.cluster_objective.cluster
            else:
                return obj.reportable.content_object.cluster_objective.cluster
        elif isinstance(obj.reportable.content_object, (PartnerProject, )):
            return obj.reportable.content_object.clusters.first()
        else:
            return None

    def get_cluster(self, obj):
        cluster = self._get_cluster(obj)
        return {"id": cluster.id, "title": cluster.get_type_display()} if cluster else None

    def get_cluster_id(self, obj):
        cluster = self._get_cluster(obj)
        return cluster.id if cluster else None

    def get_project(self, obj):
        if isinstance(obj.reportable.content_object, (PartnerProject, )):
            return {"id": obj.reportable.content_object.id, "title": obj.reportable.content_object.title}
        elif isinstance(obj.reportable.content_object, (PartnerActivity, )):
            if obj.reportable.content_object.project:
                return {
                    "id": obj.reportable.content_object.project.id,
                    "title": obj.reportable.content_object.project.title
                }
        else:
            return None

    def _get_partner(self, obj):
        if isinstance(obj.reportable.content_object,
                      (PartnerProject, PartnerActivity)):
            return obj.reportable.content_object.partner
        else:
            return None

    def get_partner(self, obj):
        partner = self._get_partner(obj)

        return {"id": partner.id, "title": partner.title} if partner else None

    def get_partner_id(self, obj):
        partner = self._get_partner(obj)

        return partner.id if partner else None

    def get_partner_activity(self, obj):
        if isinstance(obj.reportable.content_object, (PartnerActivity, )):
            return {"id": obj.reportable.content_object.id, "title": obj.reportable.content_object.title}
        else:
            return None

    def get_cluster_objective(self, obj):
        if isinstance(obj.reportable.content_object, (ClusterObjective, )):
            return {"id": obj.reportable.content_object.id, "title": obj.reportable.content_object.title}
        else:
            return None

    def get_cluster_activity(self, obj):
        if isinstance(obj.reportable.content_object, (ClusterActivity, )):
            return {"id": obj.reportable.content_object.id, "title": obj.reportable.content_object.title}
        else:
            return None

    def get_is_draft(self, obj):
        return obj.is_draft

    def get_can_submit(self, obj):
        return obj.can_submit


class ReportableSimpleSerializer(serializers.ModelSerializer):

    title = serializers.SerializerMethodField()

    class Meta:
        model = Reportable
        fields = (
            'id',
            'title',
        )

    def get_title(self, obj):
        return obj.blueprint.title

# PMP API Serializers


class PMPIndicatorBlueprintSerializer(serializers.ModelSerializer):
    blueprint_id = serializers.CharField(source='external_id')

    class Meta:
        model = IndicatorBlueprint
        fields = (
            'blueprint_id',
            'title',
            'disaggregatable',
        )


class PMPDisaggregationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='external_id')

    class Meta:
        model = Disaggregation
        fields = (
            'id',
            'name',
            'active',
        )


class PMPDisaggregationValueSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='external_id')
    disaggregation = serializers.PrimaryKeyRelatedField(queryset=Disaggregation.objects.all())

    class Meta:
        model = DisaggregationValue
        fields = (
            'id',
            'value',
            'active',
            'disaggregation',
        )


class PMPReportableSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='external_id')
    title = serializers.CharField(source='means_of_verification')
    blueprint_id = serializers.PrimaryKeyRelatedField(
        queryset=IndicatorBlueprint.objects.all(), source="blueprint")
    location_ids = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), many=True, source="locations")
    disaggregation_ids = serializers.PrimaryKeyRelatedField(
        queryset=Disaggregation.objects.all(),
        many=True,
        allow_null=True,
        source="disaggregations")

    class Meta:
        model = Reportable
        fields = (
            'id',
            'target',
            'baseline',
            'title',
            'is_cluster_indicator',
            'blueprint_id',
            'location_ids',
            'disaggregation_ids',
            'content_type',
            'object_id',
        )


class ClusterPartnerAnalysisIndicatorResultSerializer(serializers.ModelSerializer):
    blueprint = IndicatorBlueprintSimpleSerializer()
    achieved = serializers.JSONField()
    progress_percentage = serializers.FloatField()
    progress_by_location = serializers.SerializerMethodField()
    indicator_reports = serializers.SerializerMethodField()
    project = serializers.SerializerMethodField()
    cluster_activity = serializers.SerializerMethodField()
    latest_report_status = serializers.SerializerMethodField()

    def get_progress_by_location(self, obj):
        result = {}
        ir = obj.indicator_reports.latest('id')

        locations = Location.objects.filter(
            indicator_location_data__indicator_report=ir
        ).distinct()

        for loc in locations:
            progress = 0

            for loc_data in loc.indicator_location_data.values_list('disaggregation', flat=True):
                progress += loc_data['()']['c']

            result[loc.title] = progress

        return result

    def get_indicator_reports(self, obj):
        irs = obj.indicator_reports.order_by('-id')[:2]

        if irs:
            return IndicatorReportListSerializer(
                irs, many=True, read_only=True).data
        else:
            return []

    def get_project(self, obj):
        if isinstance(obj.content_object, PartnerActivity) \
                and obj.content_object.project:
            return obj.content_object.project.title
        else:
            return ""

    def get_cluster_activity(self, obj):
        if isinstance(obj.content_object, PartnerActivity) \
                and obj.content_object.cluster_activity:
            return obj.content_object.cluster_activity.title
        else:
            return ""

    def get_latest_report_status(self, obj):
        ir = obj.indicator_reports.latest('id')

        if ir:
            return ir.overall_status
        else:
            return ""

    class Meta:
        model = Reportable
        fields = (
            'id',
            'target',
            'baseline',
            'blueprint',
            'achieved',
            'progress_percentage',
            'progress_by_location',
            'indicator_reports',
            'project',
            'cluster_activity',
            'latest_report_status',
        )
