from rest_framework import serializers

from core.models import IMORole

from cluster.models import Cluster
from partner.serializers import PartnerDetailsSerializer
from .models import User


class ClusterResponsePlanSerializer(serializers.ModelSerializer):

    type = serializers.CharField(read_only=True)
    title = serializers.CharField(read_only=True,
                                  source='get_type_display')
    imported_type = serializers.CharField(read_only=True)

    class Meta:
        model = Cluster
        fields = (
            'id',
            'type',
            'title',
            'response_plan',
            'imported_type',
        )
        depth = 1


class UserSerializer(serializers.ModelSerializer):
    imo_clusters = ClusterResponsePlanSerializer(read_only=True,
                                                 many=True)
    partner = PartnerDetailsSerializer(read_only=True)
    access = serializers.SerializerMethodField()

    def get_access(self, obj):
        accesses = []
        is_imo = obj.groups.filter(name=IMORole.as_group().name).exists()

        # Cluster access check
        if is_imo or (obj.partner and obj.partner.clusters.exists()):
            accesses.append('cluster-reporting')

        # IP access check
        if obj.partner and obj.partner.programmedocument_set.exists():
            accesses.append('ip-reporting')

        return accesses

    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name',
            'last_name', 'profile',
            'groups', 'partner', 'organization',
            'workspaces', 'imo_clusters', 'access'
        )
        depth = 1
