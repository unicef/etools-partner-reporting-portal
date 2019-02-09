from __future__ import unicode_literals

from rest_framework.test import APITestCase, APIClient


class BaseAPITestCase(APITestCase):
    client_class = APIClient
    user = None

    def setUp(self):
        super(BaseAPITestCase, self).setUp()

        if self.user:
            self.client = self.client_class()
            self.client.force_authenticate(self.user)
