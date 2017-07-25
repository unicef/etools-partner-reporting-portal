from django.urls import reverse

from rest_framework import status
<<<<<<< HEAD
from rest_framework.test import APIClient, APITestCase

from account.models import User

from core.factories import (
    ProgrammeDocumentFactory,
    QuantityReportableToLowerLevelOutputFactory,
    ProgressReportFactory,
    IndicatorLocationDataFactory,
    SectionFactory,
    InterventionFactory,
    ResponsePlanFactory,
)
=======
>>>>>>> develop
from core.models import Location, Intervention, ResponsePlan
from core.models import Location, Intervention
from .base import BaseAPITestCase


class TestInterventionListAPIView(BaseAPITestCase):

    generate_fake_data_quantity = 40

    def test_list_api(self):
        url = reverse('simple-intervention')
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), Intervention.objects.count())


class TestLocationListAPIView(BaseAPITestCase):

    generate_fake_data_quantity = 40

    def test_list_api(self):
        url = reverse('simple-location')
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), Location.objects.count())


class TestResponsePlanAPIView(BaseAPITestCase):

    def test_response_plan(self):
        intervention = Intervention.objects.first()
        response_plan_count = ResponsePlan.objects.filter(intervention=intervention.id).count()
        url = reverse("response-plan", kwargs={'intervention_id': intervention.id})
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), response_plan_count)
        self.assertTrue(response.data[0].get('id') in
                        ResponsePlan.objects.filter(intervention=intervention.id).values_list('id', flat=True))
        self.assertEquals(response.data[0].get('intervention'), intervention.id)
