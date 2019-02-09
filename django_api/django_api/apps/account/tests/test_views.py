from django.urls import reverse

from rest_framework import status

from core.factories import PartnerUserFactory, PartnerFactory
from core.tests.base import BaseAPITestCase


class UserProfileAPIViewTestCase(BaseAPITestCase):

    def setUp(self):
        self.partner = PartnerFactory()
        self.user = PartnerUserFactory(partner=self.partner)

        super().setUp()

    def test_user_profile(self):
        """Test if the user profile is created when user is created.
        """

        url = reverse('user-profile')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['profile']['id'], self.user.profile.id)
