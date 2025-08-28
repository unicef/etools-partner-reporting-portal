from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from etools_prp.apps.account.forms import CustomUserCreationForm, UserAdminForm
from etools_prp.apps.account.models import User, UserProfile
from etools_prp.apps.core.models import Realm


class RealmInline(admin.StackedInline):
    verbose_name_plural = "User Realms"

    model = Realm
    raw_id_fields = ('workspace', 'partner')
    extra = 0


class ReadOnlyRealmInline(admin.StackedInline):
    verbose_name_plural = "User Realms (Read Only - 10+ realms)"

    model = Realm
    fields = ('user', 'workspace', 'partner', 'group', 'is_active')
    readonly_fields = ('user', 'workspace', 'partner', 'group', 'is_active')
    extra = 0
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


class CustomUserAdmin(UserAdmin):
    list_display = (
        'email', 'username', 'workspace', 'partner', 'realm_count', 'last_login', 'date_joined',
    )
    list_filter = (
        'is_superuser', 'is_staff', 'is_active',
    )
    search_fields = ('email', 'username',)
    exclude = ('date_joined', 'last_login')
    raw_id_fields = ('partner', 'workspace')

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
            'Current Context', {
                'fields': ('workspace', 'partner')
            }
        ),
        (
            'Django Permissions', {
                'fields': ('is_active', 'is_staff', 'is_superuser', 'user_permissions')
            }
        ),
    )

    filter_horizontal = ('user_permissions',)

    def get_inlines(self, request, obj):
        """Show realm inline as read-only for users with more than 10 realms"""
        if obj and obj.realms.count() > 10:
            return [ReadOnlyRealmInline]  # Read-only inline for users with many realms
        return [RealmInline]

    def country(self, obj):
        if obj.partner:
            return ', '.join(obj.partner.programmedocument_set.distinct().values_list(
                'workspace__title', flat=True).distinct().order_by())

    country.short_description = 'Workspace'

    def realm_count(self, obj):
        count = obj.realms.count()
        return count
    realm_count.short_description = 'Realms'


admin.site.register(User, CustomUserAdmin)
admin.site.register(UserProfile)
