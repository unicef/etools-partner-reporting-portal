from rest_framework import serializers

from core.common import EXTERNAL_DATA_SOURCES
from partner.models import PartnerProject, Partner, FundingSource


class PartnerImportSerializer(serializers.ModelSerializer):
    external_source = serializers.CharField(default=EXTERNAL_DATA_SOURCES.RPM)
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
    external_source = serializers.CharField(default=EXTERNAL_DATA_SOURCES.RPM)
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
