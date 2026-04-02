from django.contrib.admin.sites import AdminSite
from django.test import TestCase

from etools_prp.apps.account.admin import CustomUserAdmin
from etools_prp.apps.account.models import User


class TestCustomUserAdminListFilter(TestCase):
    def setUp(self):
        self.site = AdminSite()
        self.admin = CustomUserAdmin(User, self.site)

    def test_list_filter_includes_workspace_and_partner(self):
        list_filter = self.admin.list_filter

        self.assertIn('workspace', list_filter)
        self.assertIn('partner', list_filter)
