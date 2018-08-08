from rest_framework import serializers

from core.common import PRP_ROLE_TYPES, USER_STATUS_TYPES, USER_TYPES

from cluster.models import Cluster
from id_management.serializers import PRPRoleWithRelationsSerializer
from partner.serializers import PartnerDetailsSerializer, PartnerSimpleSerializer
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
    partner = PartnerDetailsSerializer(read_only=True)
    access = serializers.SerializerMethodField()

    def get_access(self, obj):
        accesses = []
        is_imo = obj.prp_roles.filter(role=PRP_ROLE_TYPES.cluster_imo).exists()

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
            'partner', 'organization',
            'access', 'prp_roles',
            'position'
        )
        read_only_fields = ('id', 'profile', 'partner', 'organization', 'access', 'prp_roles')
        depth = 1


class UserWithPRPRolesSerializer(serializers.ModelSerializer):
    partner = PartnerSimpleSerializer(read_only=True)
    prp_roles = PRPRoleWithRelationsSerializer(many=True, read_only=True)
    status = serializers.SerializerMethodField(read_only=True)
    user_type = serializers.ChoiceField(choices=USER_TYPES)

    def get_status(self, obj):
        if obj.is_active:
            if obj.last_login:
                return USER_STATUS_TYPES.active
            else:
                return USER_STATUS_TYPES.invited
        else:
            return USER_STATUS_TYPES.deactivated

    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name',
            'last_name', 'partner',
            'organization', 'prp_roles',
            'position', 'last_login',
            'status', 'user_type',
        )
