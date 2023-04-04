from rest_framework import serializers

from etools_prp.apps.core.common import PRP_ROLE_TYPES
from etools_prp.apps.core.models import Realm
from etools_prp.apps.core.serializers import WorkspaceSimpleSerializer


class PRPRoleWithRelationsSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='group.name', read_only=True)
    role_display = serializers.SerializerMethodField(read_only=True)
    workspace = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Realm
        fields = ('id', 'is_active', 'role', 'role_display', 'workspace')

    def get_role_display(self, obj):
        return PRP_ROLE_TYPES[obj.group.name]

    def get_workspace(self, obj):
        return WorkspaceSimpleSerializer(obj.workspace).data
