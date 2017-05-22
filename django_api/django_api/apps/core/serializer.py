from rest_framework import serializers

from .models import Intervention, Location


class SimpleInterventionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Intervention
        fields = ('id', 'title', 'country_name', 'country_code')


class SimpleLocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = ('id', 'title', 'latitude', 'longitude', 'p_code')
