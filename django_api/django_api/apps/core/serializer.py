from rest_framework import serializers

from .models import Country, Partner


class SimpleCountrySerializer(serializers.ModelSerializer):

    class Meta:
        model = Country
        fields = ('id', 'name', 'country_name', 'country_code', 'business_area_code')


class PartnerDetailsSerializer(serializers.ModelSerializer):
    partner_type_long = serializers.CharField(source='get_partner_type_display')
    shared_partner_long = serializers.CharField(source='get_shared_partner_display')

    class Meta:
        model = Partner
        fields = ('id', 'name', 'short_name', 'alternate_name', 'vendor_number', 'partner_type', 'partner_type_long', 'shared_partner_long',
                  'shared_partner', 'last_assessment_date', 'core_values_assessment_date',
                  'address', 'street_address', 'city', 'postal_code', 'country', 'country_name', 'email', 'phone_number')
