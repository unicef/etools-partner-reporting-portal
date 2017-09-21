from django.contrib.gis import admin

from leaflet.admin import LeafletGeoAdmin

from core.forms import (
    GatewayTypeModelForm,
    CartoDBTableForm,
    AutoSizeTextForm
)
from core.cartodb import update_sites_from_cartodb
from .models import (
    Workspace,
    Location,
    ResponsePlan,
    GatewayType,
    CartoDBTable,
    Country
)


class LocationAdmin(LeafletGeoAdmin, admin.ModelAdmin):
    save_as = True
    form = AutoSizeTextForm
    fields = [
        'title',
        'gateway',
        'p_code',
        'geom',
        'point',
    ]
    list_filter = (
        'gateway',
        'parent',
    )
    list_display = ('title', 'parent', 'gateway', 'p_code')
    search_fields = ('carto_db_table', 'gateway')
    search_fields = ('title', 'p_code',)

    def get_form(self, request, obj=None, **kwargs):
        self.readonly_fields = [] if request.user.is_superuser else [
            'p_code', 'geom', 'point', 'gateway']

        return super(LocationAdmin, self).get_form(request, obj, **kwargs)

    # def get_fields(self, request, obj=None):
    #
    #     fields = super(LocationAdmin, self).get_fields(request, obj)
    #     if obj:
    #         if obj.point:
    #             fields.append('point')
    #         if obj.geom:
    #             fields.append('geom')
    #
    #     return fields


class GatewayTypeAdmin(admin.ModelAdmin):
    form = GatewayTypeModelForm
    fields = ('name', 'admin_level', 'country')


class CartoDBTableAdmin(admin.ModelAdmin):

    form = CartoDBTableForm
    save_as = True
    list_display = (
        'domain',
        'api_key',
        'table_name',
        'location_type',
        'parent_table_name',
    )

    actions = ('import_sites',)

    def parent_table_name(self, obj):
        return obj.parent.table_name if obj.parent else "No parent"

    def import_sites(self, request, queryset):
        for table in queryset:
            update_sites_from_cartodb.delay(table)


class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ('title', 'workspace_code', 'business_area_code')
    list_filter = ('countries',)
    search_fields = ('title', 'workspace_code', 'business_area_code')


class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'country_short_code')
    search_fields = ('name', 'country_short_code')


admin.site.register(Workspace, WorkspaceAdmin)
admin.site.register(Location, LocationAdmin)
admin.site.register(ResponsePlan)
admin.site.register(GatewayType)
admin.site.register(CartoDBTable)
admin.site.register(Country, CountryAdmin)
