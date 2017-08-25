from ast import literal_eval as make_tuple

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from unicef.models import LowerLevelOutput

from core.common import REPORTABLE_FREQUENCY_LEVEL
from core.serializers import SimpleLocationSerializer, IdLocationSerializer
from core.models import Location
from cluster.models import ClusterObjective, ClusterActivity
from partner.models import PartnerProject, PartnerActivity

from core.validators import add_indicator_object_type_validator
from core.helpers import (
    generate_data_combination_entries,
    get_sorted_ordered_dict_by_keys,
    get_cast_dictionary_keys_as_tuple,
    get_cast_dictionary_keys_as_string,
)
from partner.models import PartnerProject, PartnerActivity
from cluster.models import ClusterObjective, ClusterActivity
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

    class Meta:
        model = IndicatorReport
        fields = (
            'id',
            'indicator_name',
            'target',
            'achieved',
            'total',
            'report_status',
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


class IndicatorListSerializer(serializers.ModelSerializer):
    blueprint = IndicatorBlueprintSimpleSerializer()
    ref_num = serializers.CharField()
    achieved = serializers.JSONField()
    progress_percentage = serializers.FloatField()
    content_type_name = serializers.SerializerMethodField()

    def get_content_type_name(self, obj):
        return obj.content_type.name

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
            'content_type_name',
            'object_id'
        )


class IndicatorLLoutputsSerializer(serializers.ModelSerializer):

    __narrative_and_assessment = None

    name = serializers.SerializerMethodField()
    llo_id = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    indicator_reports = serializers.SerializerMethodField()
    overall_status = serializers.SerializerMethodField()
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

    class Meta:
        model = IndicatorReport
        fields = (
            'overall_status',
            'narrative_assessment',
        )


class SimpleIndicatorLocationDataListSerializer(serializers.ModelSerializer):

    location = SimpleLocationSerializer(read_only=True)
    disaggregation = serializers.SerializerMethodField()
    location_progress = serializers.SerializerMethodField()
    previous_location_progress = serializers.SerializerMethodField()
    display_type = serializers.SerializerMethodField()
    is_complete = serializers.SerializerMethodField()

    def get_is_complete(self, obj):
        return True if obj.disaggregation else False

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
        return True if obj.disaggregation else False

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
        if not self.instance.id in data['indicator_report'] \
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
        disaggregation_data_key_count = len(disaggregation_data_keys)

        # Assertion on all combinatoric entries for num_disaggregation and
        # level_reported against submitted disaggregation data
        if valid_entry_count < disaggregation_data_key_count:
            raise serializers.ValidationError(
                "Submitted disaggregation data entries contains "
                + "extra combination pair keys"
            )

        valid_level_reported_key_count = len(filter(
            lambda key: len(key) == data['level_reported'],
            valid_disaggregation_value_pairs
        ))
        level_reported_key_count = 0

        # Disaggregation data coordinate space check from level_reported
        for key in disaggregation_data_keys:
            try:
                parsed_tuple = make_tuple(key)

            except Exception as e:
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

            elif data['disaggregation'][key].keys() != ['c', 'd', 'v']:
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

        disagg_lookup_list = serializer.data
        disagg_lookup_list.sort(key=lambda item: len(item['choices']))

        return disagg_lookup_list

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
            'report_status',
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

    disaggregation = serializers.JSONField()
    object_type = serializers.CharField(validators=[add_indicator_object_type_validator])
    blueprint = IndicatorBlueprintSerializer()
    locations = IdLocationSerializer(many=True)

    class Meta:
        model = Reportable
        fields = (
            'id',
            'means_of_verification',
            'blueprint',
            'object_id',
            'object_type',
            'locations',
            'disaggregation',
            'frequency',
            'cs_dates',
        )

    def get_object_type(self, obj):
        return obj.content_type

    def check_location(self, locations):
        if not isinstance(locations, (list, dict)) or\
                False in [loc.get('id', False) for loc in locations]:
            raise ValidationError({"locations": "List of dict location or one dict location expected"})

    def check_disaggregation(self, disaggregation):
        if not isinstance(disaggregation, list):
            raise ValidationError({"disaggregation": "List of dict disaggregation expected"})
        max_length = DisaggregationValue._meta.get_field('value').max_length
        for dis in disaggregation:
            for val in dis['values']:
                if len(val) > max_length:
                    msg = "Disaggregation Value expected max %s chars" % max_length
                    raise ValidationError({"disaggregation": msg})

    @transaction.atomic
    def create(self, validated_data):

        self.check_location(self.initial_data.get('locations'))
        self.check_disaggregation(self.initial_data.get('disaggregation'))

        validated_data['blueprint']['unit'] = validated_data['blueprint']['display_type']
        validated_data['blueprint']['disaggregatable'] = True
        blueprint = IndicatorBlueprintSerializer(data=validated_data['blueprint'])
        if blueprint.is_valid():
            blueprint.save()
        else:
            raise ValidationError(blueprint.errors)

        validated_data['blueprint'] = blueprint.instance

        if validated_data['object_type'] == 'ClusterObjective':
            validated_data['content_type'] = ContentType.objects.get_for_model(ClusterObjective)
            cluster_objective = get_object_or_404(ClusterObjective, pk=validated_data['object_id'])
            validated_data['start_date'] = cluster_objective.cluster.response_plan.start
            validated_data['end_date'] = cluster_objective.cluster.response_plan.end
            validated_data['is_cluster_indicator'] = True
        elif validated_data['object_type'] == 'ClusterActivity':
            validated_data['content_type'] = ContentType.objects.get_for_model(ClusterActivity)
            cluster_activity = get_object_or_404(ClusterActivity, pk=validated_data['object_id'])
            validated_data['start_date'] = cluster_activity.cluster_objective.cluster.response_plan.start
            validated_data['end_date'] = cluster_activity.cluster_objective.cluster.response_plan.end
            validated_data['is_cluster_indicator'] = True
        elif validated_data['object_type'] == 'PartnerProject':
            validated_data['content_type'] = ContentType.objects.get_for_model(PartnerProject)
            partner_project = get_object_or_404(PartnerProject, pk=validated_data['object_id'])
            validated_data['start_date'] = partner_project.start_date
            validated_data['end_date'] = partner_project.end_date
            validated_data['is_cluster_indicator'] = False
        elif validated_data['object_type'] == 'PartnerActivity':
            validated_data['content_type'] = ContentType.objects.get_for_model(PartnerActivity)
            partner_activity = get_object_or_404(PartnerActivity, pk=validated_data['object_id'])
            validated_data['start_date'] = partner_activity.project.start_date
            validated_data['end_date'] = partner_activity.project.end_date
            validated_data['is_cluster_indicator'] = False
        else:
            raise NotImplemented()

        del validated_data['object_type']
        del validated_data['locations']
        disaggregations = validated_data['disaggregation']
        del validated_data['disaggregation']

        self.instance = Reportable.objects.create(**validated_data)

        for location in self.initial_data.get('locations'):
            self.instance.locations.add(Location.objects.get(id=location.get('id')))

        for disaggregation in disaggregations:
            disaggregation_instance = Disaggregation.objects.create(
                name=disaggregation['name'],
                reportable=self.instance,
                active=True,
            )
            for value in disaggregation['values']:
                DisaggregationValue.objects.create(
                    disaggregation=disaggregation_instance,
                    value=value,
                    active=True
                )

        return self.instance

    def update(self, instance, validated_data):
        # cluster_objective_id should not be changed in this endpoint !
        self.check_location(self.initial_data.get('locations'))

        instance.means_of_verification = validated_data.get(
            'means_of_verification', instance.means_of_verification)
        instance.blueprint.title = \
            validated_data.get('blueprint', {}).get('title', instance.blueprint.title)

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


class ClusterIndicatorDataSerializer(serializers.ModelSerializer):

    disaggregation = DisaggregationListSerializer(many=True)
    blueprint = IndicatorBlueprintSerializer()
    locations = IdLocationSerializer(many=True)

    class Meta:
        model = Reportable
        fields = (
            'id',
            'means_of_verification',
            'blueprint',
            'locations',
            'disaggregation',
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


class ClusterIndicatorReportSerializer(serializers.ModelSerializer):

    indicator_name = serializers.SerializerMethodField()
    reportable = IndicatorListSerializer()
    reporting_period = serializers.SerializerMethodField()
    cluster = serializers.SerializerMethodField()
    project = serializers.SerializerMethodField()
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
            'cluster',
            'project',
            'is_draft',
            'can_submit',
        )

    def get_indicator_name(self, obj):
        return obj.reportable.blueprint.title

    def get_reporting_period(self, obj):
        return "%s - %s " % (
            obj.time_period_start.strftime(settings.PRINT_DATA_FORMAT),
            obj.time_period_end.strftime(settings.PRINT_DATA_FORMAT)
        )

    def get_cluster(self, obj):
        if isinstance(obj.reportable.content_object, (ClusterObjective, ClusterActivity)):
            return obj.reportable.content_object.cluster.title
        else:
            return ''

    def get_project(self, obj):
        if isinstance(obj.reportable.content_object, (PartnerProject, PartnerActivity)):
            return obj.reportable.content_object.title
        else:
            return ''

    def get_is_draft(self, obj):
        return obj.is_draft

    def get_can_submit(self, obj):
        return obj.can_submit


class ClusterIndicatorReportSimpleSerializer(serializers.ModelSerializer):

    title = serializers.SerializerMethodField()

    class Meta:
        model = IndicatorReport
        fields = (
            'id',
            'title',
        )

    def get_title(self, obj):
        return obj.reportable.blueprint.title
