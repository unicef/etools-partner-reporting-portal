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
        )
