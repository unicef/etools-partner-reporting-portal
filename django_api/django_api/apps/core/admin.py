from django.contrib import admin

from core.forms import GatewayTypeModelForm
from .models import (
    Intervention,
    Location,
    ResponsePlan,
    GatewayType,
    CartoDBTable,
)


class GatewayTypeAdmin(admin.ModelAdmin):
    form = GatewayTypeModelForm
    fields = ('name', 'admin_level', 'intervention')


admin.site.register(Intervention)
admin.site.register(Location)
admin.site.register(ResponsePlan)
admin.site.register(GatewayType)
admin.site.register(CartoDBTable)
