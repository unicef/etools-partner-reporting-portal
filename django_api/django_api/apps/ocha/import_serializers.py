from rest_framework import serializers

from partner.models import PartnerProject, Partner


class PartnerImportSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='external_id')
    name = serializers.CharField(source='title')
    abbreviation = serializers.CharField(source='short_title')
    nativeName = serializers.CharField(source='alternate_title')

    class Meta:
        model = Partner
        fields = (
            'name',
            'id',
            'abbreviation',
            'nativeName',
        )

    # def create(self, validated_data):


class PartnerProjectImportSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='external_id')
    name = serializers.CharField(source='title')
    startDate = serializers.DateTimeField(source='start_date')
    endDate = serializers.DateTimeField(source='end_date')
    organizations = PartnerImportSerializer(many=True)

    class Meta:
        model = PartnerProject
        fields = (
            'name',
            'id',
            'startDate',
            'endDate',
            'organizations',
        )

    def create(self, validated_data):
        partners = Partner.objects.bulk_create([
            Partner(**partner_data) for partner_data in validated_data.pop('organizations', [])
        ])

        # TODO: waiting for decision on how to handle the fact that OCHA seems to support multiple partners per project
        validated_data['partner'] = partners[0]

        return super(PartnerProjectImportSerializer, self).create(validated_data)
