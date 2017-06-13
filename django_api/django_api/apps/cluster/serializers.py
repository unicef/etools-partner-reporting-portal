from rest_framework import serializers
from core.common import FREQUENCY_LEVEL
from .models import ClusterObjective, ClusterActivity


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


class ClusterActivitySerializer(serializers.ModelSerializer):

    co_cluster_title = serializers.SerializerMethodField()
    co_title = serializers.SerializerMethodField()
    co_reference_number = serializers.SerializerMethodField()

    class Meta:
        model = ClusterActivity
        fields = (
            'id',
            'title',
            'co_cluster_title',
            'co_title',
            'co_reference_number',
            'frequency',
        )

    def get_co_cluster_title(self, obj):
        return obj.cluster_objective.cluster.title

    def get_co_title(self, obj):
        return obj.cluster_objective.title

    def get_co_reference_number(self, obj):
        return obj.cluster_objective.reference_number
