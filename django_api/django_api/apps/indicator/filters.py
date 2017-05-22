from django_filters import rest_framework as filters

from indicator.models import Reportable, IndicatorBlueprint


class IndicatorFilter(filters.FilterSet):
    class Meta:
        model = Reportable
        fields = (
            'id', 'target', 'baseline', 'blueprint'
        )
