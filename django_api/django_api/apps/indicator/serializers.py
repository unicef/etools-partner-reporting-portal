from ast import literal_eval as make_tuple

from django.conf import settings
from django.contrib.contenttypes.models import ContentType

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from unicef.models import LowerLevelOutput

from core.serializers import SimpleLocationSerializer, IdLocationSerializer
from core.models import Location
from cluster.models import ClusterObjective

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
)


class IndicatorBlueprintSimpleSerializer(serializers.ModelSerializer):

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
    achieved = serializers.JSONField(source="total")
    report_status = serializers.CharField(source='get_report_status_display')

    class Meta:
        model = IndicatorReport
        fields = (
            'id',
            'indicator_name',
            'target',
            'achieved',
            'report_status',
        )

    def get_indicator_name(self, obj):
        # indicator_name can be indicator serialized or comes from blueprint
        # but when should be presented from blueprint? when entering data?
        return obj.reportable.blueprint.title

    def get_target(self, obj):
        return obj.reportable and obj.reportable.target


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
    disaggregation = serializers.SerializerMethodField()
    location_progress = serializers.SerializerMethodField()
    previous_location_progress = serializers.SerializerMethodField()
    display_type = serializers.SerializerMethodField()

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
        current_ir_id = obj.indicator_report.id
        previous_indicator_reports = obj.indicator_report \
            .reportable.indicator_reports.filter(id__lt=current_ir_id)

        empty_progress = {'c': 0, 'd': 0, 'v': 0}

        if not previous_indicator_reports.exists():
            return empty_progress

        previous_report = previous_indicator_reports.last()
        previous_indicator_location_data_id_list = previous_report \
            .indicator_location_data \
            .values_list('id', flat=True)

        if obj.id in previous_indicator_location_data_id_list:
            loc_data = previous_report.indicator_location_data.get(id=obj.id)
            return loc_data.disaggregation['()']

        else:
            return empty_progress

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
        )


class IndicatorLocationDataUpdateSerializer(serializers.ModelSerializer):

    disaggregation = serializers.JSONField()

    class Meta:
        model = IndicatorLocationData
        fields = (
            'id',
            'indicator_report',
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

        # disaggregation_reported_on element-wise assertion
        for disagg_id in data['disaggregation_reported_on']:
            if disagg_id not in disaggregation_id_list:
                raise serializers.ValidationError(
                    "disaggregation_reported_on list must have "
                    + "all its elements mapped to disaggregation ids"
                )

        # IndicatorReport membership validation
        if not self.instance.id in data['indicator_report'] \
                .indicator_location_data.values_list('id', flat=True):
            raise serializers.ValidationError(
                "IndicatorLocationData does not belong to "
                + "this {}".format(data['indicator_report'])
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
                entries_only=True, r=data['level_reported'])

        if str(tuple()) not in valid_disaggregation_value_pairs:
            valid_disaggregation_value_pairs.append(
                str(tuple()))

        disaggregation_data_keys = data['disaggregation'].keys()

        valid_entry_count = len(valid_disaggregation_value_pairs)
        disaggregation_data_key_count = len(disaggregation_data_keys)

        # Assertion on all combinatoric entries for num_disaggregation and
        # level_reported against submitted disaggregation data
        if valid_entry_count > disaggregation_data_key_count:
            raise serializers.ValidationError(
                "Submitted disaggregation data entries does not contain "
                + "all possible combination pair keys"
            )

        if valid_entry_count < disaggregation_data_key_count:
            raise serializers.ValidationError(
                "Submitted disaggregation data entries contains "
                + "extra combination pair keys"
            )

        # Disaggregation data coordinate space check from level_reported
        for key in disaggregation_data_keys:
            try:
                parsed_tuple = make_tuple(key)

            except Exception as e:
                raise serializers.ValidationError(
                    "%s key is not in tuple format" % (key)
                )

            else:
                if len(parsed_tuple) > data['level_reported']:
                    raise serializers.ValidationError(
                        "%s Disaggregation data coordinate " % (key)
                        + "space cannot be higher than "
                        + "specified level_reported"
                    )

        # Disaggregation data coordinate space check
        # from disaggregation choice ids
        for key in disaggregation_data_keys:
            if key not in valid_disaggregation_value_pairs:
                raise serializers.ValidationError(
                    "%s coordinate space does not " % (key)
                    + "belong to disaggregation value id list")

            elif not isinstance(data['disaggregation'][key], dict):
                raise serializers.ValidationError(
                    "%s coordinate space does not " % (key)
                    + "have a correct value dictionary")

            elif data['disaggregation'][key].keys() != ['c', 'd', 'v']:
                raise serializers.ValidationError(
                    "%s coordinate space value does not " % (key)
                    + "have correct value key structure: c, d, v")

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

        return data


class IndicatorReportListSerializer(serializers.ModelSerializer):
    indicator_location_data = \
        SimpleIndicatorLocationDataListSerializer(many=True, read_only=True)
    disagg_lookup_map = serializers.SerializerMethodField()
    disagg_choice_lookup_map = serializers.SerializerMethodField()
    total = serializers.JSONField()
    display_type = serializers.SerializerMethodField()

    def get_display_type(self, obj):
        return obj.display_type

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
            'display_type',
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

    cluster_objective_id = serializers.CharField(source='object_id')
    blueprint = IndicatorBlueprintSerializer()
    locations = IdLocationSerializer(many=True)

    class Meta:
        model = Reportable
        fields = (
            'id',
            'means_of_verification',
            'blueprint',
            'cluster_objective_id',
            'locations',
        )

    def check_location(self, locations):
        if not isinstance(locations, (list, dict)) or\
                False in [loc.get('id', False) for loc in locations]:
            raise ValidationError({"locations": "List of dict location or one dict location expected"})

    def create(self, validated_data):

        self.check_location(self.initial_data.get('locations'))

        blueprint = IndicatorBlueprintSerializer(data=validated_data['blueprint'])
        if blueprint.is_valid():
            blueprint.save()
        else:
            raise ValidationError(blueprint.errors)

        validated_data['blueprint'] = blueprint.instance
        validated_data['content_type'] = ContentType.objects.get_for_model(ClusterObjective)
        validated_data['is_cluster_indicator'] = True
        del validated_data['locations']

        self.instance = Reportable.objects.create(**validated_data)

        for location in self.initial_data.get('locations'):
            self.instance.locations.add(Location.objects.get(id=location.get('id')))

        return self.instance

    def update(self, instance, validated_data):
        # cluster_objective_id should not be changed in this endpoint !
        self.check_location(self.initial_data.get('locations'))

        instance.means_of_verification = validated_data.get(
            'means_of_verification', instance.means_of_verification)
        instance.blueprint.title = \
            validated_data.get('blueprint', {}).get('title', instance.blueprint.title)
        instance.blueprint.unit = \
            validated_data.get('blueprint', {}).get('unit', instance.blueprint.unit)
        instance.blueprint.description = \
            validated_data.get('blueprint', {}).get('description', instance.blueprint.description)
        instance.blueprint.disaggregatable = \
            validated_data.get('blueprint', {}).get('disaggregatable', instance.blueprint.disaggregatable)

        _errors = []
        if validated_data.get('blueprint', {}).get('calculation_formula_across_periods'):
            _errors.append("Modify or change the `calculation_formula_across_periods` is not allowed.")
        if validated_data.get('blueprint', {}).get('calculation_formula_across_locations'):
            _errors.append("Modify or change the `calculation_formula_across_locations` is not allowed.")
        if validated_data.get('blueprint', {}).get('display_type'):
            _errors.append("Modify or change the `display_type` is not allowed.")
        if _errors:
            raise ValidationError({"errors": _errors})

        exclude_ids = [loc['id'] for loc in self.initial_data.get('locations')]
        Location.objects.filter(reportable_id=instance.id).exclude(id__in=exclude_ids).update(reportable=None)

        for location in self.initial_data.get('locations'):
            instance.locations.add(Location.objects.get(id=location.get('id')))

        instance.blueprint.save()
        instance.save()

        return instance
