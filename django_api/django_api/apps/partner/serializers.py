from rest_framework import serializers

from core.serializers import ShortLocationSerializer
from core.common import PD_STATUS, PARTNER_PROJECT_STATUS, PARTNER_TYPE, CSO_TYPES

from cluster.models import (
    Cluster,
    ClusterActivity,
    ClusterObjective,
)
from cluster.serializers import (
    ClusterSimpleSerializer,
    ClusterActivitySerializer,
    ClusterObjectiveSerializer
)

from indicator.serializers import ClusterIndicatorForPartnerActivitySerializer

from .models import (
    Partner,
    PartnerProject,
    PartnerActivity,
)


class PartnerDetailsSerializer(serializers.ModelSerializer):

    partner_type_long = serializers.CharField(
        source='get_partner_type_display')
    shared_partner_long = serializers.CharField(
        source='get_shared_partner_display')
    partner_type_display = serializers.SerializerMethodField()
    cso_type_display = serializers.SerializerMethodField()
    shared_partner_display = serializers.SerializerMethodField()

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
            'partner_type_display',
            'cso_type',
            'cso_type_display',
            'partner_type_long',
            'shared_partner_long',
            'shared_partner',
            'shared_partner_display',
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

    def get_partner_type_display(self, obj):
        return obj.get_partner_type_display()

    def get_cso_type_display(self, obj):
        return obj.get_cso_type_display()

    def get_shared_partner_display(self, obj):
        return obj.get_shared_partner_display()


class PartnerProjectSerializer(serializers.ModelSerializer):

    id = serializers.SerializerMethodField()
    clusters = ClusterSimpleSerializer(many=True, read_only=True)
    locations = ShortLocationSerializer(many=True, read_only=True, required=False)
    partner = serializers.CharField()
    part_response_plan = serializers.SerializerMethodField()
    total_budget = serializers.CharField(required=False)
    funding_source = serializers.CharField(required=False)
    description = serializers.CharField(required=False)
    additional_information = serializers.CharField(required=False)

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

    def get_part_response_plan(self, obj):
        first_cluster = obj.clusters.first()
        return first_cluster and first_cluster.response_plan.title or ''


class PartnerProjectPatchSerializer(serializers.ModelSerializer):

    title = serializers.CharField(required=False)
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    description = serializers.CharField(required=False)
    additional_information = serializers.CharField(required=False)
    total_budget = serializers.CharField(required=False)
    funding_source = serializers.CharField(required=False)
    clusters = ClusterSimpleSerializer(many=True, read_only=True)
    locations = ShortLocationSerializer(many=True, read_only=True, required=False)

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
    partner_activities = PartnerActivitySimpleSerializer(
        many=True, read_only=True)

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
            raise serializers.ValidationError(
                "start_date should come before end_date")

        return data


class PartnerActivityFromClusterActivitySerializer(
        PartnerActivityBaseCreateSerializer):
    cluster_activity = serializers.IntegerField()

    def validate(self, data):
        data = super(
            PartnerActivityFromClusterActivitySerializer,
            self).validate(data)

        try:
            data['cluster_activity'] = ClusterActivity.objects.get(
                id=data['cluster_activity'])

            if data['cluster_activity'].cluster_objective.cluster.id != self.initial_data['cluster']:
                raise serializers.ValidationError(
                    'ClusterActivity does not belong to Cluster {}.'.format(self.initial_data['cluster']))
        except ClusterActivity.DoesNotExist as e:
            raise serializers.ValidationError(
                'ClusterActivity ID {} does not exist.'.format(data['cluster_activity']))

        return data


class PartnerActivityFromCustomActivitySerializer(
        PartnerActivityBaseCreateSerializer):
    cluster_objective = serializers.IntegerField()
    title = serializers.CharField(max_length=255)

    def validate(self, data):
        data = super(
            PartnerActivityFromCustomActivitySerializer,
            self).validate(data)

        try:
            data['cluster_objective'] = ClusterObjective.objects.get(
                id=data['cluster_objective'])

            if data['cluster_objective'].cluster.id != self.initial_data['cluster']:
                raise serializers.ValidationError(
                    'ClusterObjective does not belong to Cluster {}.'.format(self.initial_data['cluster']))
        except ClusterObjective.DoesNotExist as e:
            raise serializers.ValidationError(
                'ClusterObjective ID {} does not exist.'.format(data['cluster_objective']))

        return data


class PartnerActivitySerializer(serializers.ModelSerializer):

    cluster = serializers.SerializerMethodField()
    project = PartnerProjectSimpleSerializer()
    reportables = ClusterIndicatorForPartnerActivitySerializer(many=True)
    cluster_activity = ClusterActivitySerializer()
    partner = PartnerDetailsSerializer()
    cluster_objective = serializers.SerializerMethodField()
    is_custom = serializers.SerializerMethodField()

    class Meta:
        model = PartnerActivity
        fields = (
            'id',
            'title',
            'partner',
            'cluster',
            'status',
            'project',
            'cluster_activity',
            'cluster_objective',
            'reportables',
            'start_date',
            'end_date',
            'is_custom',
        )

    def get_cluster(self, obj):
        if obj.cluster_activity:
            return obj.cluster_activity.cluster_objective.cluster.get_type_display()
        elif obj.cluster_objective:
            return obj.cluster_objective.cluster.get_type_display()
        else:
            return None

    def get_cluster_objective(self, obj):
        if obj.cluster_activity:
            return ClusterObjectiveSerializer(instance=obj.cluster_activity.cluster_objective).data
        elif obj.cluster_objective:
            return ClusterObjectiveSerializer(instance=obj.cluster_objective).data
        else:
            return None

    def get_is_custom(self, obj):
        return obj.cluster_activity is None


class PMPPartnerSerializer(serializers.ModelSerializer):

    id = serializers.CharField(source='external_id')
    name = serializers.CharField(source='title', allow_blank=True)
    short_name = serializers.CharField(source='short_title', allow_blank=True)
    partner_type = serializers.ChoiceField(
        choices=[
            (x[1],
             x[0]) for x in PARTNER_TYPE],
        allow_blank=True,
        allow_null=True)
    cso_type = serializers.ChoiceField(
        choices=[
            (x[1],
             x[0]) for x in CSO_TYPES],
        allow_blank=True,
        allow_null=True)

    def fix_choices(self, validated_data):
        for pt in [(x[1], x[0]) for x in PARTNER_TYPE]:
            if pt[0] == validated_data['partner_type']:
                validated_data['partner_type'] = pt[1]
        for ct in [(x[1], x[0]) for x in CSO_TYPES]:
            if ct[0] == validated_data['cso_type']:
                validated_data['cso_type'] = ct[1]
        return validated_data

    def update(self, instance, validated_data):
        validated_data = self.fix_choices(validated_data)
        return Partner.objects.filter(
            external_id=validated_data['external_id']).update(**validated_data)

    def create(self, validated_data):
        validated_data = self.fix_choices(validated_data)
        return Partner.objects.create(**validated_data)

    class Meta:
        model = Partner
        fields = (
            "id",
            "vendor_number",
            "name",
            "short_name",
            "partner_type",
            "cso_type",
            "rating",
            "shared_partner",
            "email",
            "phone_number",
            "total_ct_cp",
            "total_ct_cy",
        )
