from django.contrib import admin

from .models import (
    Partner,
    PartnerProject,
    PartnerActivity,
    PartnerProjectFunding)


class PartnerAdmin(admin.ModelAdmin):
    list_display = ('title', 'partner_type', 'email', 'country_code', 'rating',
                    'external_id', 'ocha_external_id')
    list_filter = ('partner_type', 'country_code')
    search_fields = ('title', 'short_title', 'alternate_title')


class PartnerProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'partner', 'description', 'start_date',
                    'end_date', 'status',)
    list_filter = ('status', 'partner', 'clusters')
    search_fields = ('title', 'description', 'additional_information')


class PartnerActivityAdmin(admin.ModelAdmin):
    list_display = ('title', 'partner', 'project', 'cluster_activity',
                    'cluster_objective', 'start_date', 'end_date', 'status',)
    list_filter = ('status', 'partner', 'project')
    search_fields = ('title', )


class PartnerProjectFundingAdmin(admin.ModelAdmin):
    list_display = (
        'project', 'required_funding', 'total_funding', 'funding_gap'
    )
    search_fields = ('project__title', )


admin.site.register(Partner, PartnerAdmin)
admin.site.register(PartnerProject, PartnerProjectAdmin)
admin.site.register(PartnerActivity, PartnerActivityAdmin)
admin.site.register(PartnerProjectFunding, PartnerProjectFundingAdmin)
