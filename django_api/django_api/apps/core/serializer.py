from rest_framework import serializers

from .models import Intervention


class SimpleCountrySerializer(serializers.ModelSerializer):

    intervention_id = serializers.ReadOnlyField(source='id')

    class Meta:
        model = Intervention
        fields = ('intervention_id', 'title', 'country_name', 'country_code_lower')
