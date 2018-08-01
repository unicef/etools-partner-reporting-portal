from django.db import transaction
from rest_framework import serializers

from cluster.models import Cluster
from core.common import PRP_ROLE_TYPES, CLUSTER_TYPES
from utils.serializers import CurrentWorkspaceDefault
from .models import Workspace, Location, ResponsePlan, Country, GatewayType, PRPRole


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ('name', 'country_short_code', 'long_name')


class WorkspaceSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ('id', 'title')


class WorkspaceSerializer(serializers.ModelSerializer):

    countries = CountrySerializer(many=True)

    class Meta:
        model = Workspace
        fields = (
            'id',
            'title',
            'workspace_code',
            'countries',
            'business_area_code',
            'can_import_ocha_response_plans',
        )


class LocationSerializer(serializers.ModelSerializer):
    admin_level = serializers.CharField(source="gateway.admin_level")

    class Meta:
        model = Location
        fields = ('id', 'title', 'latitude', 'longitude', 'p_code', 'admin_level')


class ShortLocationSerializer(serializers.ModelSerializer):

    id = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = ('id', 'title')

    def get_title(self, obj):
        return "%s [%s - %s]" % (obj.title, obj.gateway.name, obj.p_code if obj.p_code else "n/a")

    def get_id(self, obj):
        return str(obj.id)


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
        )

    def get_clusters(self, obj):
        # done this way to avoid circular import issue
        from cluster.serializers import ClusterSimpleSerializer
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
            'clusters',
        )

    def validate(self, attrs):
        validated_data = super(CreateResponsePlanSerializer, self).validate(attrs)
        if validated_data['end'] < validated_data['start']:
            raise serializers.ValidationError({
                'end': 'Cannot be earlier than Start'
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
                self.context['request'].user.prp_roles.create(
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


class PMPGatewayTypeSerializer(serializers.ModelSerializer):
    gateway_country = serializers.PrimaryKeyRelatedField(
        queryset=Country.objects.all(), source="country")
    pcode = serializers.CharField(source='name')

    class Meta:
        model = GatewayType
        fields = ('pcode', 'admin_level', 'gateway_country')


class PMPLocationSerializer(serializers.ModelSerializer):
    pcode = serializers.CharField(source='p_code')
    name = serializers.CharField(source='title')
    gateway = serializers.PrimaryKeyRelatedField(
        queryset=GatewayType.objects.all())

    class Meta:
        model = Location
        fields = ('name', 'pcode', 'gateway')


class PRPRoleUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PRPRole
        fields = ('role',)


class PRPRoleCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PRPRole
        fields = ('user', 'role', 'workspace', 'cluster')
