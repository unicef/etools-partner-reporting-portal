from django.core import mail
from django.urls import reverse
from django.db.models import Count

from rest_framework import status

from drfpasswordless.models import CallbackToken

from core.factories import (
    PartnerUserFactory,
    PartnerFactory,
    CountryFactory,
    WorkspaceFactory,
    IPPRPRoleFactory,
    NonPartnerUserFactory,
    ClusterPRPRoleFactory,
    ResponsePlanFactory,
    ClusterFactory,
)
from core.common import PRP_ROLE_TYPES
from core.tests.base import BaseAPITestCase

from account.models import User


class UserProfileAPIViewTestCase(BaseAPITestCase):

    def setUp(self):
        self.partner = PartnerFactory()
        self.user = PartnerUserFactory(partner=self.partner)

        super().setUp()

    def test_user_profile(self):
        """Test if the user profile is created when user is created
        """
        url = reverse('user-profile')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['profile']['id'], self.user.profile.id)

    def test_unauthenticated_user(self):
        """Test if the user profile is not accessible to unauthenticated user
        """
        self.client.logout()
        url = reverse('user-profile')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class UserLogoutAPIViewTestCase(BaseAPITestCase):

    def setUp(self):
        self.partner = PartnerFactory()
        self.user = PartnerUserFactory(partner=self.partner)

        super().setUp()

    def test_user_logout(self):
        """Test if the user can log out
        """
        url = reverse('user-logout')
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)


class LoginUserWithTokenAPIViewTestCase(BaseAPITestCase):

    def setUp(self):
        self.partner = PartnerFactory()
        self.user = PartnerUserFactory(partner=self.partner)

        super().setUp()

    def test_passwordless_login(self):
        """Test the correct DRF Passwordless flow.
        The passwordless token is created by calling DRF passwordless token API with user email.
        The user is logged in after correct passwordless token authentication in DRF passwordless login API.
        """
        login_url = reverse('user-passwordless-login')
        token_url = reverse('user-passwordless-token')

        response = self.client.post(token_url, data={'email': self.user.email})
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Test that email auth token email has been sent.
        self.assertEqual(len(mail.outbox), 1)

        # Grab email auth token
        token = CallbackToken.objects.first()
        self.assertEqual(token.user.pk, self.user.pk)

        response = self.client.post(login_url, data={'token': token})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.user.is_authenticated)

    def test_invalid_passwordless_login(self):
        """Test the invalid DRF Passwordless flow.
        The passwordless token is created by calling DRF passwordless token API with user email.
        The user is not be logged in after incorrect passwordless token authentication in DRF passwordless login API.
        """
        login_url = reverse('user-passwordless-login')
        token_url = reverse('user-passwordless-token')

        response = self.client.post(token_url, data={'email': self.user.email})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Test that email auth token email has been sent.
        self.assertEqual(len(mail.outbox), 1)

        # Grab email auth token
        token = CallbackToken.objects.first()
        self.assertEqual(token.user.pk, self.user.pk)

        response = self.client.post(login_url, data={'token': "bad_token"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserListCreateAPIViewTestCase(BaseAPITestCase):

    def setUp(self):
        self.country = CountryFactory()
        self.workspace = WorkspaceFactory(countries=[self.country, ])
        self.partner = PartnerFactory(country_code=self.country.country_short_code)
        self.user = PartnerUserFactory(partner=self.partner)
        self.ao_user_role = IPPRPRoleFactory(
            user=self.user,
            workspace=self.workspace,
            role=PRP_ROLE_TYPES.ip_authorized_officer
        )

        super().setUp()

    def test_invalid_list_requests(self):
        """Test the API response for invalid payloads.
        """
        # portal GET parameter is required
        response = self.client.get(reverse('users'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # User must be logged in
        self.client.logout()

        response = self.client.get(reverse('users') + '?portal=IP')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_partner_user_list(self):
        """Test the API response and queryset count.
        Also, the ordering by UserFilter will be tested: last_login, first_name, last_name, partner, and ordering.
        """
        # Create some test users for partner
        NUM_TEST_USERS = 2
        for idx in range(NUM_TEST_USERS):
            user = PartnerUserFactory(
                partner=self.partner
            )
            IPPRPRoleFactory(
                user=user,
                workspace=self.workspace,
                role=PRP_ROLE_TYPES.ip_editor
            )

            if idx == 0:
                IPPRPRoleFactory(
                    user=user,
                    workspace=self.workspace,
                    role=PRP_ROLE_TYPES.ip_admin
                )

        response = self.client.get(reverse('users') + '?portal=IP')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(NUM_TEST_USERS, response.data['count'])

        role_count_annotated_queryset = User.objects.exclude(
            id=self.user.id
        ).annotate(role_count=Count('prp_roles')).order_by('-id')

        # API Ordering test
        response = self.client.get(reverse('users') + '?portal=IP&ordering=-status')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['id'], role_count_annotated_queryset.order_by('-last_login', '-role_count').first().id)

        response = self.client.get(reverse('users') + '?portal=IP&ordering=status')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['id'], role_count_annotated_queryset.order_by('last_login', 'role_count').first().id)

        # API Filtering test
        filter_user = User.objects.get(prp_roles__role=PRP_ROLE_TYPES.ip_admin,)
        filter_args = "?portal=IP&name_email={}&status=active&partners={}&roles={}&workspaces={}&clusters={}".format(
            filter_user.first_name,
            filter_user.partner_id,
            PRP_ROLE_TYPES.ip_admin,
            self.workspace.id,
            '',
        )

        response = self.client.get(reverse('users') + filter_args)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['id'], filter_user.id)

    def test_cluster_user_list(self):
        """Test the API response for cluster users.
        """
        # Create some test users for partner
        self.imo_user = NonPartnerUserFactory()
        response_plan = ResponsePlanFactory(workspace=self.workspace)
        cluster = ClusterFactory(response_plan=response_plan)
        ClusterPRPRoleFactory(user=self.imo_user, workspace=self.workspace, cluster=cluster, role=PRP_ROLE_TYPES.cluster_imo)

        # Test API as IMO first
        self.client.force_authenticate(self.imo_user)

        # Create 1 cluster viewer and 1 cluster member with Partner
        NUM_TEST_USERS = 2
        for idx in range(NUM_TEST_USERS):
            if idx == 0:
                user = NonPartnerUserFactory()
                ClusterPRPRoleFactory(
                    user=user,
                    workspace=self.workspace,
                    cluster=cluster,
                    role=PRP_ROLE_TYPES.cluster_viewer
                )
            else:
                user = PartnerUserFactory(
                    partner=self.partner
                )
                IPPRPRoleFactory(
                    user=user,
                    workspace=self.workspace,
                    role=PRP_ROLE_TYPES.ip_editor,
                )
                ClusterPRPRoleFactory(
                    user=user,
                    workspace=self.workspace,
                    cluster=cluster,
                    role=PRP_ROLE_TYPES.cluster_member
                )

        # Test users + IMO user
        response = self.client.get(reverse('users') + '?portal=CLUSTER')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(NUM_TEST_USERS + 1, response.data['count'])

        # Test API as Cluster member
        member_user = User.objects.filter(prp_roles__role=PRP_ROLE_TYPES.cluster_member).first()
        self.client.force_authenticate(member_user)

        response = self.client.get(reverse('users') + '?portal=CLUSTER')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.filter(prp_roles__role=PRP_ROLE_TYPES.cluster_member).count(), response.data['count'])

        # Test API as Cluster viewer
        viewer_user = User.objects.filter(prp_roles__role=PRP_ROLE_TYPES.cluster_viewer).first()
        self.client.force_authenticate(viewer_user)

        response = self.client.get(reverse('users') + '?portal=CLUSTER')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
