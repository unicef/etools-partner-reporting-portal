from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from core.factories import IndicatorReportFactory

from indicator.models import Reportable, IndicatorBlueprint


class TestIndicatorListAPIView(APITestCase):

    def setUp(self):
        self.reports = IndicatorReportFactory.create_batch(5)

    def test_list_api(self):
        url = reverse('indicator-list-create-api')
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), len(self.reports))
