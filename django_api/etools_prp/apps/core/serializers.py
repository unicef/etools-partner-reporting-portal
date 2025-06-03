from django.db import transaction

from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.validators import UniqueTogetherValidator

from etools_prp.apps.cluster.models import Cluster
from etools_prp.apps.core.common import CLUSTER_TYPES, PRP_ROLE_TYPES, RESPONSE_PLAN_TYPE
from etools_prp.apps.core.static_data import GPD_DELIVERED_PLANNED_OPTIONS
from etools_prp.apps.utils.serializers import CurrentWorkspaceDefault

from .models import Location, PRPRoleOld, ResponsePlan, Workspace


class WorkspaceSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ('id', 'title', 'workspace_code')


class WorkspaceSerializer(serializers.ModelSerializer):

    latitude = serializers.DecimalField(max_digits=8, decimal_places=5, coerce_to_string=False)
    longitude = serializers.DecimalField(max_digits=8, decimal_places=5, coerce_to_string=False)

    class Meta:
        model = Workspace
        fields = (
            'id',
            'title',
            'workspace_code',
            'latitude',
            'longitude',
            'business_area_code',
        )


class LocationSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        return "%s [%s - %s]" % (
            obj.name,
            obj.admin_level_name,
            obj.p_code if obj.p_code else "n/a"
        )

    class Meta:
        model = Location
        fields = ('id', 'name', 'latitude', 'longitude', 'p_code', 'admin_level')


class ShortLocationSerializer(serializers.ModelSerializer):

    id = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    admin_level = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = ('id', 'name', 'admin_level')

    def get_name(self, obj):
        return "%s [%s - %s]" % (
            obj.name,
            obj.admin_level_name,
            obj.p_code if obj.p_code else "n/a"
        )

    def get_id(self, obj):
        return str(obj.id)

    def get_admin_level(self, obj):
        return obj.admin_level


class IdLocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = ('id', )


class ChildrenLocationSerializer(serializers.ModelSerializer):
    """
    Endpoint for drop down meny on PD list filterset - location.
    """
    id = serializers.SerializerMethodField()

    class Meta:
        model = Workspace
        fields = ('id', 'title')

    def get_id(self, obj):
        return str(obj.id)


class ResponsePlanSerializer(serializers.ModelSerializer):

    clusters = serializers.SerializerMethodField()
    plan_type_display = serializers.CharField(source='get_plan_type_display')

    class Meta:
        model = ResponsePlan
        fields = (
            'id',
            'title',
            'plan_type',
            'plan_type_display',
            'start',
            'end',
            'workspace',
            'documents',
            'clusters',
            'can_import_ocha_projects',
            'plan_custom_type_label',
        )

    def get_clusters(self, obj):
        # done this way to avoid circular import issue
        from etools_prp.apps.cluster.serializers import ClusterSimpleSerializer
        return ClusterSimpleSerializer(obj.clusters.all(), many=True).data


class CreateResponsePlanSerializer(serializers.ModelSerializer):

    clusters = serializers.MultipleChoiceField(choices=CLUSTER_TYPES, write_only=True)
    workspace = serializers.HiddenField(default=CurrentWorkspaceDefault())

    class Meta:
        model = ResponsePlan
        fields = (
            'workspace',
            'title',
            'start',
            'end',
            'plan_type',
            'plan_custom_type_label',
            'clusters',
        )

    def validate(self, attrs):
        validated_data = super().validate(attrs)

        if 'start' not in validated_data:
            raise serializers.ValidationError({
                'start': 'Start date is required'
            })

        if 'end' not in validated_data:
            raise serializers.ValidationError({
                'end': 'End date is required'
            })

        if validated_data['end'] < validated_data['start']:
            raise serializers.ValidationError({
                'end': 'Cannot be earlier than Start'
            })

        if validated_data['plan_type'] == RESPONSE_PLAN_TYPE.other \
                and ('plan_custom_type_label' not in validated_data or
                     validated_data['plan_custom_type_label'] == ''):
            raise serializers.ValidationError({
                'plan_custom_type_label': 'Plan custom type label is required when the type is other'
            })

        return validated_data

    @transaction.atomic
    def create(self, validated_data):
        clusters_data = validated_data.pop('clusters')
        response_plan = ResponsePlan.objects.create(**validated_data)

        for cluster in clusters_data:
            cluster_obj = Cluster.objects.create(
                type=cluster, response_plan=response_plan
            )

            if 'request' in self.context:
                user = self.context['request'].user
                if not user.is_cluster_system_admin:
                    user.old_prp_roles.create(
                        role=PRP_ROLE_TYPES.cluster_imo,
                        cluster=cluster_obj,
                        workspace=response_plan.workspace,
                    )

        return response_plan


# PMP API Serializers
class PMPWorkspaceSerializer(serializers.ModelSerializer):

    id = serializers.CharField(source='external_id')
    name = serializers.CharField(source='title')
    country_short_code = serializers.CharField(source='workspace_code')

    def create(self, validated_data):
        # Update or create
        try:
            instance = Workspace.objects.get(workspace_code=validated_data['workspace_code'])
            return self.update(instance, validated_data)
        except Workspace.DoesNotExist:
            return Workspace.objects.create(**validated_data)

    class Meta:
        model = Workspace
        fields = (
            'id',
            'name',
            'latitude',
            'longitude',
            'initial_zoom',
            'business_area_code',
            'country_short_code',
        )


class PMPLocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = ('name', 'p_code', 'admin_level_name', 'admin_level')
        validators = [
            UniqueTogetherValidator(
                queryset=Location.objects.all(),
                fields=[
                    "name",
                    "p_code",
                    "admin_level"
                ],
            )
        ]


class PRPRoleUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PRPRoleOld
        fields = ('role', 'is_active')

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        deactivated = not validated_data.get('is_active', True)
        instance.send_email_notification(deleted=deactivated)
        return instance


class PRPRoleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PRPRoleOld
        fields = ('role', 'workspace', 'cluster')


class PRPRoleCreateMultipleSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    prp_roles = PRPRoleCreateSerializer(many=True)

    @transaction.atomic
    def create(self, validated_data):
        user_id = validated_data['user_id']
        roles_created = []

        for prp_roles_data in validated_data['prp_roles']:
            new_role = PRPRoleOld.objects.create(user_id=user_id, **prp_roles_data)
            roles_created.append(new_role)
            transaction.on_commit(lambda role=new_role: role.send_email_notification())

            if prp_roles_data['role'] == PRP_ROLE_TYPES.cluster_system_admin:
                cluster_roles = (
                    PRP_ROLE_TYPES.cluster_imo,
                    PRP_ROLE_TYPES.cluster_member,
                    PRP_ROLE_TYPES.cluster_viewer,
                    PRP_ROLE_TYPES.cluster_coordinator
                )
                PRPRoleOld.objects.filter(user_id=user_id, role__in=cluster_roles).delete()
                break

        return {'user_id': user_id, 'prp_roles': roles_created}

    def validate(self, attrs):
        prp_roles = attrs['prp_roles']
        clusters, workspaces = set(), set()
        for prp_role in prp_roles:
            cluster = prp_role.get('cluster')
            workspace = prp_role.get('workspace')
            if (cluster and cluster in clusters) or (workspace and workspace in workspaces):
                raise ValidationError('User can only have one role in the same cluster or workspace.')
            clusters.add(cluster)
            workspaces.add(workspace)
        return attrs


class StaticDataSerializer(serializers.Serializer):
    gpd_delivered_planned_options = serializers.SerializerMethodField()

    def get_gpd_delivered_planned_options(self, _):
        return GPD_DELIVERED_PLANNED_OPTIONS
