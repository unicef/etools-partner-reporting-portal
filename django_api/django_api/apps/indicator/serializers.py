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
    ref_num = serializers.CharField()
    achieved = serializers.IntegerField()
    progress_percentage = serializers.FloatField()

    class Meta:
        model = Reportable
        fields = (
            'id', 'target', 'baseline', 'blueprint',
            'ref_num', 'achieved', 'progress_percentage'
        )


class BaseIndicatorDataSerializer(serializers.ModelSerializer):

    llo_name = serializers.SerializerMethodField()
    llo_id = serializers.SerializerMethodField()

    class Meta:
        model = Reportable
        fields = (
            'id', 'llo_name', 'llo_id', 'target', 'baseline'
        )

    def get_llo_name(self, obj):
        if isinstance(obj.content_object, LowerLevelOutput):
            return obj.content_object.title
        else:
            return ''

    def get_llo_id(self, obj):
        if isinstance(obj.content_object, LowerLevelOutput):
            return obj.content_object.id
        else:
            return ''


class IndicatorDataSerializer(BaseIndicatorDataSerializer):

    indicators = serializers.SerializerMethodField()

    class Meta:
        model = Reportable
        fields = (
            'id', 'llo_name', 'llo_id', 'target', 'baseline', 'indicators'
        )

    def get_indicators(self, obj):
        children = Reportable.objects.filter(parent_indicator=obj.id)
        serializer = BaseIndicatorDataSerializer(children, many=True)
        return serializer.data
