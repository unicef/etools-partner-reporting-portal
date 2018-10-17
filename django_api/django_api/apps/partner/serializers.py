from django.db import transaction
from rest_framework import serializers

from core.serializers import ShortLocationSerializer
from core.common import PARTNER_PROJECT_STATUS, PARTNER_TYPE, CSO_TYPES

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

from indicator.models import create_pa_reportables_from_ca
from indicator.serializers import ClusterIndicatorForPartnerActivitySerializer

from .models import (
    Partner,
    PartnerProject,
    PartnerActivity,
    PartnerProjectFunding)


class PartnerProjectSimpleSerializer(serializers.ModelSerializer):

    class Meta:
        model = PartnerProject
        fields = (
            'id',
            'title',
        )


class PartnerSimpleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Partner
        fields = (
            'id',
            'title',
            'ocha_external_id'
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


class PartnerDetailsSerializer(serializers.ModelSerializer):

    partner_type_long = serializers.CharField(source='get_partner_type_display')
    shared_partner_long = serializers.CharField(source='get_shared_partner_display')
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
            'clusters',
            # Risk Rating part
            'last_assessment_date',
            'rating',
            'basis_for_risk_rating',
            'ocha_external_id'
        )

    def get_partner_type_display(self, obj):
        return obj.get_partner_type_display()

    def get_cso_type_display(self, obj):
        return obj.get_cso_type_display()

    def get_shared_partner_display(self, obj):
        return obj.get_shared_partner_display()


class PartnerSimpleIDManagementSerializer(serializers.ModelSerializer):
    partner_type_display = serializers.CharField(source='get_partner_type_display', read_only=True)
    clusters = ClusterSimpleSerializer(many=True, read_only=True)

    class Meta:
        model = Partner
        fields = (
            'id',
            'title',
            'partner_type_display',
            'clusters',
        )


class PartnerIDManagementSerializer(serializers.ModelSerializer):
    partner_type_display = serializers.CharField(source='get_partner_type_display', read_only=True)
    clusters = ClusterSimpleSerializer(many=True, read_only=True)

    class Meta:
        model = Partner
        fields = (
            'id',
            'ocha_external_id',
            'external_id',
            'external_source',
            'title',
            'short_title',
            'alternate_title',
            'shared_partner',
            'partner_type',
            'partner_type_display',
            'cso_type',
            'email',
            'phone_number',
            'street_address',
            'city',
            'postal_code',
            'country_code',
            'total_ct_cp',
            'total_ct_cy',
            'vendor_number',
            'alternate_id',
            'rating',
            # 'type_of_assessment',
            'basis_for_risk_rating',
            'clusters',
        )
        extra_kwargs = {'vendor_number': {'required': False, 'default': None}}

    @transaction.atomic
    def create(self, validated_data):
        cluster_ids = self.initial_data.pop('clusters', [])
        if not cluster_ids and not isinstance(cluster_ids, list):
            raise serializers.ValidationError({
                'clusters': 'This should be a list and cannot be empty.'
            })
        partner = super().create(validated_data)
        partner.clusters.add(*cluster_ids)
        return partner

    @transaction.atomic
    def update(self, instance, validated_data):
        cluster_ids = self.initial_data.pop('clusters', [])
        if not cluster_ids and not isinstance(cluster_ids, list):
            raise serializers.ValidationError({
                'clusters': 'This should be a list and cannot be empty.'
            })
        partner = super().update(instance, validated_data)
        partner.clusters.set(cluster_ids)
        return partner


class PartnerProjectFundingSerializer(serializers.ModelSerializer):

    class Meta:
        model = PartnerProjectFunding
        fields = (
            'project_id',
            'id',
            'required_funding',
            'internal_funding',
            'cerf_funding',
            'cbpf_funding',
            'bilateral_funding',
            'unicef_funding',
            'wfp_funding',
            'funding_gap',
        )
        read_only_fields = (
            'project_id',
            'id',
        )


class PartnerProjectCustomFieldSerializer(serializers.Serializer):
    name = serializers.CharField()
    value = serializers.CharField()


class PartnerProjectSerializer(serializers.ModelSerializer):

    id = serializers.CharField(read_only=True)
    clusters = ClusterSimpleSerializer(many=True, read_only=True)
    locations = ShortLocationSerializer(many=True, read_only=True, required=False)
    partner = serializers.CharField(required=False, read_only=True)
    partner_id = serializers.IntegerField(required=False)
    response_plan_title = serializers.SerializerMethodField()
    total_budget = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    description = serializers.CharField(required=False)
    additional_information = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    funding = PartnerProjectFundingSerializer(read_only=True)
    additional_partners = PartnerSimpleSerializer(many=True, allow_null=True, read_only=True)
    custom_fields = PartnerProjectCustomFieldSerializer(many=True, allow_null=True, required=False)

    class Meta:
        model = PartnerProject
        fields = (
            'id',
            'code',
            'type',
            'prioritization',
            'agency_name',
            'agency_type',
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
            'partner_id',
            'response_plan_title',
            'funding',
            'additional_partners',
            'custom_fields',
            'is_ocha_imported',
        )

    def get_response_plan_title(self, obj):
        first_cluster = obj.clusters.first()
        return first_cluster and first_cluster.response_plan.title or ''

    def validate(self, attrs):
        validated_data = super(PartnerProjectSerializer, self).validate(attrs)
        start_date = validated_data.get('start_date', getattr(self.instance, 'start_date', None))
        end_date = validated_data.get('end_date', getattr(self.instance, 'start_date', None))

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({
                'end_date': 'Cannot be earlier than Start Date'
            })

        if validated_data.get('custom_fields'):
            field_names = [cf['name'] for cf in validated_data['custom_fields']]
            if not len(field_names) == len(set(field_names)):
                raise serializers.ValidationError({
                    'custom_fields': 'Custom Field Names should be unique'
                })

        return validated_data

    def save_funding(self, instance=None):
        funding_data = self.initial_data.get('funding', None)
        if funding_data:
            funding_instance = (instance or self.instance).funding
            serializer = PartnerProjectFundingSerializer(
                instance=funding_instance,
                data=funding_data
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()

    @transaction.atomic
    def create(self, validated_data):
        clusters = self.initial_data.pop('clusters', [])
        if not clusters:
            raise serializers.ValidationError({
                'clusters': 'This list cannot be empty'
            })

        custom_fields = validated_data.pop('custom_fields', None)

        project = super(PartnerProjectSerializer, self).create(validated_data)

        if custom_fields is not None:
            project.custom_fields = custom_fields
            project.save()

        project.clusters.add(*Cluster.objects.filter(id__in=[c['id'] for c in clusters]))

        self.save_funding(instance=project)
        return project

    @transaction.atomic
    def update(self, instance, validated_data):
        clusters = self.initial_data.get('clusters')
        if clusters is not None and not clusters:
            raise serializers.ValidationError({
                'clusters': 'This list cannot be empty'
            })

        custom_fields = validated_data.pop('custom_fields', None)

        project = super(PartnerProjectSerializer, self).update(instance, validated_data)

        if custom_fields is not None:
            project.custom_fields = custom_fields
            project.save()

        if clusters:
            cluster_ids = [c['id'] for c in clusters]
            project.clusters.clear()
            project.clusters.add(*Cluster.objects.filter(id__in=cluster_ids))

        self.save_funding(instance=instance)

        return project


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
    id = serializers.IntegerField(read_only=True)
    cluster = serializers.IntegerField(write_only=True)
    project = serializers.IntegerField(write_only=True)
    partner = serializers.IntegerField(write_only=True)
    start_date = serializers.DateField(write_only=True)
    end_date = serializers.DateField(write_only=True)
    status = serializers.ChoiceField(choices=PARTNER_PROJECT_STATUS, write_only=True)

    def validate(self, data):
        cluster = Cluster.objects.filter(id=data['cluster']).first()
        if not cluster:
            raise serializers.ValidationError({
                'cluster': 'Cluster ID {} does not exist.'.format(data['cluster'])
            })

        partner = Partner.objects.filter(id=data['partner']).first()
        if not partner:
            raise serializers.ValidationError({
                'partner': 'Partner ID {} does not exist.'.format(data['partner'])
            })

        if partner not in cluster.partners.all():
            raise serializers.ValidationError({
                'partner': 'Partner does not belong to Cluster {}.'.format(data['cluster'])
            })

        project = PartnerProject.objects.filter(id=data['project']).first()
        if not project:
            raise serializers.ValidationError({
                'project': 'PartnerProject ID {} does not exist.'.format(data['project'])
            })
        elif not project.partner_id == partner.id:
            raise serializers.ValidationError({
                'partner': 'PartnerProject does not belong to Partner {}.'.format(self.initial_data['partner'])
            })

        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError({
                "start_date": "start_date should come before end_date",
            })

        data['cluster'] = cluster
        data['partner'] = partner
        data['project'] = project

        if data['project'].start_date > data['start_date']:
            raise serializers.ValidationError({
                "start_date": "start_date cannot start before its project's start date",
            })

        if data['project'].end_date < data['end_date']:
            raise serializers.ValidationError({
                "end_date": "end_date cannot end after its project's end date",
            })

        return data


class PartnerActivityFromClusterActivitySerializer(PartnerActivityBaseCreateSerializer):
    cluster_activity = serializers.IntegerField(write_only=True)

    def validate(self, data):
        data = super(PartnerActivityFromClusterActivitySerializer, self).validate(data)
        cluster_activity = ClusterActivity.objects.filter(id=data['cluster_activity']).first()
        if not cluster_activity:
            raise serializers.ValidationError({
                'cluster_activity': 'ClusterActivity ID {} does not exist.'.format(data['cluster_activity'])
            })
        elif not cluster_activity.cluster_objective.cluster_id == data['cluster'].id:
            raise serializers.ValidationError({
                'cluster_activity': 'ClusterActivity does not belong to Cluster {}.'.format(
                    self.initial_data['cluster']
                )
            })
        elif PartnerActivity.objects.filter(
            partner=data['partner'], cluster_activity=cluster_activity
        ).exists():
            raise serializers.ValidationError({
                'cluster_activity': 'Please note that below activity has already been adopted.',
            })

        data['cluster_activity'] = cluster_activity
        return data

    def create(self, validated_data):
        # TODO: Create reportables in the db, cloning this cluster activities indicators?
        try:
            partner_activity = PartnerActivity.objects.create(
                title=validated_data['cluster_activity'].title,
                project=validated_data['project'],
                partner=validated_data['partner'],
                cluster_activity=validated_data['cluster_activity'],
                start_date=validated_data['start_date'],
                end_date=validated_data['end_date'],
                status=validated_data['status'],
            )
        except Exception as e:
            raise serializers.ValidationError(e.message)

        # Grab Cluster Activity instance from this newly created Partner Activity instance
        cluster_activity = validated_data['cluster_activity']

        create_pa_reportables_from_ca(partner_activity, cluster_activity)

        return partner_activity


class PartnerActivityFromCustomActivitySerializer(PartnerActivityBaseCreateSerializer):
    cluster_objective = serializers.IntegerField(write_only=True)
    title = serializers.CharField(max_length=255, write_only=True)

    def validate(self, data):
        data = super(PartnerActivityFromCustomActivitySerializer, self).validate(data)
        cluster_objective = ClusterObjective.objects.filter(id=data['cluster_objective']).first()

        if not cluster_objective:
            raise serializers.ValidationError({
                'cluster_objective': 'ClusterObjective ID {} does not exist.'.format(data['cluster_objective'])
            })
        elif not cluster_objective.cluster_id == data['cluster'].id:
            raise serializers.ValidationError({
                'cluster_objective': 'ClusterObjective does not belong to Cluster {}.'.format(
                    self.initial_data['cluster']
                )
            })

        if data['project'].partner != data['partner']:
            return serializers.ValidationError({
                "project": "Project does not belong to Partner {}".format(data['partner']),
            })

        data['cluster_objective'] = cluster_objective

        return data

    def create(self, validated_data):
        try:
            partner_activity = PartnerActivity.objects.create(
                title=validated_data['title'],
                project=validated_data['project'],
                partner=validated_data['partner'],
                cluster_objective=validated_data['cluster_objective'],
                start_date=validated_data['start_date'],
                end_date=validated_data['end_date'],
                status=validated_data['status'],
            )
        except Exception as e:
            raise serializers.ValidationError(e.message)
        return partner_activity


class PartnerActivitySerializer(serializers.ModelSerializer):

    cluster = serializers.SerializerMethodField()
    project = PartnerProjectSimpleSerializer()
    reportables = ClusterIndicatorForPartnerActivitySerializer(many=True)
    cluster_activity = ClusterActivitySerializer()
    partner = PartnerDetailsSerializer()
    cluster_objective = serializers.SerializerMethodField()
    is_custom = serializers.BooleanField()

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
            return {
                "id": obj.cluster_activity.cluster_objective.cluster.id,
                "name": obj.cluster_activity.cluster_objective.cluster.title,
            }
        elif obj.cluster_objective:
            return {
                "id": obj.cluster_objective.cluster.id,
                "name": obj.cluster_objective.cluster.title,
            }
        else:
            return None

    def get_cluster_objective(self, obj):
        if obj.cluster_activity:
            return ClusterObjectiveSerializer(instance=obj.cluster_activity.cluster_objective).data
        elif obj.cluster_objective:
            return ClusterObjectiveSerializer(instance=obj.cluster_objective).data
        else:
            return None


class PartnerActivityUpdateSerializer(serializers.ModelSerializer):

    project = serializers.IntegerField(write_only=True)

    class Meta:
        model = PartnerActivity
        fields = (
            'title',
            'status',
            'project',
            'start_date',
            'end_date',
        )

    def __init__(self, instance, *args, **kwargs):
        if not instance.is_custom:
            self.fields.pop('title')
        super(PartnerActivityUpdateSerializer, self).__init__(instance, *args, **kwargs)

    def get_extra_kwargs(self):
        # Treat all fields except ID as write_only
        return {
            f: {'write_only': f != 'id'} for f in self.Meta.fields
        }

    def validate(self, data):
        project_id = data.pop('project', None)
        project = PartnerProject.objects.filter(id=project_id).first()
        if not project:
            raise serializers.ValidationError({
                'project': 'PartnerProject ID {} does not exist.'.format(data['project'])
            })
        elif not project.partner_id == self.instance.partner.id:
            raise serializers.ValidationError({
                'partner': 'PartnerProject does not belong to Partner {}.'.format(self.initial_data['partner'])
            })
        return super(PartnerActivityUpdateSerializer, self).validate(data)

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.project = validated_data.get('project', instance.project)
        instance.start_date = validated_data.get('start_date', instance.start_date)
        instance.end_date = validated_data.get('end_date', instance.end_date)
        instance.status = validated_data.get('status', instance.status)
        instance.save()

        return instance


class PMPPartnerSerializer(serializers.ModelSerializer):

    id = serializers.CharField(source='external_id')
    name = serializers.CharField(source='title', allow_blank=True)
    short_name = serializers.CharField(source='short_title', allow_blank=True)
    alternate_name = serializers.CharField(source='alternate_title', allow_blank=True, allow_null=True)
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
    address = serializers.CharField(source='street_address', allow_blank=True, allow_null=True)
    basis_for_risk_rating = serializers.CharField(allow_blank=True, allow_null=True)
    unicef_vendor_number = serializers.CharField(source="vendor_number")

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
            vendor_number=validated_data['vendor_number']).update(**validated_data)

    def create(self, validated_data):
        validated_data = self.fix_choices(validated_data)
        return Partner.objects.create(**validated_data)

    class Meta:
        model = Partner
        fields = (
            "id",
            "unicef_vendor_number",
            "name",
            "short_name",
            "alternate_name",
            "partner_type",
            "cso_type",
            "rating",
            "shared_partner",
            "email",
            "phone_number",
            "country_code",
            "total_ct_cp",
            "total_ct_cy",
            "address",
            "city",
            "basis_for_risk_rating",
            "last_assessment_date",
            "core_values_assessment_date"
        )
