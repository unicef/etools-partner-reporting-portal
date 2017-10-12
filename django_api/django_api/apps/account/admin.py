from django.contrib import admin

from .models import (
    User,
    UserProfile,
)

class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username',)
    list_filter = ('is_superuser', 'is_staff', 'is_active', 'partner',)
    search_fields = ('email', 'username',)

admin.site.register(User, UserAdmin)
admin.site.register(UserProfile)
