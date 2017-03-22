from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

from .models import UserProfile


# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User)
admin.site.register(UserProfile)
