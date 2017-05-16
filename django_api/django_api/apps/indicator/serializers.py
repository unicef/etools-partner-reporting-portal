from rest_framework import serializers

from .models import Reportable, IndicatorBlueprint


class IndicatorBlueprintSimpleSerializer(serializers.ModelSerializer):

    class Meta:
        model = IndicatorBlueprint
        fields = (
            'id', 'title', 'unit', 'code'
        )


class IndicatorListSerializer(serializers.ModelSerializer):
    blueprint = IndicatorBlueprintSimpleSerializer()

    class Meta:
        model = Reportable
        fields = (
            'id', 'target', 'baseline', 'blueprint'
        )
