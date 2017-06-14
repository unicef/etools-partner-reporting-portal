from django.urls import reverse
from rest_framework import status
from core.tests.base import BaseAPITestCase
from core.common import FREQUENCY_LEVEL
from partner.models import PartnerProject


class TestPartnerProjectListCreateAPIView(BaseAPITestCase):

    # @property
    # def data(self):
    #     return {
    #     }

    def test_list_partner_project(self):
        """
        get list unit test for ClusterActivityAPIView
        """
        url = reverse('partner-project')
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['count'], PartnerProject.objects.all().count())


    # def test_