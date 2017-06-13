from rest_framework import serializers

from .models import (
    Partner,
    PartnerProject,
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

    class Meta:
        model = PartnerProject
        fields = (
            'id',
            'title',
            'start_date',
            'end_date',
            'status',

            #'clusters',
            #'locations',
            #'partner',
            #'reportables',
        )
