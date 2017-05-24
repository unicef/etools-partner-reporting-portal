from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from core.factories import IndicatorReportFactory
from account.models import User
from unicef.models import ProgrammeDocument


class TestProgrammeDocumentAPIView(APITestCase):

    def setUp(self):
        # By calling this factory, we're creating
        # IndicatorReport -> Reportable -> LowerLevelOutput -> CountryProgrammeOutput -> ProgrammeDocument
        IndicatorReportFactory.create_batch(5)

        # Make all requests in the context of a logged in session.
        admin, created = User.objects.get_or_create(username='admin', defaults={
            'email': 'admin@unicef.org',
            'is_superuser': True,
            'is_staff': True
        })
        admin.set_password('Passw0rd!')
        admin.save()
        self.client = APIClient()
        self.client.login(username='admin', password='Passw0rd!')

    def test_list_api(self):
        url = reverse('programme-document')
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        count = ProgrammeDocument.objects.count()
        self.assertEquals(len(response.data), count)

    def test_detail_api(self):
        pd = ProgrammeDocument.objects.first()
        url = reverse('programme-document-details', kwargs={'pk': pd.pk})
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(pd.agreement, response.data['agreement'])
        self.assertEquals(pd.reference_number, response.data['reference_number'])
