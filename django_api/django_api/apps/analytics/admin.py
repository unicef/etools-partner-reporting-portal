from django.contrib import admin

from .models import (
    IndicatorReport,
    ProgressReport,
)

admin.site.register(IndicatorReport)
admin.site.register(ProgressReport)