from django.contrib.auth.models import AnonymousUser
from django.http import HttpResponse
from django.test import RequestFactory, TestCase
from django.urls import reverse

from rest_framework import status

from etools_prp.apps.core.middleware import AuthRequiredMiddleware
from etools_prp.apps.core.tests.factories import PartnerUserFactory


class TestAuthRequiredMiddleware(TestCase):
    request_factory = RequestFactory()

    def setUp(self):
        self.request = self.request_factory.get('/')

    def test_anonymous_user_redirects_to_login(self):
        self.request.user = AnonymousUser()

        middleware = AuthRequiredMiddleware(lambda req: HttpResponse())
        response = middleware(self.request)

        self.assertRedirects(response, reverse('admin:login'), fetch_redirect_response=False)

    def test_authenticated_user(self):
        self.request.user = PartnerUserFactory()

        middleware = AuthRequiredMiddleware(lambda req: HttpResponse())
        response = middleware(self.request)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
