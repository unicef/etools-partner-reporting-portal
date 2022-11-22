from django.contrib.auth.models import Group

from rest_framework import serializers

from etools_prp.apps.cluster.serializers import ClusterIDManagementSerializer
from etools_prp.apps.core.serializers import WorkspaceSimpleSerializer


class PRPRoleWithRelationsSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='name')
    workspace = WorkspaceSimpleSerializer()
    cluster = ClusterIDManagementSerializer()

    class Meta:
        model = Group
        fields = ('id', 'role_display', 'is_active')  # 'workspace', 'cluster',
