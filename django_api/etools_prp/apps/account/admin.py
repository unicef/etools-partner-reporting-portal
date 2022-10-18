from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from etools_prp.apps.account.forms import CustomUserCreationForm, UserAdminForm
from etools_prp.apps.account.models import User, UserProfile


class CustomUserAdmin(UserAdmin):
    list_display = (
        'email', 'username', 'country', 'partner', 'last_login', 'date_joined',
    )
    list_filter = (
        'is_superuser', 'is_staff', 'is_active',
    )
    search_fields = ('email', 'username',)
    exclude = ('date_joined', 'last_login')
    raw_id_fields = ('partner',)

    add_form = CustomUserCreationForm
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'email'),
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
            'Django Permissions', {
                'fields': ('is_active', 'is_staff', 'is_superuser', 'user_permissions')
            }
        ),
    )

    filter_horizontal = ('user_permissions',)

    def country(self, obj):
        if obj.partner:
            return ', '.join(obj.partner.programmedocument_set.distinct().values_list(
                'workspace__title', flat=True).distinct().order_by())

    country.short_description = 'Workspace'


admin.site.register(User, CustomUserAdmin)
admin.site.register(UserProfile)
