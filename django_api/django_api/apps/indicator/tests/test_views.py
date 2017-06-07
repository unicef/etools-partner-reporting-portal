from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from account.models import User
from core.factories import (
    ProgrammeDocumentFactory, ReportableToLowerLevelOutputFactory, ProgressReportFactory, IndicatorLocationDataFactory,
    SectionFactory
)
from unicef.models import LowerLevelOutput, Section, ProgrammeDocument

from indicator.models import Reportable, IndicatorReport


def generate_test_data(quantity):
    SectionFactory.create_batch(quantity)
    ProgrammeDocumentFactory.create_batch(quantity)

    # Linking the followings:
    # created LowerLevelOutput - ReportableToLowerLevelOutput
    # Section - ProgrammeDocument via ReportableToLowerLevelOutput
    # ProgressReport - IndicatorReport from ReportableToLowerLevelOutput
    # IndicatorReport & Location from ReportableToLowerLevelOutput - IndicatorLocationData
    for idx in xrange(quantity):
        llo = LowerLevelOutput.objects.all()[idx]
        reportable = ReportableToLowerLevelOutputFactory(content_object=llo)

        reportable.content_object.indicator.programme_document.sections.add(Section.objects.all()[idx])

        indicator_report = reportable.indicator_reports.first()
        indicator_report.progress_report = ProgressReportFactory()
        indicator_report.save()

        IndicatorLocationDataFactory(indicator_report=indicator_report, location=reportable.locations.first())


class TestPDReportsAPIView(APITestCase):

    def setUp(self):
        self.quantity = 5

        generate_test_data(self.quantity)

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
        pd = ProgrammeDocument.objects.first()
        url = reverse('programme-document-reports', kwargs={'pd_id': pd.pk})
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))

        pd = ProgrammeDocument.objects.get(pk=pd.id)
        pks = pd.reportable_queryset.values_list('indicator_reports__pk', flat=True)

        first_ir = IndicatorReport.objects.filter(id__in=pks).first()
        filter_url = "%s?status=%s" % (
            url,
            first_ir.progress_report.get_status_display()
        )
        response = self.client.get(filter_url, format='json')
        self.assertTrue(status.is_success(response.status_code))


class TestIndicatorListAPIView(APITestCase):

    def setUp(self):
        self.quantity = 5

        generate_test_data(self.quantity)

    def test_list_api(self):
        url = reverse('indicator-list-create-api')
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), self.quantity)

    def test_list_api_filter_by_locations(self):
        self.reports = Reportable.objects.filter(
            lower_level_outputs__reportables__isnull=False,
            locations__isnull=False
        )

        location_ids = map(lambda item: str(item), self.reports.values_list('locations__id', flat=True))
        location_id_list_string = ','.join(location_ids)

        url = reverse('indicator-list-create-api')
        url += '?locations=' + location_id_list_string
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), len(self.reports))

    def test_list_api_filter_by_pd_ids(self):
        self.reports = Reportable.objects.filter(lower_level_outputs__reportables__isnull=False)

        pd_ids = map(
            lambda item: str(item),
            self.reports.values_list('lower_level_outputs__indicator__programme_document__id', flat=True)
        )
        pd_id_list_string = ','.join(pd_ids)

        url = reverse('indicator-list-create-api')
        url += '?pds=' + pd_id_list_string
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), len(self.reports))


class TestIndicatorReportListAPIView(APITestCase):

    def setUp(self):
        generate_test_data(5)

    def test_list_api(self):
        indicator_report = IndicatorReport.objects.last()

        url = reverse('indicator-report-list-api', kwargs={'pk': indicator_report.reportable.id})
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), 1)
        self.assertNotEquals(response.data[0]['indicator_location_data'][0]['disaggregation'], {})
