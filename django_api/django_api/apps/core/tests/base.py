from rest_framework.test import APIClient, APITestCase


class BaseAPITestCase(APITestCase):
    client_class = APIClient
    user = None

    def setUp(self):
        super().setUp()

        if self.user:
            self.client = self.client_class()
            self.client.force_authenticate(self.user)
