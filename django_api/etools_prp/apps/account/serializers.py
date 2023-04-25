from django.db import transaction

from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied, ValidationError

from etools_prp.apps.account.validators import EmailValidator
from etools_prp.apps.cluster.models import Cluster
from etools_prp.apps.core.common import PRP_ROLE_TYPES, USER_STATUS_TYPES, USER_TYPES
from etools_prp.apps.core.models import PRPRoleOld, Realm
from etools_prp.apps.partner.serializers import PartnerDetailsSerializer, PartnerSimpleSerializer

from ..core.serializers import WorkspaceSerializer, WorkspaceSimpleSerializer
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


class PRPRoleWithRelationsSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='group.name', read_only=True)
    role_display = serializers.SerializerMethodField(read_only=True)
    # TODO REALMS TBD check with FE to remove
    workspace = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Realm
        fields = ('id', 'is_active', 'role', 'role_display', 'workspace')

    def get_role_display(self, obj):
        return PRP_ROLE_TYPES[obj.group.name]

    def get_workspace(self, obj):
        return WorkspaceSimpleSerializer(obj.workspace).data


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(validators=[EmailValidator()])
    workspace = WorkspaceSerializer(read_only=True)
    workspaces_available = WorkspaceSerializer(many=True, read_only=True)
    partner = PartnerDetailsSerializer(read_only=True)
    partners_available = PartnerSimpleSerializer(many=True, read_only=True)
    prp_roles = serializers.SerializerMethodField()
    access = serializers.SerializerMethodField()

    def get_access(self, obj):
        accesses = []
        cluster_roles = {
            PRP_ROLE_TYPES.cluster_system_admin,
            PRP_ROLE_TYPES.cluster_imo,
            PRP_ROLE_TYPES.cluster_member,
            PRP_ROLE_TYPES.cluster_coordinator,
            PRP_ROLE_TYPES.cluster_viewer
        }

        ip_roles = {
            PRP_ROLE_TYPES.ip_authorized_officer,
            PRP_ROLE_TYPES.ip_admin,
            PRP_ROLE_TYPES.ip_editor,
            PRP_ROLE_TYPES.ip_viewer
        }

        user_roles = set(obj.role_list)

        if obj.is_active:
            # Cluster access check
            if user_roles.intersection(cluster_roles):
                accesses.append('cluster-reporting')

            # IP access check
            if obj.partner and obj.partner.programmedocument_set.exists() and user_roles.intersection(ip_roles):
                accesses.append('ip-reporting')

        return accesses

    def get_prp_roles(self, obj):
        return PRPRoleWithRelationsSerializer(
            obj.realms.filter(workspace=obj.workspace, partner=obj.partner, is_active=True), many=True).data

    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name',
            'last_name', 'profile',
            'workspace', 'workspaces_available',
            'partner', 'partners_available',
            'access', 'prp_roles',
            'position'
        )
        read_only_fields = ('id', 'profile', 'partner', 'organization', 'access', 'prp_roles')
        depth = 1


class UserWithPRPRolesSerializer(serializers.ModelSerializer):
    partner = PartnerSimpleSerializer(read_only=True)
    prp_roles = PRPRoleWithRelationsSerializer(many=True, read_only=True, source='realms')
    status = serializers.SerializerMethodField(read_only=True)
    user_type = serializers.ChoiceField(choices=USER_TYPES, required=False)
    is_incomplete = serializers.SerializerMethodField(read_only=True)
    email = serializers.EmailField(validators=[EmailValidator()])

    def get_status(self, obj):
        if obj.is_active:
            if obj.last_login:
                return USER_STATUS_TYPES.active
            else:
                return USER_STATUS_TYPES.invited
        else:
            return USER_STATUS_TYPES.deactivated

    def get_is_incomplete(self, obj):
        realm_count = getattr(obj, 'realm_count', None)
        if realm_count is not None:
            return not realm_count
        return not Realm.objects.filter(user=obj, is_active=True).exists()

    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name',
            'last_name', 'partner',
            'organization', 'prp_roles',
            'position', 'last_login',
            'status', 'user_type',
            'is_incomplete',
        )

    @transaction.atomic
    def create(self, validated_data):
        portal_choice = self.context['request'].query_params.get('portal')
        user = self.context['request'].user

        user_roles = set(user.role_list)

        ip_roles_access = {PRP_ROLE_TYPES.ip_authorized_officer, PRP_ROLE_TYPES.ip_admin}
        cluster_roles_access = {PRP_ROLE_TYPES.cluster_imo, PRP_ROLE_TYPES.cluster_member,
                                PRP_ROLE_TYPES.cluster_system_admin}

        validated_data['username'] = validated_data['email']

        if portal_choice == 'IP' and user_roles.intersection(ip_roles_access):
            new_user = User.objects.create(partner_id=user.partner_id, **validated_data)
            transaction.on_commit(lambda user_l=new_user: user_l.send_email_notification_on_create(portal='IP'))
            return new_user

        if portal_choice == 'CLUSTER' and cluster_roles_access.intersection(user_roles):
            user_type = validated_data.pop('user_type')
            partner_id = self.initial_data.pop('partner', None)
            if partner_id:
                partner_id = int(partner_id)

            if user_type == USER_TYPES.partner:
                if not partner_id:
                    raise ValidationError('Partner ID is required.')

                not_cluster_member = {PRP_ROLE_TYPES.cluster_imo, PRP_ROLE_TYPES.cluster_system_admin}

                if not not_cluster_member.intersection(user_roles) and user.partner_id != partner_id:
                    raise PermissionDenied('Partner ID does not match Cluster Member Partner ID.')

                new_user = User.objects.create(partner_id=partner_id, **validated_data)
                transaction.on_commit(lambda user_l=new_user:
                                      user_l.send_email_notification_on_create(portal='CLUSTER'))
                return new_user

            if PRP_ROLE_TYPES.cluster_system_admin in user_roles and not partner_id:
                new_user = User.objects.create(**validated_data)
                transaction.on_commit(lambda user_l=new_user:
                                      user_l.send_email_notification_on_create(portal='CLUSTER'))

                if user_type == USER_TYPES.cluster_admin:
                    role = PRPRoleOld.objects.create(user=new_user, role=PRP_ROLE_TYPES.cluster_system_admin)
                    transaction.on_commit(lambda role_l=role: role_l.send_email_notification())

                return new_user

        raise PermissionDenied()
