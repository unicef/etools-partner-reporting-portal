from __future__ import unicode_literals

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient

from core.models import IMORole


class BaseAPITestCase(APITestCase):
    """
    Base class for all api test case with generated fake data.
    """

    client_class = APIClient
    force_login_as_role = IMORole
    user = None

    def setUp(self):
        super(BaseAPITestCase, self).setUp()
        # generating data
        if self.force_login_as_role:
            self.client = self.client_class()
            self.user = self.force_login_as_role.as_group().user_set.first()
            self.client.force_authenticate(self.user)

    def _post_teardown(self):
        # For some reason original _post_teardown tries to delete groups before users and everything falls apart
        get_user_model().objects.all().delete()
        super(BaseAPITestCase, self)._post_teardown()
