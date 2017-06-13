from rest_framework import serializers
from core.common import FREQUENCY_LEVEL
from .models import ClusterObjective


class ClusterObjectiveSerializer(serializers.ModelSerializer):

    frequency = serializers.ChoiceField(choices=FREQUENCY_LEVEL)
    cluster_title = serializers.SerializerMethodField()

    class Meta:
        model = ClusterObjective
        fields = (
            'id',
            'title',
            'reference_number',
            'cluster',
            'cluster_title',
            'frequency',
            # 'reportables',
        )

    def get_cluster_title(self, obj):
        return obj.cluster.title


class ClusterObjectivePatchSerializer(ClusterObjectiveSerializer):

    title = serializers.CharField(required=False)
    reference_number = serializers.CharField(required=False)
    cluster = serializers.CharField(required=False)
    frequency = serializers.ChoiceField(choices=FREQUENCY_LEVEL, required=False)

    class Meta:
        model = ClusterObjective
        fields = (
            'id',
            'title',
            'reference_number',
            'cluster',
            'frequency',
        )

