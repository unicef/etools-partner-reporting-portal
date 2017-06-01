from rest_framework import serializers

from .models import ProgrammeDocument, ProgressReport


class ProgrammeDocumentSerializer(serializers.ModelSerializer):

    status = serializers.CharField(source='get_status_display')

    class Meta:
        model = ProgrammeDocument
        fields = (
            'id',
            'agreement',
            'reference_number',
            'title',
            'start_date',
            'end_date',
            'population_focus',
            'response_to_HRP',
            'status',
            'report_status',
            'due_date',
            'calculated_budget',
        )


class ProgressReportSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProgressReport
        fields = (
            'partner_contribution_to_date',
            'funds_received_to_date',
            'challenges_in_the_reporting_period',
            'proposed_way_forward',
            'attachements',
        )
