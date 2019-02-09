from django.core import mail
from django.urls import reverse

from rest_framework import status

from drfpasswordless.models import CallbackToken

from core.factories import PartnerUserFactory, PartnerFactory
from core.tests.base import BaseAPITestCase


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


# class UserListCreateAPIViewTestCase(BaseAPITestCase):

#     def setUp(self):
#         self.partner = PartnerFactory()
#         self.user = PartnerUserFactory(partner=self.partner)

#         super().setUp()

#     def test_user_profile(self):
#         """Test if the user profile is created when user is created.
#         """
#         url = reverse('user-logout')
#         response = self.client.post(url)

#         self.assertEqual(response.status_code, status.HTTP_200_OK)
