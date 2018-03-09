from rest_framework import serializers

from cluster.models import Cluster
from partner.serializers import PartnerDetailsSerializer
from .models import User


class ClusterResponsePlanSerializer(serializers.ModelSerializer):

    type = serializers.CharField(read_only=True)
    title = serializers.CharField(read_only=True,
                                  source='get_type_display')

    class Meta:
        model = Cluster
        fields = (
            'id',
            'type',
            'title',
            'response_plan'
        )
        depth = 1


class UserSerializer(serializers.ModelSerializer):
    imo_clusters = ClusterResponsePlanSerializer(read_only=True,
                                                 many=True)
    partner = PartnerDetailsSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'profile',
                  'groups', 'partner', 'organization', 'workspaces',
                  'imo_clusters')
        depth = 1
