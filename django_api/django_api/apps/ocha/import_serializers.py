from rest_framework import serializers

from cluster.models import Cluster
from core.common import EXTERNAL_DATA_SOURCES
from core.models import Country, ResponsePlan, Workspace
from partner.models import PartnerProject, Partner, FundingSource


class PartnerImportSerializer(serializers.ModelSerializer):
    external_source = serializers.CharField(default=EXTERNAL_DATA_SOURCES.HPC)
    id = serializers.IntegerField(source='external_id')
    name = serializers.CharField(source='title')
    abbreviation = serializers.CharField(source='short_title')
    nativeName = serializers.CharField(source='alternate_title')

    class Meta:
        model = Partner
        fields = (
            'name',
            'external_source',
            'id',
            'abbreviation',
            'nativeName',
        )


class V2PartnerProjectImportSerializer(serializers.ModelSerializer):
    external_source = serializers.CharField(default=EXTERNAL_DATA_SOURCES.HPC)
    id = serializers.IntegerField(source='external_id')
    name = serializers.CharField(source='title')
    startDate = serializers.DateTimeField(source='start_date')
    endDate = serializers.DateTimeField(source='end_date')
    organizations = PartnerImportSerializer(many=True)
    code = serializers.CharField()

    class Meta:
        model = PartnerProject
        fields = (
            'name',
            'id',
            'startDate',
            'endDate',
            'organizations',
            'external_source',
            'code',
        )

    def create(self, validated_data):
        partners = []
        for partner_data in validated_data.pop('organizations', []):
            update_or_create_kwargs = {
                'external_source': partner_data.pop('external_source'),
                'external_id': partner_data.pop('external_id')
            }

            partners.append(Partner.objects.update_or_create(
                defaults=partner_data, **update_or_create_kwargs
            )[0])

        if len(partners) > 1:
            # While the schema seems to support more than one org we're told it's unlikely to occur
            raise serializers.ValidationError({
                'organizations': 'More than one organization per project is not supported'
            })

        validated_data['partner'] = partners[0]

        instance = PartnerProject.objects.filter(code=validated_data['code']).first()
        if instance:
            return super(V2PartnerProjectImportSerializer, self).update(instance, validated_data)
        else:
            return super(V2PartnerProjectImportSerializer, self).create(validated_data)


class V1FundingSourceImportSerializer(serializers.ModelSerializer):
    # Most of the information we want is nested, would be overkill to write serializer for all structures
    incoming = serializers.DictField()
    flows = serializers.ListField(allow_empty=False)

    class Meta:
        model = FundingSource
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

    def get_organization_info_for_flow(self, flow):
        organization_info = list(filter(
            lambda src: src['type'] == 'Organization',
            flow['sourceObjects']
        ))
        if not organization_info:
            raise serializers.ValidationError('Source organization info missing')
        return organization_info[0]

    def get_usage_year_for_flow(self, flow):
        usage_year_info = list(filter(
            lambda dest: dest['type'] == 'UsageYear',
            flow['destinationObjects']
        ))
        if not usage_year_info:
            return None
        return int(usage_year_info[0]['name'])

    def create(self, validated_data):
        sources = []

        total_funding = validated_data['incoming'].get('fundingTotal', 0)

        for flow in validated_data['flows']:
            project = self.get_project_for_flow(flow)

            if total_funding:
                project.total_budget = total_funding
                project.save()

            get_or_crete_kwargs = {
                'external_id': flow['id'],
                'external_source': EXTERNAL_DATA_SOURCES.HPC,
                'partner_project_id': project.id,
            }

            organization_info = self.get_organization_info_for_flow(flow)

            organization_type = organization_info['organizationTypes'] and organization_info['organizationTypes'][0]

            funding_source = {
                'usd_amount': flow['amountUSD'],
                'original_amount': flow['originalAmount'],
                'original_currency': flow['originalCurrency'],
                'exchange_rate': flow['exchangeRate'],
                'name': organization_info['name'],
                'organization_type': organization_type,
                'usage_year': self.get_usage_year_for_flow(flow),
            }

            source, _ = FundingSource.objects.update_or_create(defaults=funding_source, **get_or_crete_kwargs)
            sources.append(source)

        return sources


class V1ResponsePlanLocationImportSerializer(serializers.ModelSerializer):
    external_source = serializers.CharField(default=EXTERNAL_DATA_SOURCES.HPC)
    id = serializers.IntegerField(source='external_id')
    name = serializers.CharField()
    iso3 = serializers.CharField(source='country_short_code')

    class Meta:
        model = Country
        fields = (
            'external_source',
            'id',
            'name',
            'long_name',
            'iso3',
        )

    def create(self, validated_data):
        update_or_create_kwargs = {
            'external_source': validated_data.pop('external_source'),
            'external_id': validated_data.pop('external_id')
        }

        # TODO: Retrieve country.long_name from some library based on iso code?

        return Country.objects.update_or_create(
            defaults=validated_data, **update_or_create_kwargs
        )[0]


class V1ResponsePlanImportSerializer(serializers.ModelSerializer):
    external_source = serializers.CharField(default=EXTERNAL_DATA_SOURCES.HPC)
    id = serializers.IntegerField(source='external_id')
    name = serializers.CharField(source='title')
    startDate = serializers.DateTimeField(source='start')
    endDate = serializers.DateTimeField(source='end')
    locations = V1ResponsePlanLocationImportSerializer(many=True)
    emergencies = serializers.ListField()
    governingEntities = serializers.ListField(allow_empty=False)  # Clusters

    class Meta:
        model = ResponsePlan
        fields = (
            'external_source',
            'name',
            'id',
            'startDate',
            'endDate',
            'locations',
            'emergencies',
            'governingEntities',
        )

    def get_workspace(self, emergencies, locations):
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

        update_or_create_kwargs = {
            'external_source': EXTERNAL_DATA_SOURCES.HPC,
            'external_id': workspace_id
        }

        workspace, _ = Workspace.objects.update_or_create(
            defaults={
                'title': workspace_title,
                'workspace_code': workspace_code,
            },
            **update_or_create_kwargs
        )

        location_serializer = V1ResponsePlanLocationImportSerializer(
            data=self.initial_data['locations'], many=True
        )
        location_serializer.is_valid(raise_exception=True)

        workspace.countries.add(*location_serializer.save())

        return workspace

    def create(self, validated_data):
        workspace = self.get_workspace(
            validated_data.pop('emergencies'),
            validated_data.pop('locations'),
        )

        validated_data['workspace'] = workspace
        clusters_data = validated_data.pop('governingEntities')

        response_plan = super(V1ResponsePlanImportSerializer, self).create(validated_data)
        for cluster_data in clusters_data:
            Cluster.objects.update_or_create(
                external_id=cluster_data['id'],
                external_source=validated_data['external_source'],
                response_plan=response_plan,
                defaults={
                    'type': cluster_data['name']
                }
            )

        return response_plan
