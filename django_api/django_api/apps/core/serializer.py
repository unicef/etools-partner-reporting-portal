from rest_framework import serializers

from .models import Intervention


class SimpleInterventionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Intervention
        fields = ('id', 'title', 'country_name', 'country_code')
