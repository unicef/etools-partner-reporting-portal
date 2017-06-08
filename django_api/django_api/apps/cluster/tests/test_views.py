from django.urls import reverse
from rest_framework import status
from core.tests.base import BaseAPITestCase
from cluster.models import ClusterObjective


class TestClusterObjectiveAPIView(BaseAPITestCase):

    def test_create_cluster_objective(self):
        """
        create and update unit test for ClusterObjectiveAPIView
        :return:
        """
        count = ClusterObjective.objects.all().count()
        last = ClusterObjective.objects.last()
        url = reverse('cluster-objective')
        data = {
            "cluster": 1,
            "reference_number": "ref no 123",
            "title": "curl post title"
        }
        response = self.client.post(url, data=data, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['id'], (last.id+1))
        self.assertTrue(ClusterObjective.objects.all().count() > count)

        new_count = count + 1
        obj_to_update_id = response.data['id']
        data.update(dict(id=obj_to_update_id))
        data['title'] = 'new updated title'
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(ClusterObjective.objects.all().count(), new_count)
        self.assertEquals(ClusterObjective.objects.get(id=response.data['id']).title, data['title'])

        self.assertFalse((ClusterObjective.objects.filter(title="curl post title").exists()))
