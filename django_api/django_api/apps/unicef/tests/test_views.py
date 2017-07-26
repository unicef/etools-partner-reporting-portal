import datetime
from django.conf import settings
from django.db.models import Q
from django.urls import reverse
from rest_framework import status
from core.common import PROGRESS_REPORT_STATUS
from core.tests.base import BaseAPITestCase
from core.models import Intervention, Location
from core.factories import (
    QuantityReportableToLowerLevelOutputFactory,
    ProgrammeDocumentFactory,
    ProgressReportFactory,
    IndicatorLocationDataFactory,
)
from indicator.models import IndicatorReport
from unicef.models import LowerLevelOutput, Section, ProgrammeDocument, ProgressReport


class TestProgrammeDocumentAPIView25(BaseAPITestCase):

    generate_fake_data_quantity = 25

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


class TestProgrammeDocumentAPIView(BaseAPITestCase):

    def test_detail_api(self):
        pd = ProgrammeDocument.objects.first()
        # location_id is redundantly!
        url = reverse('programme-document-details', kwargs={'location_id': 1, 'pk': pd.pk})
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(pd.agreement, response.data['agreement'])
        self.assertEquals(pd.reference_number, response.data['reference_number'])


class TestProgressReportAPIView(BaseAPITestCase):

    def setUp(self):
        super(TestProgressReportAPIView, self).setUp()
        self.location_id = Intervention.objects.filter(locations__isnull=False).first().locations.first().id
        self.queryset = self.get_queryset()

    def get_queryset(self):
        pd_ids = Location.objects.filter(
            Q(id=self.location_id) |
            Q(parent_id=self.location_id) |
            Q(parent__parent_id=self.location_id) |
            Q(parent__parent__parent_id=self.location_id) |
            Q(parent__parent__parent__parent_id=self.location_id)
        ).values_list(
             'reportable__lower_level_outputs__indicator__programme_document__id',
             flat=True
        )
        return ProgressReport.objects.filter(programme_document_id__in=pd_ids)

    def test_list_api(self):
        url = reverse('progress-reports', kwargs={'location_id': self.location_id})
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), self.queryset.count())

    def test_list_api_filter_by_status(self):
        self.reports = self.queryset.filter(
            status=PROGRESS_REPORT_STATUS.due
        )

        url = reverse('progress-reports', kwargs={'location_id': self.location_id})
        url += '?status=' + PROGRESS_REPORT_STATUS.due
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), len(self.reports))

    def test_list_api_filter_by_due_status(self):
        self.reports = self.queryset.filter(
            status__in=[PROGRESS_REPORT_STATUS.due, PROGRESS_REPORT_STATUS.overdue]
        )

        url = reverse('progress-reports', kwargs={'location_id': self.location_id})
        url += '?due=1'
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), len(self.reports))

    def test_list_api_filter_by_pd_title(self):
        filter_string = 'reference'
        self.reports = self.queryset.filter(
            Q(programme_document__reference_number__icontains=filter_string) |
            Q(programme_document__title__icontains=filter_string)
            )

        url = reverse('progress-reports', kwargs={'location_id': self.location_id})
        url += '?pd_ref_title=' + filter_string
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), len(self.reports))

    def test_list_api_filter_by_due_date(self):
        today = datetime.datetime.today()
        date_format = settings.PRINT_DATA_FORMAT
        pr_ids = ProgressReport.objects.all().values_list('id', flat=True)

        ir_ids = IndicatorReport.objects \
            .filter(progress_report_id__in=pr_ids) \
            .filter(due_date=today) \
            .values_list('progress_report_id') \
            .distinct()
        pr_queryset = self.queryset.filter(id__in=ir_ids)

        url = reverse('progress-reports', kwargs={'location_id': self.location_id})
        url += '?due_date=' + today.strftime(date_format)
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), len(pr_queryset))
