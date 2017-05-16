from rest_framework import serializers

from unicef.models import LowerLevelOutput

from .models import Reportable, IndicatorBlueprint


class IndicatorBlueprintSimpleSerializer(serializers.ModelSerializer):

    class Meta:
        model = IndicatorBlueprint
        fields = (
            'id', 'title', 'unit',
        )


class IndicatorListSerializer(serializers.ModelSerializer):
    blueprint = IndicatorBlueprintSimpleSerializer()
    ref_num = serializers.SerializerMethodField()
    achieved = serializers.SerializerMethodField()

    def get_ref_num(self, obj):
        if isinstance(obj.content_object, LowerLevelOutput):
            return obj.content_object.indicator.programme_document.ref
        else:
            return ''

    def get_achieved(self, obj):
        if obj.indicator_reports.exists():
            return obj.indicator_reports.last().total
        else:
            return None

    class Meta:
        model = Reportable
        fields = (
            'id', 'target', 'baseline', 'blueprint',
            'ref_num', 'achieved'
        )
