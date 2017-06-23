from django.contrib import admin

from .models import (
    Intervention,
    Location,
    ResponsePlan,
)

admin.site.register(Intervention)
admin.site.register(Location)
admin.site.register(ResponsePlan)
