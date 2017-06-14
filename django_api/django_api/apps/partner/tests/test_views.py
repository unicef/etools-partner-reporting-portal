import datetime
from django.urls import reverse
from django.conf import settings
from rest_framework import status
from core.tests.base import BaseAPITestCase
from core.common import FREQUENCY_LEVEL
from core.models import Location
from cluster.models import Cluster
from partner.models import PartnerProject


class TestPartnerProjectListCreateAPIView(BaseAPITestCase):

    @property
    def data(self):
        return {
            'clusters': [{"id": Cluster.objects.first().id}],
            'locations': [{"id": Location.objects.first().id}, {"id": Location.objects.last().id}],
            'title': 'partner project title',
            'start_date': datetime.date.today().strftime(settings.INPUT_DATA_FORMAT),
            'end_date': datetime.date.today().strftime(settings.INPUT_DATA_FORMAT),
            'status': 'Dra',
            'description': "description",
            'additional_information': "additional_information",
            'total_budget': 100000,
            'funding_source': "UNICEF",
        }

    def test_list_partner_project(self):
        """
        get list unit test for PartnerProjectListCreateAPIView
        """
        url = reverse('partner-project-list')
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['count'], PartnerProject.objects.all().count())

    def test_list_partner_project_by_cluster(self):
        """
        get list by given cluster id unit test for PartnerProjectListCreateAPIView
        """
        cluster_id = Cluster.objects.first().id
        url = reverse('partner-project-list', kwargs={"cluster_id": cluster_id})
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['count'], PartnerProject.objects.filter(clusters__in=[cluster_id]).count())

    def test_create_partner_project(self):
        """
        create unit test for ClusterObjectiveAPIView
        """
        base_count = PartnerProject.objects.all().count()
        last = PartnerProject.objects.last()

        # test for creating object
        url = reverse('partner-project-list')
        response = self.client.post(url, data=self.data, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['id'], (last.id+1))
        created_obj = PartnerProject.objects.get(id=response.data['id'])
        self.assertEquals(created_obj.title, self.data['title'])
        self.assertEquals(PartnerProject.objects.all().count(),  base_count + 1)


class TestPartnerProjectAPIView(BaseAPITestCase):

    def test_get_instance(self):
        first = PartnerProject.objects.first()
        url = reverse('partner-project-details', kwargs={"pk": first.id})
        response = self.client.get(url, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['id'], str(first.id))
        self.assertEquals(response.data['title'], first.title)

    def test_update_patch_partner_project(self):
        """
        patch object unit test for PartnerProjectAPIView
        """
        base_count = PartnerProject.objects.all().count()
        last = PartnerProject.objects.last()

        data = dict(id=last.id, title='new updated title')
        url = reverse('partner-project-details', kwargs={"pk": last.id})
        response = self.client.patch(url, data=data, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(PartnerProject.objects.all().count(), base_count)
        self.assertEquals(PartnerProject.objects.get(id=response.data['id']).title, data['title'])

    def test_delete_partner_project(self):
        base_count = PartnerProject.objects.all().count()
        last = PartnerProject.objects.last()
        url = reverse('partner-project-details', kwargs={"pk": last.id})
        response = self.client.delete(url, data={"id": last.pk}, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEquals(response.data, None)
        self.assertEquals(PartnerProject.objects.all().count(), base_count-1)