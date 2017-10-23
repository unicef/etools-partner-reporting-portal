from django.contrib import admin

from .forms import UserAdminForm
from .models import (
    User,
    UserProfile,
)


class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'last_login', 'date_joined',
                    'partner',)
    list_filter = ('is_superuser', 'is_staff', 'is_active', 'workspaces',
                   'partner', 'imo_clusters')
    search_fields = ('email', 'username',)
    exclude = ('password', 'date_joined', 'last_login')
    form = UserAdminForm


admin.site.register(User, UserAdmin)
admin.site.register(UserProfile)
