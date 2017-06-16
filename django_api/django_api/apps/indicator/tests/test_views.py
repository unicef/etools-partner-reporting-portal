from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

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


class TestIndicatorListAPIView(BaseAPITestCase):
    generate_fake_data_quantity = 5

    def test_list_api(self):
        url = reverse('indicator-list-create-api')
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), self.generate_fake_data_quantity)

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


class TestIndicatorReportListAPIView(BaseAPITestCase):
    generate_fake_data_quantity = 5

    def test_list_api(self):
        indicator_report = IndicatorReport.objects.last()

        url = reverse('indicator-report-list-api', kwargs={'reportable_id': indicator_report.reportable.id})
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), indicator_report.reportable.indicator_reports.count())
        self.assertNotEquals(response.data[0]['indicator_location_data'][0]['disaggregation'], {})


class TestIndicatorLocationDataUpdateAPIView(BaseAPITestCase):
    generate_fake_data_quantity = 5

    def test_put_api(self):
        indicator_location_data = IndicatorLocationData.objects.last()
        data = [{
            "id": 1047,
            "location": {
              "id": 257,
              "title": "location_2",
              "latitude": null,
              "longitude": null,
              "p_code": null
            },
            "disaggregation": {
              "(1773,)": {
                "c": null,
                "d": null,
                "v": 58
              },
              "()": {
                "c": null,
                "d": null,
                "v": 169
              },
              "(1776,)": {
                "c": null,
                "d": null,
                "v": 93
              },
              "(1775,)": {
                "c": null,
                "d": null,
                "v": 127
              },
              "(1774,)": {
                "c": null,
                "d": null,
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
              "latitude": null,
              "longitude": null,
              "p_code": null
            },
            "disaggregation": {
              "(1778,)": {
                "c": null,
                "d": null,
                "v": 135
              },
              "(1781,)": {
                "c": null,
                "d": null,
                "v": 141
              },
              "(1779,)": {
                "c": null,
                "d": null,
                "v": 72
              },
              "(1780,)": {
                "c": null,
                "d": null,
                "v": 190
              },
              "()": {
                "c": null,
                "d": null,
                "v": 191
              },
              "(1782,)": {
                "c": null,
                "d": null,
                "v": 167
              },
              "(1777,)": {
                "c": null,
                "d": null,
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
              "latitude": null,
              "longitude": null,
              "p_code": null
            },
            "disaggregation": {
              "(1785,)": {
                "c": null,
                "d": null,
                "v": 195
              },
              "(1784,)": {
                "c": null,
                "d": null,
                "v": 132
              },
              "()": {
                "c": null,
                "d": null,
                "v": 103
              },
              "(1783,)": {
                "c": null,
                "d": null,
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
              "latitude": null,
              "longitude": null,
              "p_code": null
            },
            "disaggregation": {
              "()": {
                "c": null,
                "d": null,
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
