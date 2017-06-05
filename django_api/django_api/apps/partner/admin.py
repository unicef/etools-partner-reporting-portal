from django.contrib import admin

from .models import (
    Partner,
    PartnerProject,
    PartnerActivity,
)

admin.site.register(Partner)
admin.site.register(PartnerProject)
admin.site.register(PartnerActivity)