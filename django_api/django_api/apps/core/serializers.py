import hashlib

from rest_framework import serializers

from .models import Workspace, Location, ResponsePlan, Country


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
    title = serializers.CharField(read_only=True)

    class Meta:
        model = Location
        fields = ('id', 'title')

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

    name = serializers.CharField(source='title')

    def create(self, validated_data):

        # TODO: remove when they add workspace_code field
        validated_data['workspace_code'] = hashlib.md5(validated_data['title']).hexdigest()[:8]

        # TODO: remove when they add ID field
        validated_data['external_id'] = hashlib.md5(validated_data['title']).hexdigest()

        # Update or create
        try:
            instance = Workspace.objects.get(external_id=validated_data['external_id'])
            return self.update(instance, validated_data)
        except Workspace.DoesNotExist:
            return Workspace.objects.create(**validated_data)

    class Meta:
        model = Workspace
        fields = ('name', 'latitude', 'longitude', 'initial_zoom')