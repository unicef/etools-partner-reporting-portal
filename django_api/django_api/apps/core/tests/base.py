
from __future__ import unicode_literals

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient

from core.management.commands._privates import generate_fake_data
from core.helpers import suppress_stdout


class BaseAPITestCase(APITestCase):
    """
    Base class for all api test case with generated fake data.
    """

    generate_fake_data_quantity = 1
    client_class = APIClient
    with_session_login = True
    with_generate_fake_data = True
    generate_all_disagg = False
    user = None

    def setUp(self):
        super(BaseAPITestCase, self).setUp()
        # generating data
        if self.with_generate_fake_data:
            with suppress_stdout():
                generate_fake_data(self.generate_fake_data_quantity, generate_all_disagg=self.generate_all_disagg)

            # creating a session (login already created user in generate_fake_data)
            if self.with_session_login:
                self.client = self.client_class()
                self.user = get_user_model().objects.get(username='admin_imo')
                self.client.force_authenticate(self.user)

    def _post_teardown(self):
        # For some reason original _post_teardown tries to delete groups before users and everything falls apart
        get_user_model().objects.all().delete()
        super(BaseAPITestCase, self)._post_teardown()
