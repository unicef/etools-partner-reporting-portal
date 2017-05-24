from rest_framework import serializers

from .models import ProgrammeDocument


class ProgrammeDocumentSerializer(serializers.ModelSerializer):

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


class ProgrammeDocumentDetailSerializer(serializers.ModelSerializer):

    document_type = serializers.CharField(source='get_document_type_display')

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
        )
