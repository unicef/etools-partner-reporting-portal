from django.contrib import admin

from .models import (
    Partner,
    PartnerProject,
    PartnerActivity,
    PartnerProjectFunding,
    PartnerActivityProjectContext,
)


class PartnerAdmin(admin.ModelAdmin):
    list_display = ('title', 'partner_type', 'email', 'country_code', 'rating',
                    'external_id', 'ocha_external_id')
    list_filter = ('partner_type', 'country_code')
    search_fields = ('title', 'short_title', 'alternate_title', 'country_code')
    raw_id_fields = ['clusters', ]


class PartnerActivityProjectContextInline(admin.StackedInline):
    model = PartnerActivityProjectContext
    extra = 1
    min_num = 0
    raw_id_fields = [
        'project',
    ]


class PartnerProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'partner', 'description')
    list_filter = ('status',)
    search_fields = ('title', 'description', 'additional_information', 'partner__title',)
    raw_id_fields = [
        'partner',
        'clusters',
        'locations',
        'additional_partners',
    ]


class PartnerActivityAdmin(admin.ModelAdmin):
    inlines = (PartnerActivityProjectContextInline, )
    list_display = ('title', 'partner', 'cluster_activity',
                    'cluster_objective',)
    search_fields = ('title', 'partner__title', 'cluster_activity__title', 'cluster_objective__title')
    raw_id_fields = [
        'cluster_activity',
        'cluster_objective',
        'locations',
        'partner',
    ]


class PartnerProjectFundingAdmin(admin.ModelAdmin):
    list_display = (
        'project', 'required_funding', 'total_funding', 'funding_gap',
    )
    search_fields = ('project__title', )
    raw_id_fields = ('project',)


admin.site.register(Partner, PartnerAdmin)
admin.site.register(PartnerProject, PartnerProjectAdmin)
admin.site.register(PartnerActivity, PartnerActivityAdmin)
admin.site.register(PartnerProjectFunding, PartnerProjectFundingAdmin)
