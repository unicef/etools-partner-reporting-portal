from django.urls import reverse

from rest_framework import status

from faker import Faker

from core.tests.base import BaseAPITestCase
from core.common import FREQUENCY_LEVEL, PRP_ROLE_TYPES, CLUSTER_TYPES
from core.factories import (
    NonPartnerUserFactory,
    PartnerFactory,
    CountryFactory,
    WorkspaceFactory,
    NonPartnerUserFactory,
    ClusterPRPRoleFactory,
    ResponsePlanFactory,
    ClusterFactory,
    GatewayTypeFactory,
    CartoDBTableFactory,
    ClusterObjectiveFactory,
    LocationFactory,
)

from cluster.models import ClusterObjective, Cluster, ClusterActivity

faker = Faker()


class ClusterListAPIViewTestCase(BaseAPITestCase):

    def setUp(self):
        self.country = CountryFactory()
        self.workspace = WorkspaceFactory(countries=[self.country, ])
        self.response_plan = ResponsePlanFactory(workspace=self.workspace)
        self.user = NonPartnerUserFactory()

        super().setUp()

    def test_invalid_list_requests(self):
        """Test the API response for invalid payloads.
        """
        # User must be logged in
        self.client.logout()

        response = self.client.get(reverse('cluster-list', kwargs={'response_plan_id': self.response_plan.id}))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cluster_list_and_filtering(self):
        """Test the API response and queryset count.
        Also, the filtering by ClusterFilter will be tested: partner.
        """
        # Create some test clusters
        TEST_CLUSTERS = set(["cccm", "early_recovery", "education"])
        for cluster_type in TEST_CLUSTERS:
            cluster = ClusterFactory(type=cluster_type, response_plan=self.response_plan)

            # Associate partner to created cluster for filtering later
            PartnerFactory(clusters=[cluster, ])
            ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=cluster, role=PRP_ROLE_TYPES.cluster_imo)

        response = self.client.get(reverse('cluster-list', kwargs={'response_plan_id': self.response_plan.id}))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(TEST_CLUSTERS), len(response.data))
        self.assertEqual(TEST_CLUSTERS, set(map(lambda item: item['type'], response.data)))

        # API Filtering test
        target_cluster = self.response_plan.clusters.last()
        filter_partner = target_cluster.partners.last()
        filter_args = "?partner={}".format(filter_partner.id)

        response = self.client.get(reverse('cluster-list', kwargs={'response_plan_id': self.response_plan.id}) + filter_args)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(1, len(response.data))
        self.assertEqual(target_cluster.type, response.data[0]['type'])


class ClusterObjectiveListCreateAPIViewTestCase(BaseAPITestCase):

    def setUp(self):
        self.country = CountryFactory()
        self.workspace = WorkspaceFactory(countries=[self.country, ])
        self.response_plan = ResponsePlanFactory(workspace=self.workspace)
        self.cluster = ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.user = NonPartnerUserFactory()
        self.loc_type = GatewayTypeFactory(country=self.country)
        self.carto_table = CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)

        super().setUp()

    def test_invalid_list_requests(self):
        """Test the API response for invalid payloads.
        """

        # User must have PRP role
        self.user.prp_roles.all().delete()

        response = self.client.get(reverse('cluster-objective-list', kwargs={'response_plan_id': self.response_plan.id}))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # User must be logged in
        self.client.logout()

        response = self.client.get(reverse('cluster-objective-list', kwargs={'response_plan_id': self.response_plan.id}))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cluster_objective_list_and_filtering_and_ordering(self):
        """Test the API response and queryset count with ordering.
        Also, the filtering by ClusterObjectiveFilter will be tested: partner.
        """
        for _ in range(3):
            ClusterObjectiveFactory(
                cluster=self.cluster,
                locations=[
                    LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table),
                    LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
                ]
            )

        url = reverse(
            'cluster-objective-list',
            kwargs={'response_plan_id': self.response_plan.id}
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            self.cluster.cluster_objectives.all().count(),
            response.data['count']
        )

        # Sorting
        response = self.client.get(url + '?sort=title.desc')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            self.cluster.cluster_objectives.order_by('-title').first().id,
            response.data['results'][0]['id']
        )

        # Filterings
        target_objective = self.cluster.cluster_objectives.last()
        filter_args = '?ref_title={}&clusters={}&cluster_id={}'.format(target_objective.title, self.cluster.id, self.cluster.id)

        response = self.client.get(url + filter_args)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            target_objective.id,
            response.data['results'][0]['id']
        )

    def test_cluster_objective_create(self):
        """Test the API response to create ClusterObjective instance.
        """
        base_count = self.cluster.cluster_objectives.all().count()
        data = {
            'title': faker.sentence(),
            'cluster': self.cluster.id,
        }

        url = reverse(
            'cluster-objective-list',
            kwargs={'response_plan_id': self.response_plan.id}
        )
        response = self.client.post(url, data=data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEquals(
            self.cluster.cluster_objectives.all().count(),
            base_count + 1
        )

    def test_cluster_objective_create_validation_error(self):
        """Test the API response to throw a validation error if user has no cluster access.
        """
        new_cluster = ClusterFactory(type='education', response_plan=self.response_plan)

        data = {
            'title': faker.sentence(),
            'cluster': new_cluster.id,
        }

        url = reverse(
            'cluster-objective-list',
            kwargs={'response_plan_id': self.response_plan.id}
        )
        response = self.client.post(url, data=data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

#     def test_update_put_cluster_objective(self):
#         """
#         update object unit test for ClusterObjectiveAPIView
#         """
#         base_count = ClusterObjective.objects.all().count()
#         last = ClusterObjective.objects.last()

#         data = self.data
#         data.update(dict(id=last.id))
#         data['title'] = 'new updated title'
#         data['reference_number'] = 'new updated reference_number'
#         data['frequency'] = FREQUENCY_LEVEL.quarterly
#         data['cluster'] = Cluster.objects.last().id
#         url = reverse('cluster-objective')
#         response = self.client.put(url, data=data, format='json')
#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(ClusterObjective.objects.all().count(), base_count)
#         self.assertEquals(
#             ClusterObjective.objects.get(
#                 id=response.data['id']).title,
#             data['title'])

#     def test_update_put_non_existent_cluster_objective(self):
#         data = self.data
#         data.update(dict(id=9999999, title='new updated title'))
#         url = reverse('cluster-objective', kwargs={"pk": 9999999})
#         response = self.client.put(url, data=data, format='json')

#         self.assertEquals(response.status_code, status.HTTP_404_NOT_FOUND)

#     def test_update_patch_cluster_objective(self):
#         """
#         patch object unit test for ClusterObjectiveAPIView
#         """
#         base_count = ClusterObjective.objects.all().count()
#         last = ClusterObjective.objects.last()

#         data = dict(id=last.id, title='new updated title')
#         url = reverse('cluster-objective', kwargs={"pk": last.id})
#         response = self.client.patch(url, data=data, format='json')
#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(ClusterObjective.objects.all().count(), base_count)
#         self.assertEquals(
#             ClusterObjective.objects.get(
#                 id=response.data['id']).title,
#             data['title'])

#     def test_update_patch_non_existent_cluster_objective(self):
#         data = dict(id=9999999, title='new updated title')
#         url = reverse('cluster-objective', kwargs={"pk": 9999999})
#         response = self.client.patch(url, data=data, format='json')

#         self.assertEquals(response.status_code, status.HTTP_404_NOT_FOUND)

#     def test_read_cluster_objective(self):
#         """
#         read object unit test for ClusterObjectiveAPIView
#         """
#         last = ClusterObjective.objects.last()
#         url = reverse('cluster-objective', kwargs={"pk": last.pk})
#         response = self.client.get(url, format='json')
#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(response.data['id'], last.id)
#         self.assertEquals(response.data['title'], last.title)

#         # test for getting objects
#         url = reverse(
#             'cluster-objective-list',
#             kwargs={
#                 'response_plan_id': last.cluster.response_plan_id})
#         response = self.client.get(url, format='json')
#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(response.data['count'], ClusterObjective.objects.filter(
#             cluster__response_plan_id=last.cluster.response_plan_id).count())

#         # test for getting objects by given filter parameter title or reference number
#         response = self.client.get(url +
#                                    "?ref_title=%s" %
#                                    last.title[10:], format='json')
#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(response.data['count'], 1)

#         # test for defined cluster
#         url = reverse(
#             'cluster-objective-list',
#             kwargs={
#                 'response_plan_id': last.cluster.response_plan_id}) + "?cluster_id=" + str(
#             last.cluster_id)
#         response = self.client.get(url, format='json')
#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(response.data['count'], 1)

#     def test_read_non_existent_cluster_objective(self):
#         """
#         read object unit test for ClusterObjectiveAPIView
#         """
#         url = reverse('cluster-objective', kwargs={"pk": 9999999})
#         response = self.client.get(url, format='json')

#         self.assertEquals(response.status_code, status.HTTP_404_NOT_FOUND)


# class TestClusterActivityAPIView(BaseAPITestCase):

#     def setUp(self):
#         super().setUp()

#         # Logging in as IMO admin
#         self.client.login(username='admin_imo', password='Passw0rd!')

#     @property
#     def data(self):
#         return {
#             "title": "Water for thirsty",
#             "standard": "Bottle of water with UNICEF logo.",
#             "frequency": FREQUENCY_LEVEL.weekly,
#             "cluster_objective": ClusterObjective.objects.first().id,
#         }

#     def test_list_cluster_activity(self):
#         """
#         get list unit test for ClusterActivityAPIView
#         """
#         cluster = Cluster.objects.first()
#         url = reverse('cluster-activity-list',
#                       kwargs={'response_plan_id': cluster.response_plan_id})
#         response = self.client.get(url, format='json')

#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(response.data['count'], ClusterActivity.objects.filter(
#             cluster_objective__cluster__response_plan_id=cluster.response_plan_id).count())

#     def test_filter_list_cluster_activity(self):
#         """
#         get list unit test for ClusterActivityAPIView
#         """
#         last = ClusterActivity.objects.last()
#         url = reverse(
#             'cluster-activity-list',
#             kwargs={
#                 'response_plan_id': last.cluster_objective.cluster.response_plan_id})
#         response = self.client.get(
#             url + "?title=%s" %
#             last.title, format='json')

#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(response.data['count'], 1)
#         self.assertEquals(response.data['results'][0]['id'], last.id)

#     def test_create_cluster_activity(self):
#         """
#         create unit test for ClusterActivityAPIView
#         """
#         base_count = ClusterActivity.objects.all().count()
#         last = ClusterActivity.objects.last()
#         url = reverse(
#             'cluster-activity-list',
#             kwargs={
#                 'response_plan_id': last.cluster_objective.cluster.response_plan_id})

#         # test for creating object
#         data = self.data
#         data['cluster'] = last.cluster.id

#         response = self.client.post(url, data=data, format='json')

#         self.assertTrue(status.is_success(response.status_code))
#         created_obj = ClusterActivity.objects.get(id=response.data['id'])
#         self.assertEquals(created_obj.title, self.data["title"])
#         self.assertEquals(
#             ClusterActivity.objects.all().count(),
#             base_count + 1)

#     def test_get_cluster_activity(self):
#         """
#         get obj unit test for ClusterActivityAPIView
#         """
#         first = ClusterActivity.objects.first()
#         url = reverse('cluster-activity', kwargs={"pk": first.id})
#         response = self.client.get(url, format='json')

#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(response.data['id'], first.id)
#         self.assertEquals(response.data['title'], first.title)

#     def test_get_non_existent_cluster_activity(self):
#         """
#         get obj unit test for ClusterActivityAPIView
#         """
#         url = reverse('cluster-activity', kwargs={"pk": 9999999})
#         response = self.client.get(url, format='json')

#         self.assertEquals(response.status_code, status.HTTP_404_NOT_FOUND)

#     def test_update_patch_cluster_activity(self):
#         """
#         patch object unit test for ClusterActivityAPIView
#         """
#         base_count = ClusterActivity.objects.all().count()
#         last = ClusterActivity.objects.last()

#         data = dict(id=last.id, title='new updated title')
#         url = reverse('cluster-activity', kwargs={"pk": last.id})
#         response = self.client.patch(url, data=data, format='json')
#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(ClusterActivity.objects.all().count(), base_count)
#         self.assertEquals(
#             ClusterActivity.objects.get(
#                 id=response.data['id']).title,
#             data['title'])

#     def test_update_patch_non_existent_cluster_activity(self):
#         """
#         patch object unit test for ClusterActivityAPIView
#         """
#         last = ClusterActivity.objects.last()

#         data = dict(id=last.id, title='new updated title')
#         url = reverse('cluster-activity', kwargs={"pk": 9999999})
#         response = self.client.patch(url, data=data, format='json')

#         self.assertEquals(response.status_code, status.HTTP_404_NOT_FOUND)

#     def test_update_put_cluster_activity(self):
#         """
#         update object unit test for ClusterActivityAPIView
#         """
#         base_count = ClusterActivity.objects.all().count()
#         last = ClusterActivity.objects.last()
#         obj = ClusterObjective.objects.last()

#         data = self.data
#         data.update(dict(id=last.id))
#         data['title'] = 'new updated title'
#         data['standard'] = 'new updated standard'
#         data['cluster_objective'] = obj.id
#         data['cluster'] = obj.cluster.id
#         url = reverse('cluster-activity', kwargs={"pk": last.id})
#         response = self.client.put(url, data=data, format='json')

#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(ClusterActivity.objects.all().count(), base_count)
#         self.assertEquals(
#             ClusterActivity.objects.get(
#                 id=response.data['id']).title,
#             data['title'])

#     def test_update_put_non_existent_cluster_activity(self):
#         """
#         update object unit test for ClusterActivityAPIView
#         """
#         last = ClusterActivity.objects.last()

#         data = self.data
#         data.update(dict(id=last.id))
#         url = reverse('cluster-activity', kwargs={"pk": 9999999})
#         response = self.client.put(url, data=data, format='json')

#         self.assertEquals(response.status_code, status.HTTP_404_NOT_FOUND)

#     def test_delete_cluster_activity(self):
#         """
#         delete object unit test for ClusterActivityAPIView
#         """
#         base_count = ClusterActivity.objects.all().count()
#         last = ClusterActivity.objects.last()
#         url = reverse('cluster-activity', kwargs={"pk": last.id})

#         response = self.client.delete(url, data={"id": last.pk}, format='json')
#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(response.data, None)
#         self.assertEquals(
#             ClusterActivity.objects.all().count(),
#             base_count - 1)

#         response = self.client.delete(url, data={"id": last.pk}, format='json')
#         self.assertEquals(status.HTTP_404_NOT_FOUND, response.status_code)


# class TestClusterDashboardAPIView(BaseAPITestCase):
#
#     def setUp(self):
#         super().setUp()
#
#         # Logging in as IMO admin
#         self.client.login(username='admin_imo', password='Passw0rd!')
#         self.user = User.objects.get(username='admin_imo')
#
#     def test_get_partner_dashboard(self):
#         first_cluster = Cluster.objects.first()
#
#         url = reverse('response-plan-cluster-dashboard', kwargs={
#             'response_plan_id': first_cluster.response_plan_id
#         }) + '?cluster_id=%d' % first_cluster.id
#
#         response = self.client.get(url, format='json')
#
#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(
#             response.data['num_of_partners'],
#             first_cluster.num_of_partners)
#         self.assertEquals(
#             response.data['num_of_met_indicator_reports'],
#             first_cluster.num_of_met_indicator_reports())
#         self.assertEquals(
#             response.data['num_of_constrained_indicator_reports'],
#             first_cluster.num_of_constrained_indicator_reports())
#         self.assertEquals(
#             response.data['num_of_non_cluster_activities'],
#             first_cluster.num_of_non_cluster_activities())
#         self.assertEquals(
#             len(
#                 response.data['overdue_indicator_reports']),
#             first_cluster.overdue_indicator_reports.count())
#         self.assertEquals(
#             len(
#                 response.data['constrained_indicator_reports']),
#             first_cluster.constrained_indicator_reports.count())
