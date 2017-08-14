from rest_framework import serializers

from cluster.serializers import ClusterSimpleSerializer
from core.serializers import ShortLocationSerializer
from core.common import PD_STATUS
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
        )

    def get_id(self, obj):
        return str(obj.id)

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


class ClusterActivityPartnersSerializer(serializers.ModelSerializer):

    partner_projects = PartnerProjectSimpleSerializer(many=True)
    links = serializers.SerializerMethodField()
    clusters = ClusterSimpleSerializer(many=True, read_only=True)

    class Meta:
        model = Partner
        fields = (
            'id',
            'title',
            # 'focial point',
            'email',
            'phone_number',
            'partner_projects',
            'street_address',
            'city',
            'postal_code',
            'country',
            'links',
            'clusters',
        )

    def get_links(self, obj):
        return [
            pp.additional_information for pp in obj.partner_projects.all()
        ]


class PartnerActivitySerializer(serializers.ModelSerializer):

    cluster = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    project = PartnerProjectSimpleSerializer()

    class Meta:
        model = PartnerActivity
        fields = ('id', 'cluster', 'status', 'project', 'cluster_activity')

    def get_cluster(self, obj):
        if obj.cluster_activity:
            return obj.cluster_activity.cluster_objective.cluster.title
        else:
            return None

    def get_status(self, obj):
        return obj.project and obj.project.status
