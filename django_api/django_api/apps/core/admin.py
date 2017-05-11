from django.contrib import admin

from .models import (
    Intervention,
    Location,
)

admin.site.register(Intervention)
admin.site.register(Location)
