from django.urls import reverse

from rest_framework.test import APIRequestFactory, APITestCase

from etools_prp.apps.account.models import User
from etools_prp.apps.cluster.models import Cluster
from etools_prp.apps.core.common import PRP_ROLE_TYPES
from etools_prp.apps.core.models import PRPRole, Workspace
from etools_prp.apps.id_management.permissions import RoleGroupCreateUpdateDestroyPermission
from etools_prp.apps.partner.models import Partner


class TestUpdateDestroyPermissionsForRoleClusterMember(APITestCase):
    def setUp(self):
        self.roles_without_permission = [PRP_ROLE_TYPES.cluster_coordinator, PRP_ROLE_TYPES.cluster_viewer,
                                         PRP_ROLE_TYPES.ip_authorized_officer, PRP_ROLE_TYPES.ip_admin,
                                         PRP_ROLE_TYPES.ip_editor, PRP_ROLE_TYPES.ip_viewer]

        self.perm = RoleGroupCreateUpdateDestroyPermission()
        self.factory = APIRequestFactory()
        self.partner = Partner.objects.create()
        self.cluster = Cluster.objects.create()
        cluster_user = User.objects.create_user(email='cluster_user@example.com', username='cluster_user_test',
                                                password='pass', partner=self.partner)
        self.role = PRPRole.objects.create(user=cluster_user, role=PRP_ROLE_TYPES.cluster_member, cluster=self.cluster)

    # Tests when request user role is in roles_without_permission:

    def test_permission_as_role_without_permission__partner_match(self):
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)

        for role_without_permission in self.roles_without_permission:
            request_user_role = role_without_permission
            prp_role = PRPRole.objects.create(user=request_user, role=request_user_role)

            # PATCH
            request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user

            roles_to_assign = [
                (PRP_ROLE_TYPES.cluster_system_admin, False),
                (PRP_ROLE_TYPES.cluster_imo, False),
                (PRP_ROLE_TYPES.cluster_coordinator, False),
                (PRP_ROLE_TYPES.cluster_member, False),
                (PRP_ROLE_TYPES.cluster_viewer, False),
                (PRP_ROLE_TYPES.ip_authorized_officer, False),
                (PRP_ROLE_TYPES.ip_admin, False),
                (PRP_ROLE_TYPES.ip_editor, False),
                (PRP_ROLE_TYPES.ip_viewer, False),
            ]

            for role_to_assign, return_value in roles_to_assign:
                request.data = {'role': role_to_assign}
                self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

            # DELETE
            request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user
            request.data = {}
            self.assertFalse(self.perm.has_object_permission(request, None, self.role))

            prp_role.delete()

    def test_permission_as_role_without_permission__no_partner_match(self):

        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')

        for role_without_permission in self.roles_without_permission:
            request_user_role = role_without_permission
            prp_role = PRPRole.objects.create(user=request_user, role=request_user_role)

            # PATCH
            request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user

            roles_to_assign = [
                (PRP_ROLE_TYPES.cluster_system_admin, False),
                (PRP_ROLE_TYPES.cluster_imo, False),
                (PRP_ROLE_TYPES.cluster_coordinator, False),
                (PRP_ROLE_TYPES.cluster_member, False),
                (PRP_ROLE_TYPES.cluster_viewer, False),
                (PRP_ROLE_TYPES.ip_authorized_officer, False),
                (PRP_ROLE_TYPES.ip_admin, False),
                (PRP_ROLE_TYPES.ip_editor, False),
                (PRP_ROLE_TYPES.ip_viewer, False),
            ]

            for role_to_assign, return_value in roles_to_assign:
                request.data = {'role': role_to_assign}
                self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

            # DELETE
            request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user
            request.data = {}
            self.assertFalse(self.perm.has_object_permission(request, None, self.role))

            prp_role.delete()

    # Tests when request user role is cluster_imo:

    def test_permission_as_cluster_imo__cluster_match(self):
        request_user_role = PRP_ROLE_TYPES.cluster_imo
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')
        PRPRole.objects.create(user=request_user, role=request_user_role, cluster=self.cluster)  # cluster assigned

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, True),
            (PRP_ROLE_TYPES.cluster_member, False),  # cluster_member to cluster_member change
            (PRP_ROLE_TYPES.cluster_viewer, True),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertTrue(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_cluster_imo__no_cluster_match(self):
        request_user_role = PRP_ROLE_TYPES.cluster_imo
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)
        PRPRole.objects.create(user=request_user, role=request_user_role)  # no cluster assigned

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertFalse(self.perm.has_object_permission(request, None, self.role))

    # Tests when request user role is cluster_system_admin:

    def test_permission_as_cluster_system_admin(self):
        request_user_role = PRP_ROLE_TYPES.cluster_system_admin
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')
        PRPRole.objects.create(user=request_user, role=request_user_role)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, True),
            (PRP_ROLE_TYPES.cluster_imo, True),
            (PRP_ROLE_TYPES.cluster_coordinator, True),
            (PRP_ROLE_TYPES.cluster_member, False),  # cluster_member to cluster_member change
            (PRP_ROLE_TYPES.cluster_viewer, True),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertTrue(self.perm.has_object_permission(request, None, self.role))


class TestUpdateDestroyPermissionsForRoleClusterViewer(APITestCase):
    def setUp(self):
        self.roles_without_permission = [PRP_ROLE_TYPES.cluster_coordinator, PRP_ROLE_TYPES.cluster_viewer,
                                         PRP_ROLE_TYPES.ip_authorized_officer, PRP_ROLE_TYPES.ip_admin,
                                         PRP_ROLE_TYPES.ip_editor, PRP_ROLE_TYPES.ip_viewer]

        self.perm = RoleGroupCreateUpdateDestroyPermission()
        self.factory = APIRequestFactory()
        self.partner = Partner.objects.create()
        self.cluster = Cluster.objects.create()
        cluster_user = User.objects.create_user(email='cluster_user@example.com', username='cluster_user_test',
                                                password='pass', partner=self.partner)
        self.role = PRPRole.objects.create(user=cluster_user, role=PRP_ROLE_TYPES.cluster_viewer, cluster=self.cluster)

    # Tests when request user role is in roles_without_permission:

    def test_permission_as_role_without_permission__partner_match(self):
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)

        for role_without_permission in self.roles_without_permission:
            request_user_role = role_without_permission
            prp_role = PRPRole.objects.create(user=request_user, role=request_user_role)

            # PATCH
            request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user

            roles_to_assign = [
                (PRP_ROLE_TYPES.cluster_system_admin, False),
                (PRP_ROLE_TYPES.cluster_imo, False),
                (PRP_ROLE_TYPES.cluster_coordinator, False),
                (PRP_ROLE_TYPES.cluster_member, False),
                (PRP_ROLE_TYPES.cluster_viewer, False),
                (PRP_ROLE_TYPES.ip_authorized_officer, False),
                (PRP_ROLE_TYPES.ip_admin, False),
                (PRP_ROLE_TYPES.ip_editor, False),
                (PRP_ROLE_TYPES.ip_viewer, False),
            ]

            for role_to_assign, return_value in roles_to_assign:
                request.data = {'role': role_to_assign}
                self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

            # DELETE
            request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user
            request.data = {}
            self.assertFalse(self.perm.has_object_permission(request, None, self.role))

            prp_role.delete()

    def test_permission_as_role_without_permission__no_partner_match(self):
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')

        for role_without_permission in self.roles_without_permission:
            request_user_role = role_without_permission
            prp_role = PRPRole.objects.create(user=request_user, role=request_user_role)

            # PATCH
            request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user

            roles_to_assign = [
                (PRP_ROLE_TYPES.cluster_system_admin, False),
                (PRP_ROLE_TYPES.cluster_imo, False),
                (PRP_ROLE_TYPES.cluster_coordinator, False),
                (PRP_ROLE_TYPES.cluster_member, False),
                (PRP_ROLE_TYPES.cluster_viewer, False),
                (PRP_ROLE_TYPES.ip_authorized_officer, False),
                (PRP_ROLE_TYPES.ip_admin, False),
                (PRP_ROLE_TYPES.ip_editor, False),
                (PRP_ROLE_TYPES.ip_viewer, False),
            ]

            for role_to_assign, return_value in roles_to_assign:
                request.data = {'role': role_to_assign}
                self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

            # DELETE
            request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user
            request.data = {}
            self.assertFalse(self.perm.has_object_permission(request, None, self.role))

            prp_role.delete()

    # Tests when request user role is cluster_imo:

    def test_permission_as_cluster_imo__cluster_match(self):
        request_user_role = PRP_ROLE_TYPES.cluster_imo
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')
        PRPRole.objects.create(user=request_user, role=request_user_role, cluster=self.cluster)  # cluster assigned

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, True),
            (PRP_ROLE_TYPES.cluster_member, True),
            (PRP_ROLE_TYPES.cluster_viewer, False),  # cluster_viewer to cluster_viewer change
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertTrue(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_cluster_imo__no_cluster_match(self):
        request_user_role = PRP_ROLE_TYPES.cluster_imo
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)
        PRPRole.objects.create(user=request_user, role=request_user_role)  # no cluster assigned

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertFalse(self.perm.has_object_permission(request, None, self.role))

    # Tests when request user role is cluster_system_admin:

    def test_permission_as_cluster_system_admin(self):
        request_user_role = PRP_ROLE_TYPES.cluster_system_admin
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')
        PRPRole.objects.create(user=request_user, role=request_user_role)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, True),
            (PRP_ROLE_TYPES.cluster_imo, True),
            (PRP_ROLE_TYPES.cluster_coordinator, True),
            (PRP_ROLE_TYPES.cluster_member, True),
            (PRP_ROLE_TYPES.cluster_viewer, False),  # cluster_viewer to cluster_viewer change
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertTrue(self.perm.has_object_permission(request, None, self.role))


class TestUpdateDestroyPermissionsForRoleClusterIMO(APITestCase):
    def setUp(self):
        self.roles_without_permission = [PRP_ROLE_TYPES.cluster_imo, PRP_ROLE_TYPES.cluster_coordinator,
                                         PRP_ROLE_TYPES.cluster_viewer,
                                         PRP_ROLE_TYPES.ip_authorized_officer, PRP_ROLE_TYPES.ip_admin,
                                         PRP_ROLE_TYPES.ip_editor, PRP_ROLE_TYPES.ip_viewer]

        self.perm = RoleGroupCreateUpdateDestroyPermission()
        self.factory = APIRequestFactory()
        self.partner = Partner.objects.create()
        self.cluster = Cluster.objects.create()
        cluster_user = User.objects.create_user(email='cluster_user@example.com', username='cluster_user_test',
                                                password='pass', partner=self.partner)
        self.role = PRPRole.objects.create(user=cluster_user, role=PRP_ROLE_TYPES.cluster_imo, cluster=self.cluster)

    # Tests when request user role is in roles_without_permission:

    def test_permission_as_role_without_permission__partner_match(self):
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)

        for role_without_permission in self.roles_without_permission:
            request_user_role = role_without_permission
            prp_role = PRPRole.objects.create(user=request_user, role=request_user_role)

            # PATCH
            request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user

            roles_to_assign = [
                (PRP_ROLE_TYPES.cluster_system_admin, False),
                (PRP_ROLE_TYPES.cluster_imo, False),
                (PRP_ROLE_TYPES.cluster_coordinator, False),
                (PRP_ROLE_TYPES.cluster_member, False),
                (PRP_ROLE_TYPES.cluster_viewer, False),
                (PRP_ROLE_TYPES.ip_authorized_officer, False),
                (PRP_ROLE_TYPES.ip_admin, False),
                (PRP_ROLE_TYPES.ip_editor, False),
                (PRP_ROLE_TYPES.ip_viewer, False),
            ]

            for role_to_assign, return_value in roles_to_assign:
                request.data = {'role': role_to_assign}
                self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

            # DELETE
            request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user
            request.data = {}
            self.assertFalse(self.perm.has_object_permission(request, None, self.role))

            prp_role.delete()

    def test_permission_as_role_without_permission__no_partner_match(self):
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')

        for role_without_permission in self.roles_without_permission:
            request_user_role = role_without_permission
            prp_role = PRPRole.objects.create(user=request_user, role=request_user_role)

            # PATCH
            request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user

            roles_to_assign = [
                (PRP_ROLE_TYPES.cluster_system_admin, False),
                (PRP_ROLE_TYPES.cluster_imo, False),
                (PRP_ROLE_TYPES.cluster_coordinator, False),
                (PRP_ROLE_TYPES.cluster_member, False),
                (PRP_ROLE_TYPES.cluster_viewer, False),
                (PRP_ROLE_TYPES.ip_authorized_officer, False),
                (PRP_ROLE_TYPES.ip_admin, False),
                (PRP_ROLE_TYPES.ip_editor, False),
                (PRP_ROLE_TYPES.ip_viewer, False),
            ]

            for role_to_assign, return_value in roles_to_assign:
                request.data = {'role': role_to_assign}
                self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

            # DELETE
            request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user
            request.data = {}
            self.assertFalse(self.perm.has_object_permission(request, None, self.role))

            prp_role.delete()

    def test_permission_as_cluster_system_admin(self):
        request_user_role = PRP_ROLE_TYPES.cluster_system_admin
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')
        PRPRole.objects.create(user=request_user, role=request_user_role)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, True),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, True),
            (PRP_ROLE_TYPES.cluster_member, True),
            (PRP_ROLE_TYPES.cluster_viewer, True),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertTrue(self.perm.has_object_permission(request, None, self.role))


class TestUpdateDestroyPermissionsForRoleClusterSystemAdmin(APITestCase):
    def setUp(self):
        self.roles_without_permission = [PRP_ROLE_TYPES.cluster_system_admin, PRP_ROLE_TYPES.cluster_imo,
                                         PRP_ROLE_TYPES.cluster_coordinator, PRP_ROLE_TYPES.cluster_viewer,
                                         PRP_ROLE_TYPES.ip_authorized_officer, PRP_ROLE_TYPES.ip_admin,
                                         PRP_ROLE_TYPES.ip_editor, PRP_ROLE_TYPES.ip_viewer]

        self.perm = RoleGroupCreateUpdateDestroyPermission()
        self.factory = APIRequestFactory()
        self.partner = Partner.objects.create()
        self.cluster = Cluster.objects.create()
        cluster_user = User.objects.create_user(email='cluster_user@example.com', username='cluster_user_test',
                                                password='pass', partner=self.partner)
        self.role = PRPRole.objects.create(user=cluster_user, role=PRP_ROLE_TYPES.cluster_system_admin,
                                           cluster=self.cluster)

    def test_permission_as_role_without_permission__partner_match(self):
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)

        for role_without_permission in self.roles_without_permission:
            request_user_role = role_without_permission
            prp_role = PRPRole.objects.create(user=request_user, role=request_user_role)

            # PATCH
            request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user

            roles_to_assign = [
                (PRP_ROLE_TYPES.cluster_system_admin, False),
                (PRP_ROLE_TYPES.cluster_imo, False),
                (PRP_ROLE_TYPES.cluster_coordinator, False),
                (PRP_ROLE_TYPES.cluster_member, False),
                (PRP_ROLE_TYPES.cluster_viewer, False),
                (PRP_ROLE_TYPES.ip_authorized_officer, False),
                (PRP_ROLE_TYPES.ip_admin, False),
                (PRP_ROLE_TYPES.ip_editor, False),
                (PRP_ROLE_TYPES.ip_viewer, False),
            ]

            for role_to_assign, return_value in roles_to_assign:
                request.data = {'role': role_to_assign}
                self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

            # DELETE
            request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user
            request.data = {}
            self.assertFalse(self.perm.has_object_permission(request, None, self.role))

            prp_role.delete()

    def test_permission_as_role_without_permission__no_partner_match(self):
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')

        for role_without_permission in self.roles_without_permission:
            request_user_role = role_without_permission
            prp_role = PRPRole.objects.create(user=request_user, role=request_user_role)

            # PATCH
            request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user

            roles_to_assign = [
                (PRP_ROLE_TYPES.cluster_system_admin, False),
                (PRP_ROLE_TYPES.cluster_imo, False),
                (PRP_ROLE_TYPES.cluster_coordinator, False),
                (PRP_ROLE_TYPES.cluster_member, False),
                (PRP_ROLE_TYPES.cluster_viewer, False),
                (PRP_ROLE_TYPES.ip_authorized_officer, False),
                (PRP_ROLE_TYPES.ip_admin, False),
                (PRP_ROLE_TYPES.ip_editor, False),
                (PRP_ROLE_TYPES.ip_viewer, False),
            ]

            for role_to_assign, return_value in roles_to_assign:
                request.data = {'role': role_to_assign}
                self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

            # DELETE
            request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user
            request.data = {}
            self.assertFalse(self.perm.has_object_permission(request, None, self.role))

            prp_role.delete()


class TestUpdateDestroyPermissionsForIPAuthorizedOfficer(APITestCase):
    def setUp(self):
        self.roles_without_permission = [PRP_ROLE_TYPES.cluster_system_admin, PRP_ROLE_TYPES.cluster_imo,
                                         PRP_ROLE_TYPES.cluster_coordinator, PRP_ROLE_TYPES.cluster_viewer,
                                         PRP_ROLE_TYPES.ip_authorized_officer, PRP_ROLE_TYPES.ip_admin,
                                         PRP_ROLE_TYPES.ip_editor, PRP_ROLE_TYPES.ip_viewer]

        self.perm = RoleGroupCreateUpdateDestroyPermission()
        self.factory = APIRequestFactory()
        self.partner = Partner.objects.create()
        self.cluster = Cluster.objects.create()
        cluster_user = User.objects.create_user(email='cluster_user@example.com', username='cluster_user_test',
                                                password='pass', partner=self.partner)
        self.role = PRPRole.objects.create(user=cluster_user, role=PRP_ROLE_TYPES.ip_authorized_officer,
                                           cluster=self.cluster)

    def test_permission_as_role_without_permission__partner_match(self):
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)

        for role_without_permission in self.roles_without_permission:
            request_user_role = role_without_permission
            prp_role = PRPRole.objects.create(user=request_user, role=request_user_role)

            # PATCH
            request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user

            roles_to_assign = [
                (PRP_ROLE_TYPES.cluster_system_admin, False),
                (PRP_ROLE_TYPES.cluster_imo, False),
                (PRP_ROLE_TYPES.cluster_coordinator, False),
                (PRP_ROLE_TYPES.cluster_member, False),
                (PRP_ROLE_TYPES.cluster_viewer, False),
                (PRP_ROLE_TYPES.ip_authorized_officer, False),
                (PRP_ROLE_TYPES.ip_admin, False),
                (PRP_ROLE_TYPES.ip_editor, False),
                (PRP_ROLE_TYPES.ip_viewer, False),
            ]

            for role_to_assign, return_value in roles_to_assign:
                request.data = {'role': role_to_assign}
                self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

            # DELETE
            request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user
            request.data = {}
            self.assertFalse(self.perm.has_object_permission(request, None, self.role))

            prp_role.delete()

    def test_permission_as_role_without_permission__no_partner_match(self):
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')

        for role_without_permission in self.roles_without_permission:
            request_user_role = role_without_permission
            prp_role = PRPRole.objects.create(user=request_user, role=request_user_role)

            # PATCH
            request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user

            roles_to_assign = [
                (PRP_ROLE_TYPES.cluster_system_admin, False),
                (PRP_ROLE_TYPES.cluster_imo, False),
                (PRP_ROLE_TYPES.cluster_coordinator, False),
                (PRP_ROLE_TYPES.cluster_member, False),
                (PRP_ROLE_TYPES.cluster_viewer, False),
                (PRP_ROLE_TYPES.ip_authorized_officer, False),
                (PRP_ROLE_TYPES.ip_admin, False),
                (PRP_ROLE_TYPES.ip_editor, False),
                (PRP_ROLE_TYPES.ip_viewer, False),
            ]

            for role_to_assign, return_value in roles_to_assign:
                request.data = {'role': role_to_assign}
                self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

            # DELETE
            request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user
            request.data = {}
            self.assertFalse(self.perm.has_object_permission(request, None, self.role))

            prp_role.delete()


class TestUpdateDestroyPermissionsForIPAdmin(APITestCase):
    def setUp(self):
        self.roles_without_permission = [PRP_ROLE_TYPES.cluster_system_admin, PRP_ROLE_TYPES.cluster_imo,
                                         PRP_ROLE_TYPES.cluster_coordinator, PRP_ROLE_TYPES.cluster_viewer,
                                         PRP_ROLE_TYPES.ip_editor, PRP_ROLE_TYPES.ip_viewer]

        self.perm = RoleGroupCreateUpdateDestroyPermission()
        self.factory = APIRequestFactory()
        self.partner = Partner.objects.create()
        self.cluster = Cluster.objects.create()
        self.workspace = Workspace.objects.create()
        cluster_user = User.objects.create_user(email='cluster_user@example.com', username='cluster_user_test',
                                                password='pass', partner=self.partner)
        self.role = PRPRole.objects.create(user=cluster_user, role=PRP_ROLE_TYPES.ip_admin,
                                           cluster=self.cluster, workspace=self.workspace)

    def test_permission_as_role_without_permission__partner_match__workspace_match(self):
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)

        for role_without_permission in self.roles_without_permission:
            request_user_role = role_without_permission
            prp_role = PRPRole.objects.create(user=request_user, role=request_user_role, workspace=self.workspace)

            # PATCH
            request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user

            roles_to_assign = [
                (PRP_ROLE_TYPES.cluster_system_admin, False),
                (PRP_ROLE_TYPES.cluster_imo, False),
                (PRP_ROLE_TYPES.cluster_coordinator, False),
                (PRP_ROLE_TYPES.cluster_member, False),
                (PRP_ROLE_TYPES.cluster_viewer, False),
                (PRP_ROLE_TYPES.ip_authorized_officer, False),
                (PRP_ROLE_TYPES.ip_admin, False),
                (PRP_ROLE_TYPES.ip_editor, False),
                (PRP_ROLE_TYPES.ip_viewer, False),
            ]

            for role_to_assign, return_value in roles_to_assign:
                request.data = {'role': role_to_assign}
                self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

            # DELETE
            request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user
            request.data = {}
            self.assertFalse(self.perm.has_object_permission(request, None, self.role))

            prp_role.delete()

    def test_permission_as_role_without_permission__no_partner_match__no_workspace_match(self):
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')

        for role_without_permission in self.roles_without_permission:
            request_user_role = role_without_permission
            prp_role = PRPRole.objects.create(user=request_user, role=request_user_role)

            # PATCH
            request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user

            roles_to_assign = [
                (PRP_ROLE_TYPES.cluster_system_admin, False),
                (PRP_ROLE_TYPES.cluster_imo, False),
                (PRP_ROLE_TYPES.cluster_coordinator, False),
                (PRP_ROLE_TYPES.cluster_member, False),
                (PRP_ROLE_TYPES.cluster_viewer, False),
                (PRP_ROLE_TYPES.ip_authorized_officer, False),
                (PRP_ROLE_TYPES.ip_admin, False),
                (PRP_ROLE_TYPES.ip_editor, False),
                (PRP_ROLE_TYPES.ip_viewer, False),
            ]

            for role_to_assign, return_value in roles_to_assign:
                request.data = {'role': role_to_assign}
                self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

            # DELETE
            request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user
            request.data = {}
            self.assertFalse(self.perm.has_object_permission(request, None, self.role))

            prp_role.delete()

    def test_permission_as_ip_authorized_officer__partner_match__workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_authorized_officer
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)
        PRPRole.objects.create(user=request_user, role=request_user_role, workspace=self.workspace)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, True),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, True),
            (PRP_ROLE_TYPES.ip_viewer, True),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertTrue(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_ip_authorized_officer__partner_match__no_workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_authorized_officer
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)
        PRPRole.objects.create(user=request_user, role=request_user_role)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertFalse(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_ip_authorized_officer__no_partner_match__no_workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_authorized_officer
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')
        PRPRole.objects.create(user=request_user, role=request_user_role)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertFalse(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_ip_authorized_officer__no_partner_match__workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_authorized_officer
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')
        PRPRole.objects.create(user=request_user, role=request_user_role, workspace=self.workspace)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertFalse(self.perm.has_object_permission(request, None, self.role))


class TestUpdateDestroyPermissionsForIPEditor(APITestCase):
    def setUp(self):
        self.roles_without_permission = [PRP_ROLE_TYPES.cluster_system_admin, PRP_ROLE_TYPES.cluster_imo,
                                         PRP_ROLE_TYPES.cluster_coordinator, PRP_ROLE_TYPES.cluster_viewer,
                                         PRP_ROLE_TYPES.ip_editor, PRP_ROLE_TYPES.ip_viewer]

        self.perm = RoleGroupCreateUpdateDestroyPermission()
        self.factory = APIRequestFactory()
        self.partner = Partner.objects.create()
        self.cluster = Cluster.objects.create()
        self.workspace = Workspace.objects.create()
        cluster_user = User.objects.create_user(email='cluster_user@example.com', username='cluster_user_test',
                                                password='pass', partner=self.partner)
        self.role = PRPRole.objects.create(user=cluster_user, role=PRP_ROLE_TYPES.ip_editor,
                                           cluster=self.cluster, workspace=self.workspace)

    def test_permission_as_role_without_permission__partner_match__workspace_match(self):
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)

        for role_without_permission in self.roles_without_permission:
            request_user_role = role_without_permission
            prp_role = PRPRole.objects.create(user=request_user, role=request_user_role, workspace=self.workspace)

            # PATCH
            request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user

            roles_to_assign = [
                (PRP_ROLE_TYPES.cluster_system_admin, False),
                (PRP_ROLE_TYPES.cluster_imo, False),
                (PRP_ROLE_TYPES.cluster_coordinator, False),
                (PRP_ROLE_TYPES.cluster_member, False),
                (PRP_ROLE_TYPES.cluster_viewer, False),
                (PRP_ROLE_TYPES.ip_authorized_officer, False),
                (PRP_ROLE_TYPES.ip_admin, False),
                (PRP_ROLE_TYPES.ip_editor, False),
                (PRP_ROLE_TYPES.ip_viewer, False),
            ]

            for role_to_assign, return_value in roles_to_assign:
                request.data = {'role': role_to_assign}
                self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

            # DELETE
            request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user
            request.data = {}
            self.assertFalse(self.perm.has_object_permission(request, None, self.role))

            prp_role.delete()

    def test_permission_as_role_without_permission__no_partner_match__no_workspace_match(self):
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')

        for role_without_permission in self.roles_without_permission:
            request_user_role = role_without_permission
            prp_role = PRPRole.objects.create(user=request_user, role=request_user_role)

            # PATCH
            request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user

            roles_to_assign = [
                (PRP_ROLE_TYPES.cluster_system_admin, False),
                (PRP_ROLE_TYPES.cluster_imo, False),
                (PRP_ROLE_TYPES.cluster_coordinator, False),
                (PRP_ROLE_TYPES.cluster_member, False),
                (PRP_ROLE_TYPES.cluster_viewer, False),
                (PRP_ROLE_TYPES.ip_authorized_officer, False),
                (PRP_ROLE_TYPES.ip_admin, False),
                (PRP_ROLE_TYPES.ip_editor, False),
                (PRP_ROLE_TYPES.ip_viewer, False),
            ]

            for role_to_assign, return_value in roles_to_assign:
                request.data = {'role': role_to_assign}
                self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

            # DELETE
            request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user
            request.data = {}
            self.assertFalse(self.perm.has_object_permission(request, None, self.role))

            prp_role.delete()

    def test_permission_as_ip_authorized_officer__partner_match__workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_authorized_officer
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)
        PRPRole.objects.create(user=request_user, role=request_user_role, workspace=self.workspace)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, True),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, True),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertTrue(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_ip_authorized_officer__partner_match__no_workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_authorized_officer
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)
        PRPRole.objects.create(user=request_user, role=request_user_role)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertFalse(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_ip_authorized_officer__no_partner_match__no_workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_authorized_officer
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')
        PRPRole.objects.create(user=request_user, role=request_user_role)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertFalse(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_ip_authorized_officer__no_partner_match__workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_authorized_officer
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')
        PRPRole.objects.create(user=request_user, role=request_user_role, workspace=self.workspace)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertFalse(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_ip_admin__partner_match__workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_admin
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)
        PRPRole.objects.create(user=request_user, role=request_user_role, workspace=self.workspace)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, True),
            (PRP_ROLE_TYPES.ip_editor, False),  # ip_editor to ip_editor change
            (PRP_ROLE_TYPES.ip_viewer, True),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertTrue(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_ip_admin__no_partner_match__workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_admin
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')
        PRPRole.objects.create(user=request_user, role=request_user_role, workspace=self.workspace)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertFalse(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_ip_admin__no_partner_match__no_workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_admin
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')
        PRPRole.objects.create(user=request_user, role=request_user_role)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertFalse(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_ip_admin__partner_match__no_workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_admin
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)
        PRPRole.objects.create(user=request_user, role=request_user_role)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertFalse(self.perm.has_object_permission(request, None, self.role))


class TestUpdateDestroyPermissionsForIPViewer(APITestCase):
    def setUp(self):
        self.roles_without_permission = [PRP_ROLE_TYPES.cluster_system_admin, PRP_ROLE_TYPES.cluster_imo,
                                         PRP_ROLE_TYPES.cluster_coordinator, PRP_ROLE_TYPES.cluster_viewer,
                                         PRP_ROLE_TYPES.ip_editor, PRP_ROLE_TYPES.ip_viewer]

        self.perm = RoleGroupCreateUpdateDestroyPermission()
        self.factory = APIRequestFactory()
        self.partner = Partner.objects.create()
        self.cluster = Cluster.objects.create()
        self.workspace = Workspace.objects.create()
        cluster_user = User.objects.create_user(email='cluster_user@example.com', username='cluster_user_test',
                                                password='pass', partner=self.partner)
        self.role = PRPRole.objects.create(user=cluster_user, role=PRP_ROLE_TYPES.ip_viewer,
                                           cluster=self.cluster, workspace=self.workspace)

    def test_permission_as_role_without_permission__partner_match__workspace_match(self):
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)

        for role_without_permission in self.roles_without_permission:
            request_user_role = role_without_permission
            prp_role = PRPRole.objects.create(user=request_user, role=request_user_role, workspace=self.workspace)

            # PATCH
            request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user

            roles_to_assign = [
                (PRP_ROLE_TYPES.cluster_system_admin, False),
                (PRP_ROLE_TYPES.cluster_imo, False),
                (PRP_ROLE_TYPES.cluster_coordinator, False),
                (PRP_ROLE_TYPES.cluster_member, False),
                (PRP_ROLE_TYPES.cluster_viewer, False),
                (PRP_ROLE_TYPES.ip_authorized_officer, False),
                (PRP_ROLE_TYPES.ip_admin, False),
                (PRP_ROLE_TYPES.ip_editor, False),
                (PRP_ROLE_TYPES.ip_viewer, False),
            ]

            for role_to_assign, return_value in roles_to_assign:
                request.data = {'role': role_to_assign}
                self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

            # DELETE
            request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user
            request.data = {}
            self.assertFalse(self.perm.has_object_permission(request, None, self.role))

            prp_role.delete()

    def test_permission_as_role_without_permission__no_partner_match__no_workspace_match(self):
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')

        for role_without_permission in self.roles_without_permission:
            request_user_role = role_without_permission
            prp_role = PRPRole.objects.create(user=request_user, role=request_user_role)

            # PATCH
            request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user

            roles_to_assign = [
                (PRP_ROLE_TYPES.cluster_system_admin, False),
                (PRP_ROLE_TYPES.cluster_imo, False),
                (PRP_ROLE_TYPES.cluster_coordinator, False),
                (PRP_ROLE_TYPES.cluster_member, False),
                (PRP_ROLE_TYPES.cluster_viewer, False),
                (PRP_ROLE_TYPES.ip_authorized_officer, False),
                (PRP_ROLE_TYPES.ip_admin, False),
                (PRP_ROLE_TYPES.ip_editor, False),
                (PRP_ROLE_TYPES.ip_viewer, False),
            ]

            for role_to_assign, return_value in roles_to_assign:
                request.data = {'role': role_to_assign}
                self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

            # DELETE
            request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
            request.user = request_user
            request.data = {}
            self.assertFalse(self.perm.has_object_permission(request, None, self.role))

            prp_role.delete()

    def test_permission_as_ip_authorized_officer__partner_match__workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_authorized_officer
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)
        PRPRole.objects.create(user=request_user, role=request_user_role, workspace=self.workspace)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, True),
            (PRP_ROLE_TYPES.ip_editor, True),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertTrue(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_ip_authorized_officer__partner_match__no_workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_authorized_officer
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)
        PRPRole.objects.create(user=request_user, role=request_user_role)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertFalse(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_ip_authorized_officer__no_partner_match__no_workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_authorized_officer
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')
        PRPRole.objects.create(user=request_user, role=request_user_role)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertFalse(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_ip_authorized_officer__no_partner_match__workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_authorized_officer
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')
        PRPRole.objects.create(user=request_user, role=request_user_role, workspace=self.workspace)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertFalse(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_ip_admin__partner_match__workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_admin
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)
        PRPRole.objects.create(user=request_user, role=request_user_role, workspace=self.workspace)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, True),
            (PRP_ROLE_TYPES.ip_editor, True),
            (PRP_ROLE_TYPES.ip_viewer, False),  # ip_viewer to ip_viewer change
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertTrue(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_ip_admin__no_partner_match__workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_admin
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')
        PRPRole.objects.create(user=request_user, role=request_user_role, workspace=self.workspace)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertFalse(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_ip_admin__no_partner_match__no_workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_admin
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass')
        PRPRole.objects.create(user=request_user, role=request_user_role)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertFalse(self.perm.has_object_permission(request, None, self.role))

    def test_permission_as_ip_admin__partner_match__no_workspace_match(self):
        request_user_role = PRP_ROLE_TYPES.ip_admin
        request_user = User.objects.create_user(email='request_user@example.com', username='request_user',
                                                password='pass', partner=self.partner)
        PRPRole.objects.create(user=request_user, role=request_user_role)

        # PATCH
        request = self.factory.patch(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        roles_to_assign = [
            (PRP_ROLE_TYPES.cluster_system_admin, False),
            (PRP_ROLE_TYPES.cluster_imo, False),
            (PRP_ROLE_TYPES.cluster_coordinator, False),
            (PRP_ROLE_TYPES.cluster_member, False),
            (PRP_ROLE_TYPES.cluster_viewer, False),
            (PRP_ROLE_TYPES.ip_authorized_officer, False),
            (PRP_ROLE_TYPES.ip_admin, False),
            (PRP_ROLE_TYPES.ip_editor, False),
            (PRP_ROLE_TYPES.ip_viewer, False),
        ]

        for role_to_assign, return_value in roles_to_assign:
            request.data = {'role': role_to_assign}
            self.assertEqual(self.perm.has_object_permission(request, None, self.role), return_value)

        # DELETE
        request = self.factory.delete(reverse('role-group-update-destroy', args=[self.role.id]))
        request.user = request_user
        request.data = {}
        self.assertFalse(self.perm.has_object_permission(request, None, self.role))
