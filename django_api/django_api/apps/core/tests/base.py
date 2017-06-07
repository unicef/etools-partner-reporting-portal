from __future__ import unicode_literals
from rest_framework.test import APITestCase, APIClient

from core.management.commands._privates import generate_fake_data
from core.helpers import suppress_stdout


class BaseAPITestCase(APITestCase):
    """
    Base class for all api test case with generated fake data.
    """

    generate_fake_data_quantity = 3
    client_class = APIClient
    with_session_login = True
    with_generate_fake_data = True

    def setUp(self):
        # generating data
        if self.with_generate_fake_data:
            with suppress_stdout():
                generate_fake_data(quantity=self.generate_fake_data_quantity)

        # creating a session (login already created user in generate_fake_data)
        if self.with_session_login:
            self.client = self.client_class()
            self.client.login(username='admin', password='Passw0rd!')
