from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from core.management.commands._privates import generate_fake_data
from core.helpers import suppress_stdout

from account.models import User

from core.factories import (
    ProgrammeDocumentFactory, ReportableToLowerLevelOutputFactory, ProgressReportFactory, IndicatorLocationDataFactory,
    SectionFactory
)
from core.tests.base import BaseAPITestCase
from unicef.models import LowerLevelOutput, Section, ProgrammeDocument
from indicator.models import IndicatorReport, Reportable


class TestPDReportsAPIView(BaseAPITestCase):
    generate_fake_data_quantity = 5

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


class TestIndicatorListAPIView(BaseAPITestCase):
    generate_fake_data_quantity = 5

    def test_list_api(self):
        ir_id = IndicatorReport.objects.first().id
        url = reverse('indicator-data', kwargs={'ir_id': ir_id})
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)

        expected_reportable = Reportable.objects.filter(
            indicator_reports__id=ir_id,
            lower_level_outputs__isnull=False
        )
        self.assertEquals(len(response.data['outputs']), expected_reportable.count())
        expected_reportable_ids = expected_reportable.values_list('id', flat=True)
        for resp_data in response.data['outputs']:
            self.assertTrue(resp_data['id'] in expected_reportable_ids)
            self.assertEquals(
                len(resp_data['indicator_reports']),
                expected_reportable.get(lower_level_outputs__id=resp_data['llo_id']).indicator_reports.all().count()
            )

    def test_list_api_filter_by_locations(self):
        self.reports = Reportable.objects.filter(
            lower_level_outputs__reportables__isnull=False,
            locations__isnull=False
        ).distinct()

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


class TestIndicatorReportListAPIView(BaseAPITestCase):
    generate_fake_data_quantity = 5

    def test_list_api(self):
        indicator_report = IndicatorReport.objects.last()

        url = reverse('indicator-report-list-api', kwargs={'pk': indicator_report.reportable.id})
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), 2)
        self.assertNotEquals(response.data[0]['indicator_location_data'][0]['disaggregation'], {})
