from rest_framework import serializers

from .models import Partner


class PartnerDetailsSerializer(serializers.ModelSerializer):

    partner_type_long = serializers.CharField(source='get_partner_type_display')
    shared_partner_long = serializers.CharField(source='get_shared_partner_display')

    class Meta:
        model = Partner
        fields = ('id', 'title', 'short_title', 'alternate_title', 'vendor_number', 'partner_type', 'partner_type_long',
                  'shared_partner_long', 'shared_partner', 'last_assessment_date', 'core_values_assessment_date',
                  'address', 'street_address', 'city', 'postal_code', 'country', 'country_code', 'email',
                  'phone_number')
