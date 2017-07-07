from django.urls import reverse

from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from account.models import User

from core.factories import (
    ProgrammeDocumentFactory,
    ReportableToLowerLevelOutputFactory,
    ProgressReportFactory,
    IndicatorLocationDataFactory,
    SectionFactory,
    InterventionFactory,
    ResponsePlanFactory,
)
from core.models import Location, Intervention, ResponsePlan
from unicef.models import LowerLevelOutput, Section
from .base import BaseAPITestCase


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
        reportable = QuantityReportableToLowerLevelOutputFactory(content_object=llo)

        reportable.content_object.indicator.programme_document.sections.add(Section.objects.all()[idx])

        indicator_report = reportable.indicator_reports.first()
        indicator_report.progress_report = ProgressReportFactory()
        indicator_report.save()

        IndicatorLocationDataFactory(
            indicator_report=indicator_report,
            location=reportable.locations.first()
        )


class TestInterventionListAPIView(APITestCase):

    def setUp(self):
        generate_test_data(5)

        self.locations = Location.objects.all()

        self.interventions = Intervention.objects.filter(locations=self.locations)
        self.count = Intervention.objects.count()

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
        url = reverse('simple-intervention')
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), self.count)


class TestLocationListAPIView(APITestCase):

    def setUp(self):
        generate_test_data(5)

        self.locations = Location.objects.all()
        self.count = Location.objects.count()

    def test_list_api(self):
        url = reverse('simple-location')
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), self.count)


class TestResponsePlanAPIView(BaseAPITestCase):

    def test_response_plan(self):
        intervention = Intervention.objects.first()
        response_plan_count = ResponsePlan.objects.filter(intervention=intervention.id).count()
        url = reverse("response-plan", kwargs={'intervention_id': intervention.id})
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), response_plan_count)
        self.assertEquals(response.data[0].get('id'),
                          ResponsePlan.objects.filter(intervention=intervention.id).first().id)
        self.assertEquals(response.data[0].get('intervention'), intervention.id)
