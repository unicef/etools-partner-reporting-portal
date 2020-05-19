from django.db import transaction

from cluster.models import Cluster
from core.common import PRP_ROLE_TYPES, USER_STATUS_TYPES, USER_TYPES
from core.models import PRPRole
from id_management.serializers import PRPRoleWithRelationsSerializer
from partner.serializers import PartnerDetailsSerializer, PartnerSimpleSerializer
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied, ValidationError

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
    prp_roles = PRPRoleWithRelationsSerializer(many=True, read_only=True)
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
    user_type = serializers.ChoiceField(choices=USER_TYPES, required=False)
    is_incomplete = serializers.SerializerMethodField(read_only=True)

    def get_status(self, obj):
        if obj.is_active:
            if obj.last_login:
                return USER_STATUS_TYPES.active
            else:
                return USER_STATUS_TYPES.invited
        else:
            return USER_STATUS_TYPES.deactivated

    def get_is_incomplete(self, obj):
        role_count = getattr(obj, 'role_count', None)
        if role_count is not None:
            return not role_count
        return not PRPRole.objects.filter(user=obj).exists()

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
                    role = PRPRole.objects.create(user=new_user, role=PRP_ROLE_TYPES.cluster_system_admin)
                    transaction.on_commit(lambda role_l=role: role_l.send_email_notification())

                return new_user

        raise PermissionDenied()
