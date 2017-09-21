from django.conf import settings
from rest_framework import serializers

from .models import ProgrammeDocument, Section, ProgressReport, Person
from indicator.serializers import PDReportsSerializer

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


class ProgressReportSerializer(serializers.ModelSerializer):
    programme_document = ProgrammeDocumentSerializer()
    reporting_period = serializers.SerializerMethodField()
    is_draft = serializers.SerializerMethodField()
    indicator_reports = PDReportsSerializer(read_only=True, many=True)

    class Meta:
        model = ProgressReport
        fields = (
            'partner_contribution_to_date',
            'funds_received_to_date',
            'challenges_in_the_reporting_period',
            'proposed_way_forward',
            'id',
            'programme_document',
            'status',
            'reporting_period',
            'submission_date',
            'due_date',
            'is_draft',
            'indicator_reports'
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
