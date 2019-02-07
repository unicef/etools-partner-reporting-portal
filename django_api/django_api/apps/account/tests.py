from django.urls import reverse

from rest_framework import status

from core.factories import UserFactory, UserProfileFactory
from core.models import IMORole
from core.tests.base import BaseAPITestCase

from account.models import User

class UserProfileAPIViewTestCase(BaseAPITestCase):
    force_login_as_role = IMORole

    def setUp(self):
        self.user = UserFactory()
        self.profile = UserProfileFactory(user=self.user)
        super().setUp()

    def test_user_profile(self):
        """
        Ensure we can create a new account object.
        """
        url = reverse('user-profile')
        response = self.client.get(url)

        print(User.objects.all())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.profile.user.id)
