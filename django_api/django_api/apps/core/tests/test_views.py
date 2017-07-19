from django.urls import reverse

from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from account.models import User

from core.tests.base import BaseAPITestCase
from core.models import Location, Intervention

from unicef.models import LowerLevelOutput, Section


class TestInterventionListAPIView(BaseAPITestCase):

    generate_fake_data_quantity = 40

    def test_list_api(self):
        url = reverse('simple-intervention')
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), Intervention.objects.count())


class TestLocationListAPIView(BaseAPITestCase):

    generate_fake_data_quantity = 40

    def test_list_api(self):
        url = reverse('simple-location')
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), Location.objects.count())
