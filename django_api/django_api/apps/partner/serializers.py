from django.db import transaction
from rest_framework import serializers

from core.serializers import ShortLocationSerializer
from core.common import PARTNER_TYPE, CSO_TYPES, PARTNER_ACTIVITY_STATUS
from core.models import Location

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
    PartnerProjectFunding,
    PartnerActivityProjectContext
)


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


class PartnerActivityProjectContextSerializer(serializers.ModelSerializer):
    project_id = serializers.IntegerField(source="id")
    project_name = serializers.SerializerMethodField()
    activity_name = serializers.SerializerMethodField()
    cluster_objective_name = serializers.SerializerMethodField()
    context_id = serializers.IntegerField(source="id", read_only=True)
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    status = serializers.ChoiceField(choices=PARTNER_ACTIVITY_STATUS)

    class Meta:
        model = PartnerActivityProjectContext
        fields = (
            'project_id',
            'context_id',
            'project_name',
            'activity_name',
            'cluster_objective_name',
            'start_date',
            'end_date',
            'status',
        )

    def get_project_name(self, obj):
        return obj.project.title

    def get_activity_name(self, obj):
        return obj.activity.title

    def get_cluster_objective_name(self, obj):
        return obj.activity.cluster_objective.title if obj.activity.cluster_objective else obj.activity.cluster_activity.cluster_objective.title


class PartnerActivityProjectContextDetailUpdateSerializer(PartnerActivityProjectContextSerializer):
    project_id = serializers.IntegerField(source="project.id")


class PartnerActivitySimpleSerializer(serializers.ModelSerializer):
    projects = PartnerActivityProjectContextSerializer(many=True)

    class Meta:
        model = PartnerActivity
        fields = (
            'id',
            'title',
            'projects',
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
        locations = self.initial_data.get('locations', list())

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

        if locations and Location.objects.filter(id__in=[l['id'] for l in locations]) \
                .values_list('gateway__admin_level', flat=True) \
                .distinct().count() != 1:
            raise serializers.ValidationError({
                'locations': 'All locations need to have same admin level'
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

        first_cluster = project.clusters.first()

        if validated_data['start_date'] < first_cluster.response_plan.start:
            raise serializers.ValidationError({
                'start_date': "Project start date cannot be earlier than the response plan's start date"
            })

        if validated_data['start_date'] > first_cluster.response_plan.end:
            raise serializers.ValidationError({
                'start_date': "Project start date cannot be later than the response plan's end date"
            })

        if validated_data['end_date'] < first_cluster.response_plan.start:
            raise serializers.ValidationError({
                'end_date': "Project end date cannot be earlier than the response plan's start date"
            })

        if validated_data['end_date'] > first_cluster.response_plan.end:
            raise serializers.ValidationError({
                'end_date': "Project end date cannot be later than the response plan's end date"
            })

        locations = self.initial_data.get('locations')

        if locations:
            project.locations.add(*Location.objects.filter(id__in=[l['id'] for l in locations]))

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

        first_cluster = project.clusters.first()

        if 'start_date' in validated_data and validated_data['start_date'] < first_cluster.response_plan.start:
            raise serializers.ValidationError({
                'start_date': "Project start date cannot be earlier than the response plan's start date"
            })

        if 'start_date' in validated_data and validated_data['start_date'] > first_cluster.response_plan.end:
            raise serializers.ValidationError({
                'start_date': "Project start date cannot be later than the response plan's end date"
            })

        if 'end_date' in validated_data and validated_data['end_date'] < first_cluster.response_plan.start:
            raise serializers.ValidationError({
                'end_date': "Project end date cannot be earlier than the response plan's start date"
            })

        if 'end_date' in validated_data and validated_data['end_date'] > first_cluster.response_plan.end:
            raise serializers.ValidationError({
                'end_date': "Project end date cannot be later than the response plan's end date"
            })

        locations = self.initial_data.get('locations')

        if locations:
            location_ids = [l['id'] for l in locations]
            project.locations.clear()
            project.locations.add(*Location.objects.filter(id__in=location_ids))

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
    projects = PartnerActivityProjectContextSerializer(write_only=True, many=True)
    partner = serializers.IntegerField(write_only=True)

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

        for idx, project_context in enumerate(data['projects']):
            project = PartnerProject.objects.filter(id=project_context['id']).first()
            if not project:
                raise serializers.ValidationError({
                    'project_id': 'PartnerProject ID {} does not exist.'.format(project_context['id'])
                })
            elif not project.partner_id == partner.id:
                raise serializers.ValidationError({
                    'partner': 'PartnerProject does not belong to Partner {}.'.format(self.initial_data['partner'])
                })

            data['projects'][idx]['project'] = project

            if project_context['start_date'] > project_context['end_date']:
                raise serializers.ValidationError({
                    "start_date": "start_date should come before end_date",
                })

            if project.start_date > project_context['start_date']:
                raise serializers.ValidationError({
                    "start_date": "start_date cannot start before its project's start date",
                })

            if project.end_date < project_context['end_date']:
                raise serializers.ValidationError({
                    "end_date": "end_date cannot end after its project's end date",
                })

        data['cluster'] = cluster
        data['partner'] = partner

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
                partner=validated_data['partner'],
                cluster_activity=validated_data['cluster_activity'],
            )

            for validated_context_data in validated_data['projects']:
                project = validated_context_data['project']
                PartnerActivityProjectContext.objects.update_or_create(
                    defaults={
                        'start_date': validated_context_data['start_date'],
                        'end_date': validated_context_data['end_date'],
                        'status': validated_context_data['status'],
                    },
                    activity=partner_activity,
                    project=project,
                )

        except Exception as e:
            if getattr(e, 'message', None):
                raise serializers.ValidationError(e.message)
            else:
                raise serializers.ValidationError(e)

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

        data['cluster_objective'] = cluster_objective

        return data

    def create(self, validated_data):
        try:
            partner_activity = PartnerActivity.objects.create(
                title=validated_data['title'],
                partner=validated_data['partner'],
                cluster_objective=validated_data['cluster_objective'],
            )

            for validated_context_data in validated_data['projects']:
                project = validated_context_data['project']
                PartnerActivityProjectContext.objects.update_or_create(
                    defaults={
                        'start_date': validated_context_data['start_date'],
                        'end_date': validated_context_data['end_date'],
                        'status': validated_context_data['status'],
                    },
                    activity=partner_activity,
                    project=project,
                )
        except Exception as e:
            if getattr(e, 'message', None):
                raise serializers.ValidationError(e.message)
            else:
                raise serializers.ValidationError(e)

        return partner_activity


class PartnerActivitySerializer(serializers.ModelSerializer):

    cluster = serializers.SerializerMethodField()
    projects = PartnerActivityProjectContextDetailUpdateSerializer(source='partneractivityprojectcontext_set', many=True)
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
            'projects',
            'cluster_activity',
            'cluster_objective',
            'reportables',
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

    projects = PartnerActivityProjectContextDetailUpdateSerializer(source='partneractivityprojectcontext_set', many=True)

    class Meta:
        model = PartnerActivity
        fields = (
            'title',
            'projects',
        )

    def __init__(self, instance, *args, **kwargs):
        self.partial = kwargs['partial']

        if not instance.is_custom:
            self.fields.pop('title')
        super(PartnerActivityUpdateSerializer, self).__init__(instance, *args, **kwargs)

    def get_extra_kwargs(self):
        # Treat all fields except ID as write_only
        return {
            f: {'write_only': f != 'id'} for f in self.Meta.fields
        }

    def validate(self, data):
        for idx, project_context in enumerate(data['partneractivityprojectcontext_set']):
            project = PartnerProject.objects.filter(id=project_context['project']['id']).first()
            if not project:
                raise serializers.ValidationError({
                    'project_id': 'PartnerProject ID {} does not exist.'.format(project_context['project']['id'])
                })
            elif not project.partner_id == self.instance.partner.id:
                raise serializers.ValidationError({
                    'partner': 'PartnerProject does not belong to Partner {}.'.format(self.instance.partner.id)
                })

            data['partneractivityprojectcontext_set'][idx]['project'] = project

            if project_context['start_date'] > project_context['end_date']:
                raise serializers.ValidationError({
                    "start_date": "start_date should come before end_date",
                })

            if project.start_date > project_context['start_date']:
                raise serializers.ValidationError({
                    "start_date": "start_date cannot start before its project's start date",
                })

            if project.end_date < project_context['end_date']:
                raise serializers.ValidationError({
                    "end_date": "end_date cannot end after its project's end date",
                })

        return super(PartnerActivityUpdateSerializer, self).validate(data)

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.save()

        old_projects = set(instance.projects.values_list('id', flat=True))
        updated_projects = set(map(lambda x: x['project'].id, validated_data['partneractivityprojectcontext_set']))
        old_projects_to_delete = old_projects.difference(updated_projects)

        PartnerActivityProjectContext.objects.filter(
            activity=instance,
            project__in=old_projects_to_delete
        ).delete()

        for validated_context_data in validated_data['partneractivityprojectcontext_set']:
            project = validated_context_data['project']
            obj, created = PartnerActivityProjectContext.objects.update_or_create(
                project=project,
                activity=instance,
                defaults={
                    'start_date': validated_context_data['start_date'],
                    'end_date': validated_context_data['end_date'],
                    'status': validated_context_data['status']
                }
            )

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

        for key, value in validated_data.items():
            setattr(instance, key, value)

        instance.save()

        return instance

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
