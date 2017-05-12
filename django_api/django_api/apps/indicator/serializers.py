from rest_framework import serializers

from .models import Reportable


class IndicatorListSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='blueprint__title')
    unit = serializers.CharField(source='blueprint__unit')
    code = serializers.CharField(source='blueprint__code')

    class Meta:
        model = Reportable
        fields = (
            'id', 'target', 'baseline', 'total', 'blueprint__title', 'blueprint__unit', 'blueprint__code'
        )
