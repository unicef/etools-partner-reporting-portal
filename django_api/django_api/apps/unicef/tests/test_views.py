from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from core.factories import IndicatorReportFactory

from unicef.models import ProgrammeDocument


class TestProgrammeDocumentAPIView(APITestCase):

    def setUp(self):
        # By calling this factory, we're creating
        # IndicatorReport -> Reportable -> LowerLevelOutput -> CountryProgrammeOutput -> ProgrammeDocument
        IndicatorReportFactory.create_batch(5)
        self.count = ProgrammeDocument.objects.count()

    def test_list_api(self):
        url = reverse('programme-document')
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(len(response.data), self.count)
