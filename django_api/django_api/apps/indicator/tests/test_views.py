from django.contrib.contenttypes.models import ContentType
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from core.management.commands._privates import generate_fake_data
from core.helpers import suppress_stdout
from core.factories import (
    IndicatorReportFactory, ProgrammeDocumentFactory, ReportableToLowerLevelOutputFactory,
    ProgressReportFactory,
    SectionFactory,
    IndicatorLocationDataFactory,
)

from unicef.models import LowerLevelOutput, Section

from indicator.models import IndicatorReport, Reportable, IndicatorBlueprint


class TestIndicatorListAPIView(APITestCase):

    def setUp(self):
        self.quantity = 5

        ProgrammeDocumentFactory.create_batch(self.quantity)
        print "{} ProgrammeDocument objects created".format(self.quantity)

        SectionFactory.create_batch(self.quantity)
        print "{} Section objects created".format(self.quantity)

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

    def test_list_api(self):
        url = reverse('indicator-list-create-api')
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), self.quantity)


class TestIndicatorDataAPIView(APITestCase):

    def setUp(self):
        with suppress_stdout():
            generate_fake_data(quantity=3)
        self.client = APIClient()
        self.client.login(username='admin', password='Passw0rd!')

    def test_list_api(self):
        ir_id = IndicatorReport.objects.first().id
        url = reverse('indicator-data', kwargs={'ir_id': ir_id})
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        expected_reportable = Reportable.objects.filter(
            indicator_reports__id=ir_id,
            content_type=ContentType.objects.get_for_model(LowerLevelOutput)
        )
        self.assertEquals(len(response.data), expected_reportable.count())
        expected_reportable_ids = expected_reportable.values_list('id', flat=True)
        for resp_data in response.data:
            self.assertTrue(resp_data['id'] in expected_reportable_ids)
            self.assertEquals(
                len(resp_data['indicators']),
                Reportable.objects.filter(parent_indicator=resp_data['id']).count()
            )
