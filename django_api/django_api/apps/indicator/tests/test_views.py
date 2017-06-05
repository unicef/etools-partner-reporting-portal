from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from core.factories import (
    IndicatorReportFactory, ProgrammeDocumentFactory, ReportableToLowerLevelOutputFactory,
    ProgressReportFactory,
    SectionFactory,
    IndicatorLocationDataFactory,
)

from unicef.models import LowerLevelOutput, Section

from indicator.models import Reportable, IndicatorBlueprint


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
