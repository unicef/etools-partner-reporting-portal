from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from account.models import User
from core.factories import IndicatorReportFactory

from unicef.models import ProgrammeDocument


class TestProgrammeDocumentAPIView(APITestCase):

    def setUp(self):
        # By calling this factory, we're creating
        # IndicatorReport -> Reportable -> LowerLevelOutput -> CountryProgrammeOutput -> ProgrammeDocument
        IndicatorReportFactory.create_batch(5)
        self.count = ProgrammeDocument.objects.count()

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
        self.assertEquals(len(response.data['results']), self.count)

    def test_list_filter_api(self):
        url = reverse('programme-document')
        response = self.client.get(
            url+"?ref_title=&status=",
            format='json'
        )
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(len(response.data['results']), self.count)

        document = ProgrammeDocument.objects.first()
        response = self.client.get(
            url+"?ref_title=%s&status=" % document.title[8:],
            format='json'
        )
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(len(response.data['results']), 1)
        self.assertEquals(response.data['results'][0]['title'], document.title)

        response = self.client.get(
            url+"?ref_title=&status=%s" % document.status,
            format='json'
        )
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(len(response.data['results']),
                          ProgrammeDocument.objects.filter(status=document.status).count())
        self.assertEquals(response.data['results'][0]['status'], document.get_status_display())
