from cluster.serializers import ClusterIDManagementSerializer
from core.models import PRPRole
from core.serializers import WorkspaceSimpleSerializer
from rest_framework import serializers


class PRPRoleWithRelationsSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display')
    workspace = WorkspaceSimpleSerializer()
    cluster = ClusterIDManagementSerializer()

    class Meta:
        model = PRPRole
        fields = ('id', 'user', 'role', 'role_display', 'workspace', 'cluster', 'is_active')
