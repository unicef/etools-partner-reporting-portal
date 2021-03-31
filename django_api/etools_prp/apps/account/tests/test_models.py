from django.core.exceptions import ValidationError
from django.test import TestCase

from etools_prp.apps.core.common import PRP_ROLE_TYPES, USER_TYPES
from etools_prp.apps.core.tests import factories


class TestUser(TestCase):
    def setUp(self):
        self.country = factories.CountryFactory()
        self.workspace = factories.WorkspaceFactory(
            title=self.country.name,
            countries=[self.country, ],
        )

    def test_user_type(self):
        user = factories.PartnerUserFactory()
        self.assertFalse(user.prp_roles.exists())
        self.assertIsNone(user.user_type)

        # partner role
        factories.IPPRPRoleFactory(user=user, workspace=self.workspace)
        self.assertEqual(user.user_type, USER_TYPES.partner)

        # cluster im role
        factories.ClusterPRPRoleFactory(
            user=user,
            workspace=self.workspace,
            role=PRP_ROLE_TYPES.cluster_imo,
        )
        self.assertEqual(user.user_type, USER_TYPES.imo)

        # cluster admin
        factories.ClusterPRPRoleFactory(
            user=user,
            workspace=self.workspace,
            role=PRP_ROLE_TYPES.cluster_system_admin,
        )
        self.assertEqual(user.user_type, USER_TYPES.cluster_admin)

    def test_save(self):
        user = factories.PartnerUserFactory()
        user.email = "normal@example.com"
        user.save()

        user.email = "NotNormal@example.com"
        self.assertRaises(ValidationError, user.save)
