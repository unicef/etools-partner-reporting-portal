from django.contrib import admin

from .models import (
    Activity,
    PartnerActivity,
)

admin.site.register(Activity)
admin.site.register(PartnerActivity)