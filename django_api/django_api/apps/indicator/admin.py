from django.contrib import admin

from .models import (
    IndicatorBlueprint,
    Reportable,
    IndicatorReport,
    IndicatorLocationData,
    Disaggregation,
    DisaggregationValue,
)

admin.site.register(IndicatorBlueprint)
admin.site.register(Reportable)
admin.site.register(IndicatorReport)
admin.site.register(IndicatorLocationData)
admin.site.register(Disaggregation)
admin.site.register(DisaggregationValue)