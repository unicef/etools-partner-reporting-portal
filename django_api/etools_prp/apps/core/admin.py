from django.contrib import messages
from django.contrib.gis import admin

from admin_extra_urls.decorators import button
from admin_extra_urls.mixins import ExtraUrlMixin
from leaflet.admin import LeafletGeoAdmin

from etools_prp.apps.indicator.tasks import process_due_reports
from etools_prp.apps.partner.tasks import process_partners
from etools_prp.apps.unicef.tasks import process_programme_documents

from .cartodb import update_sites_from_cartodb
from .forms import AutoSizeTextForm, CartoDBTableForm, GatewayTypeModelForm
from .models import CartoDBTable, Country, GatewayType, Location, PRPRole, ResponsePlan, Workspace
from .tasks import process_period_reports, process_workspaces


class LocationAdmin(LeafletGeoAdmin, admin.ModelAdmin):
    save_as = True
    form = AutoSizeTextForm
    fields = [
        'title',
        'gateway',
        'p_code',
        'parent',
        'geom',
        'point',
    ]
    list_filter = (
        'gateway',
    )
    list_display = ('title', 'parent', 'gateway', 'p_code',)
    search_fields = ('title', 'p_code',)
    raw_id_fields = ('parent', 'gateway')

    def get_form(self, request, obj=None, **kwargs):
        self.readonly_fields = [] if request.user.is_superuser else ['p_code', 'geom', 'point', 'gateway']
        return super().get_form(request, obj, **kwargs)


class GatewayTypeAdmin(admin.ModelAdmin):
    form = GatewayTypeModelForm
    fields = ('name', 'admin_level', 'country')


class CartoDBTableAdmin(admin.ModelAdmin):

    form = CartoDBTableForm
    save_as = True
    list_display = (
        'domain',
        'table_name',
        'location_type',
        'parent_table_name',
    )

    actions = ('import_sites',)
    raw_id_fields = ('location_type', 'parent')

    def parent_table_name(self, obj):
        return obj.parent.table_name if obj.parent else "No parent"

    def import_sites(self, request, queryset):
        for table in queryset:
            update_sites_from_cartodb.delay(table.pk)


class WorkspaceAdmin(ExtraUrlMixin, admin.ModelAdmin):
    list_display = ('title', 'workspace_code', 'business_area_code',
                    'external_id')
    list_filter = ('countries',)
    search_fields = ('title', 'workspace_code', 'business_area_code',
                     'external_id')

    @button()
    def process_workspaces(self, request):
        process_workspaces.delay()
        messages.add_message(request, messages.INFO, 'Sync Workspace Task triggered')

    @button()
    def process_partners(self, request, pk):
        obj = self.get_object(request, pk)
        process_partners.delay(obj.business_area_code)
        messages.add_message(request, messages.INFO, 'Sync Partners Task triggered')

    @button()
    def sync_programme_documents(self, request, pk):
        obj = self.get_object(request, pk)
        process_programme_documents.delay(area=obj.business_area_code)
        messages.add_message(request, messages.INFO, 'Sync PDs Task triggered')

    @button()
    def report_generator_sync(self, request, pk):
        obj = self.get_object(request, pk)
        process_period_reports.delay(area=obj.business_area_code)
        messages.add_message(request, messages.INFO, 'Sync Report Generator Task triggered')

    @button()
    def due_overdue_report_checker(self, request, pk):
        obj = self.get_object(request, pk)
        process_due_reports.delay(area=obj.business_area_code)
        messages.add_message(request, messages.INFO, 'Due/Overdue Reports Checker triggered')


class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'iso3_code', 'country_short_code')
    search_fields = ('name', 'iso3_code', 'country_short_code')


class ResponsePlanAdmin(admin.ModelAdmin):
    list_display = ('title', 'plan_type', 'start', 'end', 'workspace')
    list_filter = ('plan_type', 'workspace')
    search_fields = ('title',)


class PRPRoleAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'workspace', 'cluster')
    list_filter = ('role', )
    search_fields = ('user__first_name', 'user__last_name', 'user__email')
    raw_id_fields = ('user', 'cluster')


admin.site.register(Workspace, WorkspaceAdmin)
admin.site.register(Location, LocationAdmin)
admin.site.register(ResponsePlan, ResponsePlanAdmin)
admin.site.register(GatewayType)
admin.site.register(CartoDBTable, CartoDBTableAdmin)
admin.site.register(Country, CountryAdmin)
admin.site.register(PRPRole, PRPRoleAdmin)
