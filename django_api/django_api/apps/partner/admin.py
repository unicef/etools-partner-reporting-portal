from django.contrib import admin

from .models import (
    Partner,
    PartnerProject,
    PartnerActivity,
)


class PartnerAdmin(admin.ModelAdmin):
    list_display = ('title', 'partner_type', 'email', 'city', 'rating')
    list_filter = ('partner_type', 'city')
    search_fields = ('title', 'short_title', 'alternate_title')


class PartnerProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'start_date', 'end_date', 'status')
    list_filter = ('status', 'partner')
    search_fields = ('title', 'description', 'additional_information')


admin.site.register(Partner, PartnerAdmin)
admin.site.register(PartnerProject, PartnerProjectAdmin)
admin.site.register(PartnerActivity)
