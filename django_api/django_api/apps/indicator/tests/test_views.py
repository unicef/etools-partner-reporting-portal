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
from core.management.commands._privates import generate_data_combination_dict
from core.tests.base import BaseAPITestCase
from unicef.models import LowerLevelOutput, Section, ProgrammeDocument

from indicator.models import Reportable, IndicatorReport, IndicatorLocationData


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

    def test_get_indicator_report(self):
        pd = ProgrammeDocument.objects.first()
        report_id = pd.reportable_queryset.values_list('indicator_reports__pk', flat=True)[0]

        url = reverse('programme-document-reports-detail', kwargs={'pd_id': pd.pk, 'report_id': report_id})
        response = self.client.get(url, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['id'], str(report_id))


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

    def test_list_api_with_reportable_id(self):
        indicator_report = IndicatorReport.objects.last()

        url = reverse('indicator-report-list-api', kwargs={'reportable_id': indicator_report.reportable.id})
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), indicator_report.reportable.indicator_reports.count())
        self.assertNotEquals(response.data[0]['indicator_location_data'][0]['disaggregation'], {})

        def test_list_api_with_limit(self):
            indicator_report = IndicatorReport.objects.last()

            url = reverse('indicator-report-list-api', kwargs={'reportable_id': indicator_report.reportable.id})
            url += '?limit=2'
            response = self.client.get(url, format='json')

            self.assertEquals(response.status_code, status.HTTP_200_OK)
            self.assertEquals(len(response.data), 2)


class TestIndicatorLocationDataUpdateAPIView(BaseAPITestCase):
    generate_fake_data_quantity = 5

    def test_put_api(self):
        indicator_location_data = IndicatorLocationData.objects.last()
        data = [{
            "id": 1047,
            "location": {
              "id": 257,
              "title": "location_2",
              "latitude": None,
              "longitude": None,
              "p_code": None
            },
            "disaggregation": {
              "(1773,)": {
                "c": None,
                "d": None,
                "v": 58
              },
              "()": {
                "c": None,
                "d": None,
                "v": 169
              },
              "(1776,)": {
                "c": None,
                "d": None,
                "v": 93
              },
              "(1775,)": {
                "c": None,
                "d": None,
                "v": 127
              },
              "(1774,)": {
                "c": None,
                "d": None,
                "v": 150
              }
            },
            "num_disaggregation": 3,
            "level_reported": 1,
            "disaggregation_reported_on": [
              509
            ]
          },
          {
            "id": 1048,
            "location": {
              "id": 257,
              "title": "location_2",
              "latitude": None,
              "longitude": None,
              "p_code": None
            },
            "disaggregation": {
              "(1778,)": {
                "c": None,
                "d": None,
                "v": 135
              },
              "(1781,)": {
                "c": None,
                "d": None,
                "v": 141
              },
              "(1779,)": {
                "c": None,
                "d": None,
                "v": 72
              },
              "(1780,)": {
                "c": None,
                "d": None,
                "v": 190
              },
              "()": {
                "c": None,
                "d": None,
                "v": 191
              },
              "(1782,)": {
                "c": None,
                "d": None,
                "v": 167
              },
              "(1777,)": {
                "c": None,
                "d": None,
                "v": 106
              }
            },
            "num_disaggregation": 3,
            "level_reported": 1,
            "disaggregation_reported_on": [
              510
            ]
          },
          {
            "id": 1049,
            "location": {
              "id": 257,
              "title": "location_2",
              "latitude": None,
              "longitude": None,
              "p_code": None
            },
            "disaggregation": {
              "(1785,)": {
                "c": None,
                "d": None,
                "v": 195
              },
              "(1784,)": {
                "c": None,
                "d": None,
                "v": 132
              },
              "()": {
                "c": None,
                "d": None,
                "v": 103
              },
              "(1783,)": {
                "c": None,
                "d": None,
                "v": 63
              }
            },
            "num_disaggregation": 3,
            "level_reported": 1,
            "disaggregation_reported_on": [
              511
            ]
          },
          {
            "id": 1050,
            "location": {
              "id": 258,
              "title": "location_3",
              "latitude": None,
              "longitude": None,
              "p_code": None
            },
            "disaggregation": {
              "()": {
                "c": None,
                "d": None,
                "v": 50
              }
            },
            "num_disaggregation": 3,
            "level_reported": 0,
            "disaggregation_reported_on": []
          }
        ]

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, data, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(response.data, data)
