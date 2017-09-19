from rest_framework import serializers

from core.serializers import ShortLocationSerializer
from core.common import PD_STATUS, PARTNER_PROJECT_STATUS

from cluster.models import (
    Cluster,
    ClusterActivity,
    ClusterObjective,
)
from cluster.serializers import ClusterSimpleSerializer

from indicator.serializers import ClusterIndicatorForPartnerActivitySerializer

from .models import (
    Partner,
    PartnerProject,
    PartnerActivity,
)


class PartnerDetailsSerializer(serializers.ModelSerializer):

    partner_type_long = serializers.CharField(source='get_partner_type_display')
    shared_partner_long = serializers.CharField(source='get_shared_partner_display')

    class Meta:
        model = Partner
        fields = (
            # Partner Details part
            'id',
            'title',
            'short_title',
            'alternate_title',
            'vendor_number',
            'partner_type',
            'partner_type_long',
            'shared_partner_long',
            'shared_partner',
            'core_values_assessment_date',
            'address',
            'street_address',
            'city',
            'postal_code',
            'country',
            'country_code',
            'email',
            'phone_number',
            # Risk Rating part
            'last_assessment_date',
            'type_of_assessment',
            'rating'
        )


class PartnerProjectSerializer(serializers.ModelSerializer):

    id = serializers.SerializerMethodField()
    clusters = ClusterSimpleSerializer(many=True, read_only=True)
    locations = ShortLocationSerializer(many=True, read_only=True)
    partner = serializers.SerializerMethodField()
    part_response_plan = serializers.SerializerMethodField()
    frequency = serializers.SerializerMethodField()

    class Meta:
        model = PartnerProject
        fields = (
            'id',
            'title',
            'start_date',
            'end_date',
            'status',
            'description',
            'additional_information',
            'total_budget',
            'funding_source',
            'clusters',
            'locations',
            'partner',
            'part_response_plan',
            'frequency'
        )

    def get_id(self, obj):
        return str(obj.id)

    def get_frequency(self, obj):
        return obj.reportables.first().get_frequency_display()

    def get_partner(self, obj):
        return obj.partner and str(obj.partner_id)

    def get_part_response_plan(self, obj):
        first_cluster = obj.clusters.first()
        return first_cluster and first_cluster.response_plan.title or ''


class PartnerProjectPatchSerializer(serializers.ModelSerializer):

    title = serializers.CharField(required=False)
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    status = serializers.ChoiceField(choices=PD_STATUS, required=False)
    description = serializers.CharField(required=False)
    additional_information = serializers.CharField(required=False)
    total_budget = serializers.CharField(required=False)
    funding_source = serializers.CharField(required=False)
    clusters = serializers.CharField(required=False)
    locations = serializers.CharField(required=False)
    partner = serializers.CharField(required=False)

    class Meta:
        model = PartnerProject
        fields = (
            'id',
            'title',
            'start_date',
            'end_date',
            'status',
            'description',
            'additional_information',
            'total_budget',
            'funding_source',
            'clusters',
            'locations',
            'partner',
        )


class PartnerProjectSimpleSerializer(serializers.ModelSerializer):

    class Meta:
        model = PartnerProject
        fields = (
            'id',
            'title',
        )


class PartnerActivitySimpleSerializer(serializers.ModelSerializer):

    class Meta:
        model = PartnerActivity
        fields = (
            'id',
            'title',
            'project',
            'partner',
            'cluster_activity'
        )


class ClusterActivityPartnersSerializer(serializers.ModelSerializer):

    partner_projects = PartnerProjectSimpleSerializer(many=True)
    links = serializers.SerializerMethodField()
    clusters = ClusterSimpleSerializer(many=True, read_only=True)
    partner_activities = PartnerActivitySimpleSerializer(many=True, read_only=True)

    class Meta:
        model = Partner
        fields = (
            'id',
            'title',
            'email',
            'phone_number',
            'partner_projects',
            'street_address',
            'city',
            'postal_code',
            'country',
            'links',
            'clusters',
            'partner_activities',
        )

    def get_links(self, obj):
        return [
            pp.additional_information for pp in obj.partner_projects.all()
        ]


class PartnerActivityBaseCreateSerializer(serializers.Serializer):
    cluster = serializers.IntegerField()
    project = serializers.IntegerField()
    partner = serializers.IntegerField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    status = serializers.ChoiceField(choices=PARTNER_PROJECT_STATUS)

    def validate(self, data):
        try:
            data['cluster'] = Cluster.objects.get(id=data['cluster'])
        except Cluster.DoesNotExist as e:
            raise serializers.ValidationError(
                'Cluster ID {} does not exist.'.format(data['cluster']))

        try:
            data['partner'] = Partner.objects.get(id=data['partner'])
        except Partner.DoesNotExist as e:
            raise serializers.ValidationError(
                'Partner ID {} does not exist.'.format(data['partner']))

        try:
            data['project'] = PartnerProject.objects.get(id=data['project'])

            if data['project'].partner.id != self.initial_data['partner']:
                raise serializers.ValidationError(
                    'PartnerProject does not belong to Partner {}.'.format(self.initial_data['partner']))
        except PartnerProject.DoesNotExist as e:
            raise serializers.ValidationError(
                'PartnerProject ID {} does not exist.'.format(data['project']))

        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("start_date should come before end_date")

        return data


class PartnerActivityFromClusterActivitySerializer(PartnerActivityBaseCreateSerializer):
    cluster_activity = serializers.IntegerField()

    def validate(self, data):
        data = super(PartnerActivityFromClusterActivitySerializer, self).validate(data)

        try:
            data['cluster_activity'] = ClusterActivity.objects.get(id=data['cluster_activity'])

            if data['cluster_activity'].cluster_objective.cluster.id != self.initial_data['cluster']:
                raise serializers.ValidationError(
                    'ClusterActivity does not belong to Cluster {}.'.format(self.initial_data['cluster']))
        except ClusterActivity.DoesNotExist as e:
            raise serializers.ValidationError(
                'ClusterActivity ID {} does not exist.'.format(data['cluster_activity']))

        return data


class PartnerActivityFromCustomActivitySerializer(PartnerActivityBaseCreateSerializer):
    cluster_objective = serializers.IntegerField()
    title = serializers.CharField(max_length=255)

    def validate(self, data):
        data = super(PartnerActivityFromCustomActivitySerializer, self).validate(data)

        try:
            data['cluster_objective'] = ClusterObjective.objects.get(id=data['cluster_objective'])

            if data['cluster_objective'].cluster.id != self.initial_data['cluster']:
                raise serializers.ValidationError(
                    'ClusterObjective does not belong to Cluster {}.'.format(self.initial_data['cluster']))
        except ClusterObjective.DoesNotExist as e:
            raise serializers.ValidationError(
                'ClusterObjective ID {} does not exist.'.format(data['cluster_objective']))

        return data


class PartnerActivitySerializer(serializers.ModelSerializer):

    cluster = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    project = PartnerProjectSimpleSerializer()
    reportables = ClusterIndicatorForPartnerActivitySerializer(many=True)

    class Meta:
        model = PartnerActivity
        fields = (
            'id', 'title',
            'cluster', 'status',
            'project', 'cluster_activity',
            'reportables',
        )

    def get_cluster(self, obj):
        if obj.cluster_activity:
            return obj.cluster_activity.cluster_objective.cluster.title
        else:
            return None

    def get_status(self, obj):
        return obj.project and obj.project.status
