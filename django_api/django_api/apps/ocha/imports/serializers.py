import logging
from collections import defaultdict

from django.utils import timezone
from rest_framework import serializers

from cluster.models import Cluster
from core.common import EXTERNAL_DATA_SOURCES, CLUSTER_TYPES, RESPONSE_PLAN_TYPE, PARTNER_PROJECT_STATUS
from core.models import Country, ResponsePlan, Workspace, Location
from ocha.constants import RefCode
from ocha.imports.utilities import save_location_list
from partner.models import PartnerProject, Partner


logger = logging.getLogger('ocha-sync')


class DiscardUniqueTogetherValidationMixin(object):

    def get_unique_together_validators(self):
        return []


class PartnerImportSerializer(serializers.ModelSerializer):
    external_source = serializers.CharField(default=EXTERNAL_DATA_SOURCES.HPC)
    id = serializers.IntegerField(source='external_id')
    name = serializers.CharField(source='title')
    abbreviation = serializers.CharField(source='short_title')
    nativeName = serializers.CharField(source='alternate_title', allow_null=True)

    class Meta:
        model = Partner
        fields = (
            'name',
            'external_source',
            'id',
            'abbreviation',
            'nativeName',
        )


class V2PartnerProjectLocationImportSerializer(serializers.ModelSerializer):
    external_source = serializers.CharField(default=EXTERNAL_DATA_SOURCES.HPC)
    id = serializers.IntegerField(source='external_id')

    name = serializers.CharField(source='title')
    iso3 = serializers.CharField(allow_null=True)
    parentId = serializers.IntegerField(allow_null=True)
    latitude = serializers.FloatField(allow_null=True)
    longitude = serializers.FloatField(allow_null=True)
    adminLevel = serializers.IntegerField()

    class Meta:
        model = Location
        fields = (
            'external_source',
            'id',
            'name',
            'iso3',
            'parentId',
            'latitude',
            'longitude',
            'adminLevel',
        )


class V2PartnerProjectImportSerializer(DiscardUniqueTogetherValidationMixin, serializers.ModelSerializer):
    external_source = serializers.CharField(default=EXTERNAL_DATA_SOURCES.HPC)
    id = serializers.IntegerField(source='external_id')
    name = serializers.CharField(source='title')
    objective = serializers.CharField(source='description', allow_null=True, allow_blank=True)
    currentRequestedFunds = serializers.FloatField(source='total_budget', allow_null=True)
    startDate = serializers.DateTimeField(source='start_date')
    endDate = serializers.DateTimeField(source='end_date')
    code = serializers.CharField(allow_null=True, allow_blank=True)
    additional_information = serializers.CharField(allow_null=True, allow_blank=True)
    locations = V2PartnerProjectLocationImportSerializer(many=True)
    cluster_ids = serializers.ListField(child=serializers.IntegerField(), allow_null=True)

    class Meta:
        model = PartnerProject
        fields = (
            'name',
            'objective',
            'partner',
            'id',
            'startDate',
            'endDate',
            'external_source',
            'code',
            'locations',
            'currentRequestedFunds',
            'additional_information',
            'cluster_ids'
        )

    def get_status(self):
        today = timezone.now()
        if self.validated_data['start_date'] > today:
            return PARTNER_PROJECT_STATUS.planned
        elif self.validated_data['end_date'] < today:
            return PARTNER_PROJECT_STATUS.completed
        else:
            return PARTNER_PROJECT_STATUS.ongoing

    def create(self, validated_data):
        validated_data['status'] = self.get_status()
        if 'additional_information' not in validated_data:
            validated_data['additional_information'] = ''
        location_data_list = validated_data.pop('locations')
        cluster_ids = validated_data.pop('cluster_ids', None)
        partner_project = PartnerProject.objects.filter(
            external_source=EXTERNAL_DATA_SOURCES.HPC,
            external_id=validated_data['external_id']
        ).first()
        if partner_project:
            partner_project = super(V2PartnerProjectImportSerializer, self).update(partner_project, validated_data)
        else:
            partner_project = super(V2PartnerProjectImportSerializer, self).create(validated_data)

        locations = save_location_list(location_data_list, "project")

        # Add clusters
        if cluster_ids:
            clusters = Cluster.objects.filter(external_id__in=cluster_ids)
            partner_project.clusters.add(*clusters)

        partner_project.locations.add(*locations)
        return partner_project


class V1FundingSourceImportSerializer(serializers.Serializer):
    # Most of the information we want is nested, would be overkill to write serializer for all structures
    incoming = serializers.DictField()
    flows = serializers.ListField(allow_empty=False)

    class Meta:
        fields = (
            'incoming',
            'flows',
        )

    def get_project_for_flow(self, flow):
        project_info = list(filter(
            lambda dest: dest['type'] == 'Project',
            flow['destinationObjects']
        ))

        if not project_info or 'code' not in project_info[0]:
            raise serializers.ValidationError('Project info not found')
        return PartnerProject.objects.get(code=project_info[0]['code'])

    def get_organization_names_for_flow(self, flow):
        organization_info = list(filter(
            lambda src: src['type'] == 'Organization',
            flow['sourceObjects']
        ))
        return [o['name'] for o in organization_info]

    def get_usage_year_for_flow(self, flow):
        usage_year_info = list(filter(
            lambda dest: dest['type'] == 'UsageYear',
            flow['destinationObjects']
        ))
        if not usage_year_info:
            return None
        return int(usage_year_info[0]['name'])

    def create(self, validated_data):
        project_total_funding = defaultdict(int)
        project_funding_sources = defaultdict(list)

        for flow in validated_data['flows']:
            project = self.get_project_for_flow(flow)
            project_total_funding[project.id] += flow['amountUSD']
            project_funding_sources[project.id].extend(self.get_organization_names_for_flow(flow))

        for project_id, total_usd_budget in project_total_funding.items():
            PartnerProject.objects.filter(id=project_id).update(
                total_budget=total_usd_budget,
                funding_source='; '.join(project_funding_sources[project_id]),
            )

        return PartnerProject.objects.filter(id__in=project_total_funding.keys())


class V1ResponsePlanLocationImportSerializer(DiscardUniqueTogetherValidationMixin, serializers.ModelSerializer):
    name = serializers.CharField()
    iso3 = serializers.CharField(source='country_short_code', allow_null=True)

    class Meta:
        model = Country
        fields = (
            'name',
            'iso3',
        )

    def create(self, validated_data):
        country_short_code = validated_data.pop('country_short_code')

        return Country.objects.update_or_create(
            country_short_code=country_short_code,  defaults=validated_data,
        )[0]


class V1ResponsePlanImportSerializer(DiscardUniqueTogetherValidationMixin, serializers.ModelSerializer):
    workspace_id = serializers.IntegerField(required=False)
    external_source = serializers.CharField(default=EXTERNAL_DATA_SOURCES.HPC)
    id = serializers.IntegerField(source='external_id')
    name = serializers.CharField(source='title')
    startDate = serializers.DateTimeField(source='start')
    endDate = serializers.DateTimeField(source='end')
    locations = V1ResponsePlanLocationImportSerializer(many=True)
    emergencies = serializers.ListField()
    categories = serializers.ListField()
    governingEntities = serializers.ListField(allow_empty=False, error_messages={
        'empty': 'This Response Plan has no Clusters.'
    })

    class Meta:
        model = ResponsePlan
        fields = (
            'workspace_id',
            'external_source',
            'name',
            'id',
            'startDate',
            'endDate',
            'locations',
            'categories',
            'emergencies',
            'governingEntities',
        )

    def get_workspace_id(self, emergencies, locations):
        if 'workspace_id' in self.validated_data:
            return self.validated_data['workspace_id']

        if emergencies:
            workspace_id = emergencies[0]['id']
            workspace_title = emergencies[0]['name']
            # TODO: How do we generate workspace code for emergency
            workspace_code = 'EM{}'.format(emergencies[0]['id'])
        elif len(locations) == 1:
            workspace_id = None
            workspace_title = locations[0]['name']
            workspace_code = locations[0]['country_short_code']
        else:
            raise serializers.ValidationError('No overall emergency named for multi country plan')
        # TODO: Handling of duplicate workspace codes

        workspace, _ = Workspace.objects.update_or_create(
            workspace_code=workspace_code,
            defaults={
                'title': workspace_title,
                'external_source': EXTERNAL_DATA_SOURCES.HPC,
                'external_id': workspace_id
            }
        )

        location_serializer = V1ResponsePlanLocationImportSerializer(
            data=self.initial_data['locations'], many=True
        )
        location_serializer.is_valid(raise_exception=True)

        workspace.countries.add(*location_serializer.save())

        return workspace.id

    def save_clusters(self, response_plan, clusters_data):
        for cluster_data in clusters_data:
            if not cluster_data['entityPrototype']['refCode'] == RefCode.CLUSTER:
                continue

            Cluster.objects.update_or_create(
                type=CLUSTER_TYPES.imported,
                imported_type=cluster_data['governingEntityVersion']['name'],
                response_plan=response_plan,
                defaults={
                    'external_id': cluster_data['id'],
                    'external_source': self.validated_data['external_source'],
                }
            )

    def create(self, validated_data):
        workspace_id = self.get_workspace_id(
            validated_data.pop('emergencies'),
            validated_data.pop('locations'),
        )

        validated_data['workspace_id'] = workspace_id
        clusters_data = validated_data.pop('governingEntities')

        categories = validated_data.pop('categories')
        try:
            if categories[0]['id'] == 5:
                validated_data['plan_type'] = RESPONSE_PLAN_TYPE.fa
            # TODO: Other plan types?
        except (IndexError, KeyError):
            pass  # Default is fine

        update_or_create_kwargs = {
            'external_source': validated_data.pop('external_source'),
            'external_id': validated_data.pop('external_id')
        }

        response_plan, _ = ResponsePlan.objects.update_or_create(
            defaults=validated_data, **update_or_create_kwargs
        )
        self.save_clusters(response_plan, clusters_data)

        return response_plan
