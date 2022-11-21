from django.contrib.gis import admin

from leaflet.admin import LeafletGeoAdmin
from unicef_locations.models import CartoDBTable

from .cartodb import update_sites_from_cartodb
from .forms import CartoDBTableForm
from .models import Location, PRPRole, Realm, ResponsePlan, Workspace


class LocationAdmin(LeafletGeoAdmin, admin.ModelAdmin):
    save_as = True
    fields = [
        'name',
        'admin_level_name',
        'admin_level',
        'p_code',
        'parent',
        'geom',
        'point',
    ]
    list_filter = (
        'admin_level_name',
        'admin_level',
    )
    list_display = ('name', 'parent', 'admin_level_name', 'admin_level', 'p_code',)
    search_fields = ('name', 'p_code',)
    raw_id_fields = ('parent', )

    def get_form(self, request, obj=None, **kwargs):
        self.readonly_fields = [] if request.user.is_superuser else ['p_code', 'geom', 'point']
        return super().get_form(request, obj, **kwargs)


class CartoDBTableAdmin(admin.ModelAdmin):

    form = CartoDBTableForm
    save_as = True
    list_display = (
        'domain',
        'table_name',
        'admin_level_name',
        'admin_level',
        'parent_table_name',
    )

    actions = ('import_sites',)
    raw_id_fields = ('parent', )

    def parent_table_name(self, obj):
        return obj.parent.table_name if obj.parent else "No parent"

    def import_sites(self, request, queryset):
        for table in queryset:
            update_sites_from_cartodb.delay(table.pk)


class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ('title', 'workspace_code', 'business_area_code',
                    'external_id')
    search_fields = ('title', 'workspace_code', 'business_area_code',
                     'external_id')


class ResponsePlanAdmin(admin.ModelAdmin):
    list_display = ('title', 'plan_type', 'start', 'end', 'workspace')
    list_filter = ('plan_type', 'workspace')
    search_fields = ('title',)


class PRPRoleAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'workspace', 'cluster')
    list_filter = ('role', )
    search_fields = ('user__first_name', 'user__last_name', 'user__email')
    raw_id_fields = ('user', 'cluster')


class RealmAdmin(admin.ModelAdmin):
    raw_id_fields = ('user', )
    search_fields = ('user__email', 'user__first_name', 'user__last_name',
                     'workspace__title', 'workspace__workspace_code',
                     'workspace__business_area_code', 'workspace__external_id',
                     'partner__title', 'partner__short_title',
                     'group__name')
    autocomplete_fields = ('partner', 'workspace', 'group')


admin.site.register(Workspace, WorkspaceAdmin)
admin.site.register(Location, LocationAdmin)
admin.site.register(ResponsePlan, ResponsePlanAdmin)
admin.site.unregister(CartoDBTable)
admin.site.register(CartoDBTable, CartoDBTableAdmin)
admin.site.register(PRPRole, PRPRoleAdmin)
admin.site.register(Realm, RealmAdmin)
