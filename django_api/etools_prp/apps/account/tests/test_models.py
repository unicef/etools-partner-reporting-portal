from django.core.exceptions import ValidationError
from django.test import TestCase

from etools_prp.apps.core.common import PRP_ROLE_TYPES, USER_TYPES
from etools_prp.apps.core.tests import factories


class TestUser(TestCase):
    def setUp(self):
        self.workspace = factories.WorkspaceFactory()

    def test_user_type(self):
        # partner role
        user = factories.PartnerUserFactory()
        self.assertTrue(user.prp_roles.count(), 1)
        self.assertEqual(user.user_type, USER_TYPES.partner)

        # cluster im role
        user = factories.PartnerUserFactory(realms__data=[PRP_ROLE_TYPES.cluster_imo])
        self.assertEqual(user.user_type, USER_TYPES.imo)

        # cluster admin
        user = factories.PartnerUserFactory(realms__data=[PRP_ROLE_TYPES.cluster_system_admin])
        self.assertEqual(user.user_type, USER_TYPES.cluster_admin)

    def test_save(self):
        user = factories.PartnerUserFactory()
        user.email = "normal@example.com"
        user.save()

        user.email = "NotNormal@example.com"
        self.assertRaises(ValidationError, user.save)
