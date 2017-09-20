from django.contrib import admin

from core.forms import GatewayTypeModelForm
from .models import (
    Workspace,
    Location,
    ResponsePlan,
    GatewayType,
    CartoDBTable,
    Country
)


class GatewayTypeAdmin(admin.ModelAdmin):
    form = GatewayTypeModelForm
    fields = ('name', 'admin_level', 'intervention')


class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ('title', 'workspace_code', 'business_area_code')
    list_filter = ('countries',)
    search_fields = ('title', 'workspace_code', 'business_area_code')


class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'country_short_code')
    search_fields = ('name', 'country_short_code')


class LocationAdmin(admin.ModelAdmin):
    list_display = ('title', 'parent', 'gateway', 'p_code')
    search_fields = ('carto_db_table', 'gateway')
    search_fields = ('title', 'p_code',)


admin.site.register(Workspace, WorkspaceAdmin)
admin.site.register(Location, LocationAdmin)
admin.site.register(ResponsePlan)
admin.site.register(GatewayType)
admin.site.register(CartoDBTable)
admin.site.register(Country, CountryAdmin)
