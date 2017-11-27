import hashlib

from rest_framework import serializers

from .models import Workspace, Location, ResponsePlan, Country, GatewayType


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ('name', 'country_short_code', 'long_name')


class WorkspaceSerializer(serializers.ModelSerializer):

    countries = CountrySerializer(many=True)

    class Meta:
        model = Workspace
        fields = ('id', 'title', 'workspace_code', 'countries',
                  'business_area_code')


class LocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = ('id', 'title', 'latitude', 'longitude', 'p_code')


class ShortLocationSerializer(serializers.ModelSerializer):

    id = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = ('id', 'title')

    def get_title(self, obj):
        return "%s [%s, Lvl: %s]" % (obj.title, obj.p_code if obj.p_code else "n/a", obj.gateway.admin_level)

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
            'clusters'
        )

    def get_clusters(self, obj):
        from cluster.serializers import ClusterSimpleSerializer
        return ClusterSimpleSerializer(obj.clusters.all(), many=True).data


# PMP API Serializers

class PMPWorkspaceSerializer(serializers.ModelSerializer):

    id = serializers.CharField(source='external_id')
    name = serializers.CharField(source='title')
    country_short_code = serializers.CharField(source='workspace_code')

    def create(self, validated_data):
        # Update or create
        try:
            instance = Workspace.objects.get(
                workspace_code=validated_data['workspace_code'])
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
            'country_short_code')


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
