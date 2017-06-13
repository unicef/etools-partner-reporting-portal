from django.urls import reverse
from rest_framework import status
from core.tests.base import BaseAPITestCase
from core.common import FREQUENCY_LEVEL
from cluster.models import ClusterObjective, Cluster, ClusterActivity


class TestClusterObjectiveAPIView(BaseAPITestCase):

    title = "client post title"
    reference_number = "ref no 123"

    @property
    def data(self):
        return {
            "cluster": Cluster.objects.first().id,
            "reference_number": self.reference_number,
            "title": self.title,
            "frequency": FREQUENCY_LEVEL.weekly,
        }

    def test_create_cluster_objective(self):
        """
        create and update unit test for ClusterObjectiveAPIView
        :return:
        """
        base_count = ClusterObjective.objects.all().count()
        last = ClusterObjective.objects.last()

        # test for creating object
        url = reverse('cluster-objective-list')
        response = self.client.post(url, data=self.data, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['id'], (last.id+1))
        created_obj = ClusterObjective.objects.get(id=response.data['id'])
        self.assertEquals(created_obj.reference_number, "ref no 123")
        self.assertEquals(created_obj.frequency, FREQUENCY_LEVEL.weekly)
        self.assertEquals(ClusterObjective.objects.all().count(),  base_count + 1)

    def test_update_put_cluster_objective(self):
        """
        update object unit test for ClusterObjectiveAPIView
        """
        base_count = ClusterObjective.objects.all().count()
        last = ClusterObjective.objects.last()

        data = self.data
        data.update(dict(id=last.id))
        data['title'] = 'new updated title'
        data['reference_number'] = 'new updated reference_number'
        data['frequency'] = FREQUENCY_LEVEL.quarterly
        data['cluster'] = Cluster.objects.last().id
        url = reverse('cluster-objective')
        response = self.client.put(url, data=data, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(ClusterObjective.objects.all().count(), base_count)
        self.assertEquals(ClusterObjective.objects.get(id=response.data['id']).title, data['title'])

    def test_update_patch_cluster_objective(self):
        """
        patch object unit test for ClusterObjectiveAPIView
        """
        base_count = ClusterObjective.objects.all().count()
        last = ClusterObjective.objects.last()

        data = dict(id=last.id, title='new updated title')
        url = reverse('cluster-objective')
        response = self.client.patch(url, data=data, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(ClusterObjective.objects.all().count(), base_count)
        self.assertEquals(ClusterObjective.objects.get(id=response.data['id']).title, data['title'])

    def test_delete_cluster_objective(self):
        """
        delete object unit test for ClusterObjectiveAPIView
        """
        base_count = ClusterObjective.objects.all().count()
        last = ClusterObjective.objects.last()
        url = reverse('cluster-objective')
        response = self.client.delete(url, data={"id": last.pk}, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data, None)
        self.assertEquals(ClusterObjective.objects.all().count(), base_count-1)

    def test_read_cluster_objective(self):
        """
        read object unit test for ClusterObjectiveAPIView
        """
        last = ClusterObjective.objects.last()
        url = reverse('cluster-objective', kwargs={"pk": last.pk})
        response = self.client.get(url, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['id'], last.id)
        self.assertEquals(response.data['title'], last.title)

        # test for getting objects
        url = reverse('cluster-objective-list')
        response = self.client.get(url, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['count'], ClusterObjective.objects.all().count())

        # test for getting objects by given filter parameter title or reference number
        response = self.client.get(url + "?ref_title=%s"%last.title[10:], format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['count'], 1)
        response = self.client.get(url + "?ref_title=%s"%last.title[:10], format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['count'], 3)

        # test for defined cluster
        url = reverse('cluster-objective-list', kwargs={'cluster_id': last.cluster_id})
        response = self.client.get(url, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['count'], 1)


class TestClusterActivityAPIView(BaseAPITestCase):

    @property
    def data(self):
        return {
            "title": "Water for thirsty",
            "standard": "Bottle of water with UNICEF logo.",
            "frequency": FREQUENCY_LEVEL.weekly,
            "cluster_objective": ClusterObjective.objects.first().id,
        }

    def test_list_cluster_activity(self):
        """
        get list unit test for ClusterActivityAPIView
        """
        url = reverse('cluster-activity-list')
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['count'], ClusterActivity.objects.all().count())

    def test_filter_list_cluster_activity(self):
        """
        get list unit test for ClusterActivityAPIView
        """
        last = ClusterActivity.objects.last()
        url = reverse('cluster-activity-list')
        response = self.client.get(url + "?title=%s"%last.title, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['count'], 1)
        self.assertEquals(response.data['results'][0]['id'], last.id)

    def test_create_cluster_activity(self):
        """
        create unit test for ClusterActivityAPIView
        """
        base_count = ClusterActivity.objects.all().count()
        last = ClusterActivity.objects.last()

        # test for creating object
        url = reverse('cluster-activity-list')
        response = self.client.post(url, data=self.data, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['id'], (last.id+1))
        created_obj = ClusterActivity.objects.get(id=response.data['id'])
        self.assertEquals(created_obj.title, self.data["title"])
        self.assertEquals(created_obj.frequency, FREQUENCY_LEVEL.weekly)
        self.assertEquals(ClusterActivity.objects.all().count(),  base_count + 1)

    def test_get_cluster_activity(self):
        """
        get obj unit test for ClusterActivityAPIView
        """
        first = ClusterActivity.objects.first()
        url = reverse('cluster-activity', kwargs={"pk": first.id})
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['id'], first.id)
        self.assertEquals(response.data['title'], first.title)
        self.assertEquals(response.data['standard'], first.standard)

    def test_update_patch_cluster_objective(self):
        """
        patch object unit test for ClusterActivityAPIView
        """
        base_count = ClusterActivity.objects.all().count()
        last = ClusterActivity.objects.last()

        data = dict(id=last.id, title='new updated title')
        url = reverse('cluster-activity', kwargs={"pk": last.id})
        response = self.client.patch(url, data=data, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(ClusterActivity.objects.all().count(), base_count)
        self.assertEquals(ClusterActivity.objects.get(id=response.data['id']).title, data['title'])
