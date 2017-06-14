from django.urls import reverse
from rest_framework import status
from core.tests.base import BaseAPITestCase
from core.common import FREQUENCY_LEVEL
from cluster.models import Cluster
from partner.models import PartnerProject


class TestPartnerProjectListCreateAPIView(BaseAPITestCase):

    # @property
    # def data(self):
    #     return {
    #     }

    def test_list_partner_project(self):
        """
        get list unit test for PartnerProjectListCreateAPIView
        """
        url = reverse('partner-project')
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['count'], PartnerProject.objects.all().count())

    def test_list_partner_project_by_cluster(self):
        cluster_id = Cluster.objects.first().id
        url = reverse('partner-project', kwargs={"cluster_id": cluster_id})
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['count'], PartnerProject.objects.filter(clusters__in=[cluster_id]).count())
