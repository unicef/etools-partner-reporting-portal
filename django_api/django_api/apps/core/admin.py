from django.contrib import admin

from .models import (
    Intervention,
    Country,
    Location,
)

admin.site.register(Intervention)
admin.site.register(Country)
admin.site.register(Location)
