from rest_framework import serializers

from .models import ClusterObjective


class ClusterObjectiveSerializer(serializers.ModelSerializer):

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
