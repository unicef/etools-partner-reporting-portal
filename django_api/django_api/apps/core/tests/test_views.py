from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from core.factories import LocationFactory, InterventionFactory

from core.models import Location, Intervention


class TestInterventionListAPIView(APITestCase):

    def setUp(self):
        self.locations = InterventionFactory.create_batch(5)
        self.count = Intervention.objects.count()

    def test_list_api(self):
        url = reverse('simple-intervention')
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), self.count)


class TestLocationListAPIView(APITestCase):

    def setUp(self):
        self.locations = LocationFactory.create_batch(5)
        self.count = Location.objects.count()

    def test_list_api(self):
        url = reverse('simple-location')
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), self.count)
