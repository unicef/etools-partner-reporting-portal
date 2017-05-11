from django.contrib import admin

from .models import (
    Intervention,
    Country,
    Partner,
    Location,
)

admin.site.register(Intervention)
admin.site.register(Country)
admin.site.register(Partner)
admin.site.register(Location)
