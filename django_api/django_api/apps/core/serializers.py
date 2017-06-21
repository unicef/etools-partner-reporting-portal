from rest_framework import serializers

from .models import Intervention, Location


class SimpleInterventionSerializer(serializers.ModelSerializer):

    location_id = serializers.SerializerMethodField()

    class Meta:
        model = Intervention
        fields = ('id', 'title', 'country_name', 'country_code', 'location_id')

    def get_location_id(self, obj):
        # for example: Ukrain, Luhansk, Sorokyne .. we want to have only Ukrain (no parent - always one)
        loc = obj.locations.filter(parent__isnull=True).first()
        return loc and str(loc.id)


class SimpleLocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = ('id', 'title', 'latitude', 'longitude', 'p_code')


class ShortLocationSerializer(serializers.ModelSerializer):

    id = serializers.SerializerMethodField()
    title = serializers.CharField(read_only=True)

    class Meta:
        model = Location
        fields = ('id', 'title')

    def get_id(self, obj):
        return str(obj.id)


class ChildrenLocationSerializer(serializers.ModelSerializer):
    """
    Endpoint for drop down meny on PD list filterset - location.
    """
    id = serializers.SerializerMethodField()

    class Meta:
        model = Intervention
        fields = ('id', 'title')

    def get_id(self, obj):
        return str(obj.id)
