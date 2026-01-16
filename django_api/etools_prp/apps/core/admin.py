from django.contrib import messages
from django.contrib.gis import admin

from admin_extra_buttons.api import button, ExtraButtonsMixin
from leaflet.admin import LeafletGeoAdmin
from post_office.admin import AttachmentInline as BaseAttachmentInline, EmailAdmin as BaseEmailAdmin
from post_office.models import Email
from unicef_locations.models import CartoDBTable

from .cartodb import import_locations, rebuild_tree
from .forms import CartoDBTableForm
from .models import BulkActionLog, Location, PRPRoleOld, Realm, ResponsePlan, Workspace
from .tasks import bulk_delete_locations, import_etools_locations


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
        'workspaces'
    ]
    list_filter = (
        'admin_level',
        'workspaces',
        'admin_level_name',
    )
    list_display = ('name', 'parent', 'admin_level_name', 'admin_level', 'p_code', 'get_workspaces')
    search_fields = ('name', 'p_code',)
    raw_id_fields = ('parent', )

    def get_form(self, request, obj=None, **kwargs):
        self.readonly_fields = [] if request.user.is_superuser else ['p_code', 'geom', 'point']
        return super().get_form(request, obj, **kwargs)

    def get_workspaces(self, obj):
        return "\n".join([p.title for p in obj.workspaces.all()])

    def delete_queryset(self, request, queryset):
        """
        Override bulk delete to use async task for large operations.
        """
        count = queryset.count()

        # For small deletions (< 10), use synchronous delete
        if count < 10:
            queryset.delete()
            messages.success(request, f"Successfully deleted {count} location(s).")
        else:
            # For large deletions, use async task
            location_ids = list(queryset.values_list('id', flat=True))
            bulk_delete_locations.delay(location_ids, user_id=request.user.id)
            messages.success(
                request,
                f"Bulk deletion of {count} locations has been queued. "
                f"This will be processed in the background. Check the logs for completion status."
            )


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

    actions = ('import_sites', 'rebuild_tree')
    raw_id_fields = ('parent', )

    def parent_table_name(self, obj):
        return obj.parent.table_name if obj.parent else "No parent"

    def import_sites(self, request, queryset):
        for table in queryset:
            import_locations.delay(table.pk)

    def rebuild_tree(self, request, queryset):
        rebuild_tree.delay()


class WorkspaceAdmin(ExtraButtonsMixin, admin.ModelAdmin):
    list_display = ('title', 'workspace_code', 'business_area_code',
                    'external_id')
    search_fields = ('title', 'workspace_code', 'business_area_code',
                     'external_id')

    @button(label='Sync locations from eTools')
    def sync_locations(self, request, pk):
        import_etools_locations.delay(pk)


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


class BulkActionLogAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'model_name', 'affected_count', 'user')
    list_filter = ('model_name', 'app_label', 'created_at')
    readonly_fields = ('created_at', 'user', 'affected_count', 'model_name',
                       'app_label', 'affected_ids')
    search_fields = ('user__email', 'user__first_name', 'user__last_name',
                     'model_name')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


class AttachmentInline(BaseAttachmentInline):
    def get_queryset(self, request):
        queryset = admin.StackedInline.get_queryset(self, request)

        if self.parent_obj:
            queryset = queryset.filter(email=self.parent_obj)

        return queryset.select_related('attachment')


class EmailAdmin(BaseEmailAdmin):
    inlines = [AttachmentInline, BaseEmailAdmin.inlines[1]]


admin.site.register(Workspace, WorkspaceAdmin)
admin.site.register(Location, LocationAdmin)
admin.site.register(ResponsePlan, ResponsePlanAdmin)
admin.site.unregister(CartoDBTable)
admin.site.register(CartoDBTable, CartoDBTableAdmin)
admin.site.register(PRPRoleOld, PRPRoleAdmin)
admin.site.register(Realm, RealmAdmin)
admin.site.register(BulkActionLog, BulkActionLogAdmin)

admin.site.unregister(Email)
admin.site.register(Email, EmailAdmin)
