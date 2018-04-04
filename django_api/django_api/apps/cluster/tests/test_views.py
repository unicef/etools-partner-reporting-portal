# from django.urls import reverse

# from rest_framework imports status

# from core.tests.base imports BaseAPITestCase
# from core.common imports FREQUENCY_LEVEL
# from core.factories imports UserFactory

# from cluster.models imports ClusterObjective, Cluster, ClusterActivity


# class TestClusterObjectiveAPIView(BaseAPITestCase):

#     title = "client post title"
#     reference_number = "ref no 123"

#     def setUp(self):
#         super().setUp()
#         self.data = {
#             "cluster": Cluster.objects.first().id,
#             "title": self.title,
#         }

#         # Logging in as IMO admin
#         self.client.login(username='admin_imo', password='Passw0rd!')

#     def test_create_cluster_objective(self):
#         """
#         create and update unit test for ClusterObjectiveAPIView
#         :return:
#         """
#         base_count = ClusterObjective.objects.all().count()
#         last = ClusterObjective.objects.last()

#         # test for creating object
#         url = reverse(
#             'cluster-objective-list',
#             kwargs={
#                 'response_plan_id': last.cluster.response_plan_id})
#         response = self.client.post(url, data=self.data, format='json')

#         self.assertTrue(status.is_success(response.status_code))
#         ClusterObjective.objects.get(id=response.data['id'])
#         self.assertEquals(
#             ClusterObjective.objects.all().count(),
#             base_count + 1
#         )

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
#         url = reverse('cluster-objective')
#         response = self.client.put(url, data=data, format='json')

#         self.assertEquals(response.status_code, status.HTTP_404_NOT_FOUND)

#     def test_update_patch_cluster_objective(self):
#         """
#         patch object unit test for ClusterObjectiveAPIView
#         """
#         base_count = ClusterObjective.objects.all().count()
#         last = ClusterObjective.objects.last()

#         data = dict(id=last.id, title='new updated title')
#         url = reverse('cluster-objective')
#         response = self.client.patch(url, data=data, format='json')
#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(ClusterObjective.objects.all().count(), base_count)
#         self.assertEquals(
#             ClusterObjective.objects.get(
#                 id=response.data['id']).title,
#             data['title'])

#     def test_update_patch_non_existent_cluster_objective(self):
#         data = dict(id=9999999, title='new updated title')
#         url = reverse('cluster-objective')
#         response = self.client.patch(url, data=data, format='json')

#         self.assertEquals(response.status_code, status.HTTP_404_NOT_FOUND)

#     def test_delete_cluster_objective(self):
#         """
#         delete object unit test for ClusterObjectiveAPIView
#         """
#         base_count = ClusterObjective.objects.all().count()
#         last = ClusterObjective.objects.last()
#         url = reverse('cluster-objective')
#         response = self.client.delete(url, data={"id": last.pk}, format='json')
#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(response.data, None)
#         self.assertEquals(
#             ClusterObjective.objects.all().count(),
#             base_count - 1)

#     def test_delete_non_existent_cluster_objective(self):
#         url = reverse('cluster-objective')
#         response = self.client.delete(url, data={"id": 9999999}, format='json')

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
#         response = self.client.post(url, data=self.data, format='json')

#         self.assertTrue(status.is_success(response.status_code))
#         created_obj = ClusterActivity.objects.get(id=response.data['id'])
#         self.assertEquals(created_obj.title, self.data["title"])
#         self.assertEquals(created_obj.frequency, FREQUENCY_LEVEL.weekly)
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
#         self.assertEquals(response.data['standard'], first.standard)

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

#         data = self.data
#         data.update(dict(id=last.id))
#         data['title'] = 'new updated title'
#         data['standard'] = 'new updated standard'
#         data['frequency'] = FREQUENCY_LEVEL.quarterly
#         data['cluster_objective'] = ClusterObjective.objects.last().id
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

#     def test_get_partner_dashboard(self):
#         first_cluster = Cluster.objects.first()

#         url = reverse('cluster-dashboard', kwargs={
#             'response_plan_id': first_cluster.response_plan_id,
#             'cluster_id': first_cluster.id,
#         })

#         response = self.client.get(url, format='json')

#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(
#             response.data['num_of_partners'],
#             first_cluster.num_of_partners)
#         self.assertEquals(
#             response.data['num_of_met_indicator_reports'],
#             first_cluster.num_of_met_indicator_reports)
#         self.assertEquals(
#             response.data['num_of_constrained_indicator_reports'],
#             first_cluster.num_of_constrained_indicator_reports)
#         self.assertEquals(
#             response.data['num_of_non_cluster_activities'],
#             first_cluster.num_of_non_cluster_activities)
#         self.assertEquals(
#             response.data['new_indicator_reports'],
#             first_cluster.new_indicator_reports)
#         self.assertEquals(
#             len(
#                 response.data['overdue_indicator_reports']),
#             first_cluster.overdue_indicator_reports.count())
#         self.assertEquals(
#             len(
#                 response.data['constrained_indicator_reports']),
#             first_cluster.constrained_indicator_reports.count())


# class TestClusterPartnerDashboardAPIView(BaseAPITestCase):

#     def test_get_partner_dashboard(self):
#         first_cluster = Cluster.objects.filter(partners__isnull=False).first()
#         partner = first_cluster.partners.first()
#         user = partner.users.first()

#         if not user:
#             user = UserFactory(
#                 first_name="Test",
#                 last_name="1")
#             user.partner = partner

#         user.set_password('Passw0rd!')
#         user.save()

#         url = reverse('cluster-partner-dashboard', kwargs={
#             'response_plan_id': first_cluster.response_plan_id,
#             'cluster_id': first_cluster.id,
#         })

#         response = self.client.get(url, format='json')

#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(
#             response.data['num_of_due_overdue_indicator_reports'],
#             first_cluster.num_of_due_overdue_indicator_reports_partner(partner))
#         self.assertEquals(
#             response.data['num_of_indicator_targets_met'],
#             first_cluster.num_of_indicator_targets_met_partner(partner))
#         self.assertEquals(
#             response.data['num_of_projects_in_my_organization'],
#             first_cluster.num_of_projects_in_my_organization_partner(partner))
#         self.assertEquals(
#             response.data['num_of_constrained_indicator_reports'],
#             first_cluster.num_of_constrained_indicator_reports(
#                 partner=partner))
#         self.assertEquals(
#             response.data['num_of_non_cluster_activities'],
#             first_cluster.num_of_non_cluster_activities_partner(partner))
#         self.assertEquals(len(response.data['overdue_indicator_reports']),
#                           first_cluster.overdue_indicator_reports_partner(partner).count())
#         self.assertEquals(len(response.data['my_project_activities']),
#                           first_cluster.my_project_activities_partner(partner).count())
#         self.assertEquals(
#             len(
#                 response.data['constrained_indicator_reports']),
#             first_cluster.constrained_indicator_reports_partner(partner).count())
