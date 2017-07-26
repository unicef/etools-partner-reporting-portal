from django.urls import reverse

from rest_framework import status
from core.models import Location, Intervention, ResponsePlan
from core.models import Location, Intervention
from .base import BaseAPITestCase


class TestInterventionListAPIView(BaseAPITestCase):

    generate_fake_data_quantity = 40

    def test_list_api(self):
        url = reverse('simple-intervention')
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            len(response.data),
            Intervention.objects.prefetch_related('locations').filter(locations__isnull=False).distinct().count()
        )


class TestLocationListAPIView(BaseAPITestCase):

    generate_fake_data_quantity = 40

    def test_list_api(self):
        response_plan_id = ResponsePlan.objects.first().id
        url = reverse('simple-location', kwargs={'response_plan_id': response_plan_id})
        response = self.client.get(url, format='json')

        result = ResponsePlan.objects.filter(id=response_plan_id).values_list(
            'clusters__cluster_objectives__reportables__locations',
            'clusters__cluster_objectives__cluster_activities__reportables__locations',
            'clusters__partner_projects__reportables__locations',
            'clusters__partner_projects__partner_activities__reportables__locations',
        ).distinct()
        pks = []
        [pks.extend(filter(lambda x: x is not None, part)) for part in result]
        expected = Location.objects.filter(pk__in=pks).count()

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), expected)


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
