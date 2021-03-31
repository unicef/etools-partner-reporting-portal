from rest_framework import serializers

from etools_prp.apps.cluster.serializers import ClusterIDManagementSerializer
from etools_prp.apps.core.models import PRPRole
from etools_prp.apps.core.serializers import WorkspaceSimpleSerializer


class PRPRoleWithRelationsSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display')
    workspace = WorkspaceSimpleSerializer()
    cluster = ClusterIDManagementSerializer()

    class Meta:
        model = PRPRole
        fields = ('id', 'user', 'role', 'role_display', 'workspace', 'cluster', 'is_active')
