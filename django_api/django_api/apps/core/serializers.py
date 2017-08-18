from rest_framework import serializers

from .models import Intervention, Location, ResponsePlan


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

    title = serializers.CharField(read_only=True)

    class Meta:
        model = Location
        fields = ('id', 'title')


class IdLocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = ('id', )


class ChildrenLocationSerializer(serializers.ModelSerializer):
    """
    Endpoint for drop down meny on PD list filterset - location.
    """

    class Meta:
        model = Intervention
        fields = ('id', 'title')


class ResponsePlanSerializer(serializers.ModelSerializer):

    class Meta:
        model = ResponsePlan
        fields = (
            'id',
            'title',
            'plan_type',
            'start',
            'end',
            'intervention',
            'documents',
        )
