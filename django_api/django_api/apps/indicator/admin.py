from django.contrib import admin

from .models import (
    IndicatorBlueprint,
    Reportable,
    IndicatorDisaggregation,
    IndicatorDataSpecification,
    IndicatorReport,
)

admin.site.register(IndicatorBlueprint)
admin.site.register(Reportable)
admin.site.register(IndicatorDisaggregation)
admin.site.register(IndicatorDataSpecification)
admin.site.register(IndicatorReport)
