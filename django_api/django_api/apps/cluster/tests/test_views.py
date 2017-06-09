from django.urls import reverse
from rest_framework import status
from core.tests.base import BaseAPITestCase
from core.common import FREQUENCY_LEVEL
from cluster.models import ClusterObjective


class TestClusterObjectiveAPIView(BaseAPITestCase):

    def test_crud_cluster_objective(self):
        """
        create and update unit test for ClusterObjectiveAPIView
        :return:
        """
        base_count = ClusterObjective.objects.all().count()
        last = ClusterObjective.objects.last()
        url = reverse('cluster-objective')
        data = {
            "cluster": 1,
            "reference_number": "ref no 123",
            "title": "client post title",
            "frequency": FREQUENCY_LEVEL.weekly,
        }
        response = self.client.post(url, data=data, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['id'], (last.id+1))
        created_obj = ClusterObjective.objects.get(id=response.data['id'])
        self.assertEquals(created_obj.reference_number, "ref no 123")
        self.assertEquals(created_obj.frequency, FREQUENCY_LEVEL.weekly)
        self.assertTrue(ClusterObjective.objects.all().count() > base_count)

        new_count = base_count + 1
        obj_to_update_id = response.data['id']
        data.update(dict(id=obj_to_update_id))
        data['title'] = 'new updated title'
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(ClusterObjective.objects.all().count(), new_count)
        self.assertEquals(ClusterObjective.objects.get(id=response.data['id']).title, data['title'])

        self.assertFalse((ClusterObjective.objects.filter(title="curl post title").exists()))

        response = self.client.delete(url, data=data, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data, None)
        self.assertEquals(ClusterObjective.objects.all().count(), base_count)

        url = reverse('cluster-objective', kwargs={"pk": last.pk})
        response = self.client.get(url, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['id'], last.id)
        self.assertEquals(response.data['title'], last.title)

        url = reverse('cluster-objective-list')
        response = self.client.get(url, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['count'], ClusterObjective.objects.all().count())

        response = self.client.get(url + "?ref_title=2", format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['count'], 1)
