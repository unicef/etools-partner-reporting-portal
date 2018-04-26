from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from account.forms import UserAdminForm, CustomUserCreationForm
from account.models import (
    User,
    UserProfile,
)


class CustomUserAdmin(UserAdmin):
    list_display = (
        'email', 'username', 'last_login', 'date_joined', 'partner',
    )
    list_filter = (
        'is_superuser', 'is_staff', 'is_active', 'groups', 'workspaces', 'partner', 'imo_clusters'
    )
    search_fields = ('email', 'username',)
    exclude = ('date_joined', 'last_login')

    add_form = CustomUserCreationForm
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2'),
        }),
        ('Personal Info', {
            'classes': ('wide',),
            'fields': ('first_name', 'last_name'),
        }),
    )

    form = UserAdminForm
    fieldsets = (
        (
            None, {
                'fields': ('username', 'password')
            }
        ),
        (
            'Personal info', {
                'fields': ('first_name', 'last_name', 'email')
            }
        ),
        (
            'Organization info', {
                'fields': ('partner', 'organization')
            }
        ),
        (
            'Application Permissions', {
                'fields': ('groups', 'workspaces', 'imo_clusters',)
            }
        ),
        (
            'Django Permissions', {
                'fields': ('is_active', 'is_staff', 'is_superuser', 'user_permissions')
            }
        ),
    )


admin.site.register(User, CustomUserAdmin)
admin.site.register(UserProfile)
