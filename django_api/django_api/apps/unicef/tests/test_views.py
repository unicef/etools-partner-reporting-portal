from django.urls import reverse
from django.db.models import Q

from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from account.models import User
from core.models import Intervention, Location
from core.factories import (
    IndicatorReportFactory, ProgrammeDocumentFactory, ReportableToLowerLevelOutputFactory,
    ProgressReportFactory,
    SectionFactory,
    InterventionFactory,
    IndicatorLocationDataFactory,
)
from indicator.models import Reportable, IndicatorBlueprint, IndicatorReport

from unicef.models import LowerLevelOutput, Section, ProgrammeDocument

from unicef.models import ProgrammeDocument


class TestProgrammeDocumentAPIView(APITestCase):

    def setUp(self):
        self.quantity = 5

        ProgrammeDocumentFactory.create_batch(self.quantity)
        SectionFactory.create_batch(self.quantity)

        # Linking the followings:
        # created LowerLevelOutput - ReportableToLowerLevelOutput
        # Section - ProgrammeDocument via ReportableToLowerLevelOutput
        # ProgressReport - IndicatorReport from ReportableToLowerLevelOutput
        # IndicatorReport & Location from ReportableToLowerLevelOutput - IndicatorLocationData
        for idx in xrange(self.quantity):
            llo = LowerLevelOutput.objects.all()[idx]
            reportable = ReportableToLowerLevelOutputFactory(content_object=llo)

            reportable.content_object.indicator.programme_document.sections.add(Section.objects.all()[idx])

            indicator_report = reportable.indicator_reports.first()
            indicator_report.progress_report = ProgressReportFactory()
            indicator_report.save()

            indicator_location_data = IndicatorLocationDataFactory(indicator_report=indicator_report, location=reportable.locations.first())

        # Intervention creates Cluster and Locations
        InterventionFactory.create_batch(self.quantity, locations=Location.objects.all())

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
        intervention = Intervention.objects.filter(locations__isnull=False).first()

        location_id = intervention.locations.first().id

        url = reverse('programme-document', kwargs={'location_id': location_id})
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(len(response.data['results']), 1)

    def test_list_filter_api(self):
        intervention = Intervention.objects.filter(locations__isnull=False).first()
        url = reverse('programme-document', kwargs={'location_id': intervention.locations.first().id})
        response = self.client.get(
            url+"?ref_title=&status=&location=",
            format='json'
        )
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(len(response.data['results']), 1)

        document = response.data['results'][0]
        response = self.client.get(
            url+"?ref_title=%s&status=&location=" % document['title'][8:],
            format='json'
        )
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(len(response.data['results']), 1)
        self.assertEquals(response.data['results'][0]['title'], document['title'])

        response = self.client.get(
            url+"?ref_title=&status=%s&location=" % document['status'][:3],
            format='json'
        )
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['results'][0]['status'], document['status'])
        self.assertEquals(response.data['results'][0]['title'], document['title'])
        self.assertEquals(response.data['results'][0]['reference_number'], document['reference_number'])

        # location filtering
        loc = Location.objects.filter(parent__isnull=True).first()
        response = self.client.get(
            url+"?ref_title=&status=&location=%s" % loc.id,
            format='json'
        )

        self.assertTrue(status.is_success(response.status_code))
        for result in response.data['results']:
            self.assertEquals(result['title'], document['title'])

    def test_detail_api(self):
        pd = ProgrammeDocument.objects.first()
        # location_id is redundantly!
        url = reverse('programme-document-details', kwargs={'location_id': 1, 'pk': pd.pk})
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(pd.agreement, response.data['agreement'])
        self.assertEquals(pd.reference_number, response.data['reference_number'])
