from django.conf import settings
from rest_framework import serializers

from .models import ProgrammeDocument, Section, ProgressReport, Person, \
    LowerLevelOutput, CountryProgrammeOutput
from core.common import PROGRESS_REPORT_STATUS
from indicator.serializers import (
    PDReportsSerializer,
    IndicatorBlueprintSimpleSerializer,
    IndicatorLLoutputsSerializer
)


class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = ('name', 'title', 'email', 'phone_number')


class ProgrammeDocumentSerializer(serializers.ModelSerializer):

    id = serializers.SerializerMethodField()
    status = serializers.CharField(source='get_status_display')
    total_unicef_supplies = serializers.SerializerMethodField()
    unicef_officers = PersonSerializer(read_only=True, many=True)
    unicef_focal_point = PersonSerializer(read_only=True, many=True)
    partner_focal_point = PersonSerializer(read_only=True, many=True)

    class Meta:
        model = ProgrammeDocument
        fields = (
            'id',
            'agreement',
            'reference_number',
            'title',
            'unicef_office',
            'start_date',
            'end_date',
            'population_focus',
            'status',
            'calculated_budget',
            'cso_contribution',
            'total_unicef_cash',
            'total_unicef_supplies',
            'partner_focal_point',
            'unicef_focal_point',
            'unicef_officers'
        )

    def get_id(self, obj):
        return str(obj.id)

    def get_total_unicef_supplies(self, obj):
        return str(obj.in_kind_amount)


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ('name', )


class ProgrammeDocumentDetailSerializer(serializers.ModelSerializer):

    document_type = serializers.CharField(source='get_document_type_display')
    # status is choice field on different branch with migration #23 - should be uncomment when it will be merged
    # status = serializers.CharField(source='get_status_display')
    frequency = serializers.CharField(source='get_frequency_display')
    # sections = serializers.SerializerMethodField()
    sections = SectionSerializer(read_only=True, many=True)
    unicef_officers = PersonSerializer(read_only=True, many=True)
    unicef_focal_point = PersonSerializer(read_only=True, many=True)
    partner_focal_point = PersonSerializer(read_only=True, many=True)

    class Meta:
        model = ProgrammeDocument
        fields = (
            'id',
            'agreement',
            'document_type',
            'reference_number',
            'title',
            'unicef_office',
            'unicef_officers',
            'unicef_focal_point',
            'partner_focal_point',
            'start_date',
            'end_date',
            'population_focus',
            # 'status',
            'frequency',
            'sections',
        )


class LLOutputNestedIndicatorReportSerializer(serializers.ModelSerializer):
    """
    Nests with LL output.
    """

    class Meta:
        model = LowerLevelOutput
        fields = (
            'id',
            'title',
        )


class CPOutputNestedIndicatorReportSerializer(serializers.ModelSerializer):
    """
    Nests with CP output
    """
    ll_outputs = LLOutputNestedIndicatorReportSerializer(many=True, read_only=True)

    class Meta:
        model = CountryProgrammeOutput
        fields = (
            'id',
            'title',
            'll_outputs'
        )


class ProgrammeDocumentOutputNestedIndicatorReportSerializer(serializers.ModelSerializer):
    """
    Serializer for PD with indicator reports nested by output.
    """
    cp_outputs = CPOutputNestedIndicatorReportSerializer(many=True, read_only=True)

    class Meta:
        model = ProgrammeDocument
        fields = (
            'id',
            'title',
            'cp_outputs'
        )



class ProgressReportSerializer(serializers.ModelSerializer):
    programme_document = ProgrammeDocumentOutputNestedIndicatorReportSerializer()
    reporting_period = serializers.SerializerMethodField()
    is_draft = serializers.SerializerMethodField()
    indicator_reports = PDReportsSerializer(read_only=True, many=True)

    class Meta:
        model = ProgressReport
        fields = (
            'id',
            'partner_contribution_to_date',
            'funds_received_to_date',
            'challenges_in_the_reporting_period',
            'proposed_way_forward',
            'status',
            'reporting_period',
            'submission_date',
            'due_date',
            'is_draft',
            'review_date',
            'sent_back_feedback',
            'programme_document',
            'indicator_reports',
        )

    def get_reporting_period(self, obj):
        return "%s - %s " % (
            obj.start_date.strftime(settings.PRINT_DATA_FORMAT),
            obj.end_date.strftime(settings.PRINT_DATA_FORMAT)
        )

    def get_is_draft(self, obj):
        return obj.latest_indicator_report.is_draft


class ProgressReportUpdateSerializer(ProgressReportSerializer):
    programme_document = ProgrammeDocumentSerializer(read_only=True)


class ProgressReportReviewSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[
        PROGRESS_REPORT_STATUS.sent_back,
        PROGRESS_REPORT_STATUS.accepted
    ])
    comment = serializers.CharField(allow_blank=True)


class LLOutputSerializer(serializers.ModelSerializer):
    # id added explicitely here since it gets stripped out from validated_dat
    # as its read_only. https://stackoverflow.com/questions/36473795/django-rest-framework-model-id-field-in-nested-relationship-serializer
    id = serializers.IntegerField()

    class Meta:
        model = LowerLevelOutput
        fields = (
            'id',
            'title'
        )


class LLOutputIndicatorsSerializer(serializers.Serializer):
    """
    Represents indicators grouped by LLO.
    """
    ll_output = LLOutputSerializer()
    indicators = IndicatorBlueprintSimpleSerializer(many=True)


class ProgrammeDocumentCalculationMethodsSerializer(serializers.Serializer):
    """
    To serialize data needed when viewing/setting calculation methods on
    indicators for a PD.
    """
    ll_outputs_and_indicators = LLOutputIndicatorsSerializer(many=True)
