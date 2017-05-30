from rest_framework import serializers

from .models import Intervention


class SimpleInterventionSerializer(serializers.ModelSerializer):

    location_id = serializers.SerializerMethodField()

    class Meta:
        model = Intervention
        fields = ('id', 'title', 'country_name', 'country_code', 'location_id')

    def get_location_id(self, obj):
        # for example: Ukrain, Luhansk, Sorokyne .. we want to have only Ukrain (no parent - always one)
        loc = obj.locations.filter(parent__isnull=True).first()
        return loc and str(loc.id)


class ChildrenLocationSerializer(serializers.ModelSerializer):

    id = serializers.SerializerMethodField()

    class Meta:
        model = Intervention
        fields = ('id', 'title')

    def get_id(self, obj):
        return str(obj.id)
