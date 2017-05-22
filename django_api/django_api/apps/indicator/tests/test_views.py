from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from core.factories import IndicatorReportFactory

from indicator.models import Reportable, IndicatorReport


class TestIndicatorListAPIView(APITestCase):

    def setUp(self):
        self.reports = IndicatorReportFactory.create_batch(5)
        self.count = Reportable.objects.filter(lower_level_outputs__reportables__isnull=False).count()

    def test_list_api(self):
        url = reverse('indicator-list-create-api')
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), self.count)

    def test_list_api_filter_by_locations(self):
        location_ids = map(lambda item: str(item), Reportable.objects.filter(lower_level_outputs__reportables__isnull=False, locations__isnull=False).values_list('locations__id', flat=True))
        location_id_list_string = ','.join(location_ids)

        url = reverse('indicator-list-create-api')
        url += '?locations=' + location_id_list_string
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), len(self.reports))

    def test_list_api_filter_by_pd_ids(self):
        pd_ids = map(lambda item: str(item), Reportable.objects.filter(lower_level_outputs__reportables__isnull=False).values_list('lower_level_outputs__indicator__programme_document__id', flat=True))
        pd_id_list_string = ','.join(pd_ids)

        url = reverse('indicator-list-create-api')
        url += '?pds=' + pd_id_list_string
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), self.count)
