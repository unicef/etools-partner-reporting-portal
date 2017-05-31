from django.urls import reverse
from django.db.models import Q

from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from account.models import User
from core.factories import IndicatorReportFactory
from core.models import Intervention, Location
from indicator.models import IndicatorReport, Reportable

from unicef.models import ProgrammeDocument


class TestProgrammeDocumentAPIView(APITestCase):

    def setUp(self):
        # By calling this factory, we're creating
        # IndicatorReport -> Reportable -> LowerLevelOutput -> CountryProgrammeOutput -> ProgrammeDocument
        IndicatorReportFactory.create_batch(5)

        locations = {}
        quantity = 3
        for idx in xrange(quantity):
            indicator_report = IndicatorReport.objects.all()[idx]
            pd = indicator_report.reportable.content_object.indicator.programme_document
            locations[idx] = Location.objects.all()[idx]
            inter = Intervention.objects.all()[idx]
            inter.locations.add(locations[idx])

        for idx in xrange(quantity):
            for subindx in xrange(quantity):
                Location.objects.create(
                    parent=locations[idx],
                    title=("%s child of %s" % (['first', 'second', 'third'][subindx], locations[idx].title)),
                    reportable_id=Reportable.objects.all()[quantity+idx+subindx].id,
                )

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

        pd_ids = Location.objects.filter(
            Q(id=location_id) |
            Q(parent_id=location_id) |
            Q(parent__parent_id=location_id) |
            Q(parent__parent__parent_id=location_id) |
            Q(parent__parent__parent__parent_id=location_id)
        ).values_list(
             'reportable__lower_level_outputs__indicator__programme_document__id',
             flat=True
        )

        count = ProgrammeDocument.objects.filter(pk__in=pd_ids).count()
        self.assertEquals(len(response.data['results']), count)

    def test_list_filter_api(self):
        intervention = Intervention.objects.filter(locations__isnull=False).first()
        url = reverse('programme-document', kwargs={'location_id': intervention.locations.first().id})
        response = self.client.get(
            url+"?ref_title=&status=&location=",
            format='json'
        )
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(len(response.data['results']), 4)

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

        # Document status is Draft
        self.assertEquals(len(response.data['results']), 4)
        self.assertEquals(response.data['results'][0]['status'], document['status'])

    def test_detail_api(self):
        pd = ProgrammeDocument.objects.first()
        url = reverse('programme-document-details', kwargs={'pk': pd.pk})
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(pd.agreement, response.data['agreement'])
        self.assertEquals(pd.reference_number, response.data['reference_number'])
