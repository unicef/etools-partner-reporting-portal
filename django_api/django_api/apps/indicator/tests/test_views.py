from django.contrib.contenttypes.models import ContentType
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from core.factories import IndicatorReportFactory
from core.management.commands._privates import generate_fake_data
from core.helpers import suppress_stdout
from indicator.models import IndicatorReport, Reportable, IndicatorBlueprint
from unicef.models import LowerLevelOutput


class TestIndicatorListAPIView(APITestCase):

    def setUp(self):
        self.reports = IndicatorReportFactory.create_batch(5)

    def test_list_api(self):
        url = reverse('indicator-list-create-api')
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), len(self.reports))


class TestIndicatorDataAPIView(APITestCase):

    def setUp(self):
        with suppress_stdout():
            generate_fake_data(quantity=3)
        self.client = APIClient()
        self.client.login(username='admin', password='Passw0rd!')

    def test_list_api(self):
        ir_id = IndicatorReport.objects.first().id
        url = reverse('indicator-data', kwargs={'ir_id': ir_id})
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        expected_reportable = Reportable.objects.filter(
            indicator_reports__id=ir_id,
            content_type=ContentType.objects.get_for_model(LowerLevelOutput)
        )
        self.assertEquals(len(response.data), expected_reportable.count())
        expected_reportable_ids = expected_reportable.values_list('id', flat=True)
        for resp_data in response.data:
            self.assertTrue(resp_data['id'] in expected_reportable_ids)
            self.assertEquals(
                len(resp_data['indicators']),
                Reportable.objects.filter(parent_indicator=resp_data['id']).count()
            )
