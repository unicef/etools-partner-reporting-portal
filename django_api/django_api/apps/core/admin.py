from django.contrib import admin

from core.forms import GatewayTypeModelForm, CartoDBTableForm
from core.cartodb import update_sites_from_cartodb
from core.models import (
    Intervention,
    Location,
    ResponsePlan,
    GatewayType,
    CartoDBTable,
)


class GatewayTypeAdmin(admin.ModelAdmin):
    form = GatewayTypeModelForm
    fields = ('name', 'admin_level', 'intervention')


class CartoDBTableAdmin(admin.ModelAdmin):
    form = CartoDBTableForm
    save_as = True
    list_display = (
        'domain',
        'api_key',
        'username',
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


admin.site.register(Intervention)
admin.site.register(Location)
admin.site.register(ResponsePlan)
admin.site.register(GatewayType)
admin.site.register(CartoDBTable, CartoDBTableAdmin)
