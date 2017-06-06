from django.conf import settings
from rest_framework import serializers

from .models import ProgrammeDocument, Section, ProgressReport


class ProgrammeDocumentSerializer(serializers.ModelSerializer):

    status = serializers.CharField(source='get_status_display')

    class Meta:
        model = ProgrammeDocument
        fields = (
            'id',
            'agreement',
            'reference_number',
            'title',
            'unicef_office',
            'unicef_focal_point',
            'partner_focal_point',
            'start_date',
            'end_date',
            'population_focus',
            'response_to_HRP',
            'status',
            'report_status',
            'due_date',
            'calculated_budget',
        )


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

    class Meta:
        model = ProgrammeDocument
        fields = (
            'id',
            'agreement',
            'document_type',
            'reference_number',
            'title',
            'unicef_office',
            'unicef_focal_point',
            'partner_focal_point',
            'response_to_HRP',
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
    submission_date = serializers.SerializerMethodField()
    due_date = serializers.SerializerMethodField()
    is_draft = serializers.SerializerMethodField()

    class Meta:
        model = ProgressReport
        fields = (
            'id',
            'programme_document',
            'status',
            'reporting_period',
            'submission_date',
            'due_date',
            'is_draft',
        )

    def get_reporting_period(self, obj):
        return "%s - %s " % (
            obj.latest_indicator_report.time_period_start.strftime(settings.PRINT_DATA_FORMAT),
            obj.latest_indicator_report.time_period_end.strftime(settings.PRINT_DATA_FORMAT)
        )

    def get_submission_date(self, obj):
        return obj.latest_indicator_report.submission_date and obj.latest_indicator_report.submission_date.strftime(settings.PRINT_DATA_FORMAT)

    def get_due_date(self, obj):
        return obj.latest_indicator_report.due_date and obj.latest_indicator_report.due_date.strftime(settings.PRINT_DATA_FORMAT)

    def get_is_draft(self, obj):
        return obj.latest_indicator_report.is_draft
