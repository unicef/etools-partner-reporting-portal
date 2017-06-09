from rest_framework import serializers

from .models import ClusterObjective


class ClusterObjectiveSerializer(serializers.ModelSerializer):

    frequency = serializers.CharField(source='get_frequency_display')

    class Meta:
        model = ClusterObjective
        fields = (
            'id',
            'title',
            'reference_number',
            'cluster',
            'frequency',
            # 'reportables',
        )
