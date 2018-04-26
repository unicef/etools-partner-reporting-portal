from django.urls import reverse
from rest_framework import status

from cluster.models import Cluster
from cluster.serializers import ClusterSimpleSerializer
from core.factories import ClusterObjectiveFactory
from core.models import ResponsePlan, PartnerAuthorizedOfficerRole
from core.tests.base import BaseAPITestCase

from partner.models import (
    PartnerActivity,
)


# class TestPartnerProjectListCreateAPIView(BaseAPITestCase):

#     def setUp(self):
#         super(TestPartnerProjectListCreateAPIView, self).setUp()

#         self.cluster = Cluster.objects.first()

#         self.partner = PartnerFactory(
#             title="{} - {} Cluster Partner".format(
#                 self.cluster.response_plan.title, self.cluster.type),
#             partner_activity=None,
#             partner_project=None,
#             user=None,
#         )

#         self.partner.clusters.add(self.cluster)

#         self.pp = PartnerProjectFactory(
#             partner=self.cluster.partners.first(),
#             title="{} Partner Project".format(
#                 self.cluster.partners.first().title)
#         )

#         self.pp.clusters.add(self.cluster)

#         self.data = {
#             'clusters': [{"id": self.cluster.id}],
#             'locations': [{"id": Location.objects.first().id}, {"id": Location.objects.last().id}],
#             'title': 'partner project title',
#             'start_date': datetime.date.today().strftime(settings.INPUT_DATA_FORMAT),
#             'end_date': datetime.date.today().strftime(settings.INPUT_DATA_FORMAT),
#             'status': 'Ong',
#             'description': "description",
#             'additional_information': "additional_information",
#             'total_budget': 100000,
#             'funding_source': "UNICEF",
#         }

#         # Logging in as Partner AO
#         self.client.login(username='admin_ao', password='Passw0rd!')

#     def test_list_partner_project(self):
#         """
#         get list unit test for PartnerProjectListCreateAPIView
#         """
#         url = reverse(
#             'partner-project-list',
#             kwargs={
#                 'response_plan_id': self.cluster.response_plan_id})
#         response = self.client.get(url, format='json')

#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(response.data['count'], PartnerProject.objects.filter(
#             clusters__response_plan_id=self.cluster.response_plan_id).count())

#     def test_list_partner_project_by_cluster(self):
#         """
#         get list by given cluster id unit test for PartnerProjectListCreateAPIView
#         """
#         cluster_id = self.cluster.id
#         url = reverse(
#             'partner-project-list',
#             kwargs={
#                 'response_plan_id': self.cluster.response_plan_id}) + "?cluster_id=" + str(cluster_id)
#         response = self.client.get(url, format='json')

#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(
#             response.data['count'],
#             PartnerProject.objects.filter(
#                 clusters__in=[cluster_id]).count())

#     def test_create_partner_project(self):
#         """
#         create unit test for ClusterObjectiveAPIView
#         """
#         base_count = PartnerProject.objects.all().count()

#         # test for creating object
#         url = reverse(
#             'partner-project-list',
#             kwargs={
#                 'response_plan_id': self.cluster.response_plan_id})
#         response = self.client.post(url, data=self.data, format='json')

#         self.assertTrue(status.is_success(response.status_code))
#         created_obj = PartnerProject.objects.get(id=response.data['id'])
#         self.assertEquals(created_obj.title, self.data['title'])
#         self.assertEquals(PartnerProject.objects.all().count(), base_count + 1)

#     def test_list_filters_partner_project(self):
#         """
#         get list unit test for PartnerProjectListCreateAPIView
#         """
#         pp = self.cluster.partner_projects.first()
#         location = Location.objects.first()
#         pp.locations.add(location)
#         url = reverse(
#             'partner-project-list',
#             kwargs={
#                 'response_plan_id': self.cluster.response_plan_id})
#         url += "?location=%d" % location.id
#         response = self.client.get(url, format='json')

#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(response.data['count'], 1)
#         self.assertEquals(response.data['results'][0]['id'], str(pp.id))
#         self.assertEquals(response.data['results'][0]['title'], pp.title)
#         self.assertEquals(
#             response.data['results'][0]['locations'][0]['id'], str(
#                 location.id))

#         partner = self.cluster.partners.first()
#         url = reverse(
#             'partner-project-list',
#             kwargs={
#                 'response_plan_id': self.cluster.response_plan_id})
#         url += "?partner=%d" % partner.id
#         response = self.client.get(url, format='json')
#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(response.data['count'], 1)
#         self.assertEquals(
#             response.data['results'][0]['partner'], str(
#                 partner.id))


# class TestPartnerProjectAPIView(BaseAPITestCase):

#     def setUp(self):
#         super().setUp()

#         # Logging in as Partner AO
#         self.client.login(username='admin_ao', password='Passw0rd!')

#     def test_get_instance(self):
#         first = PartnerProject.objects.first()
#         url = reverse('partner-project-details', kwargs={"pk": first.id})
#         response = self.client.get(url, format='json')
#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(response.data['id'], str(first.id))
#         self.assertEquals(response.data['title'], first.title)

#     def test_get_non_existent_instance(self):
#         url = reverse('partner-project-details', kwargs={"pk": 9999999})
#         response = self.client.get(url, format='json')

#         self.assertEquals(response.status_code, status.HTTP_404_NOT_FOUND)

#     def test_update_patch_partner_project(self):
#         """
#         patch object unit test for PartnerProjectAPIView
#         """
#         base_count = PartnerProject.objects.all().count()
#         last = PartnerProject.objects.last()

#         data = dict(id=last.id, title='new updated title')
#         url = reverse('partner-project-details', kwargs={"pk": last.id})
#         response = self.client.patch(url, data=data, format='json')
#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(PartnerProject.objects.all().count(), base_count)
#         self.assertEquals(
#             PartnerProject.objects.get(
#                 id=response.data['id']).title,
#             data['title'])

#     def test_update_patch_non_existent_partner_project(self):
#         """
#         patch object unit test for PartnerProjectAPIView
#         """
#         data = dict(id=9999999, title='new updated title')
#         url = reverse('partner-project-details', kwargs={"pk": 9999999})
#         response = self.client.patch(url, data=data, format='json')

#         self.assertEquals(response.status_code, status.HTTP_404_NOT_FOUND)

#     def test_delete_partner_project(self):
#         base_count = PartnerProject.objects.all().count()
#         last = PartnerProject.objects.last()
#         url = reverse('partner-project-details', kwargs={"pk": last.id})
#         response = self.client.delete(url, data={"id": last.pk}, format='json')
#         self.assertTrue(status.is_success(response.status_code))
#         self.assertEquals(response.status_code, status.HTTP_204_NO_CONTENT)
#         self.assertEquals(response.data, None)
#         self.assertEquals(PartnerProject.objects.all().count(), base_count - 1)

#     def test_delete_non_existent_partner_project(self):
#         base_count = PartnerProject.objects.all().count()
#         last = PartnerProject.objects.last()
#         url = reverse('partner-project-details', kwargs={"pk": 9999999})
#         response = self.client.delete(
#             url, data={"id": last.pk + 1}, format='json')

#         self.assertEquals(response.status_code, status.HTTP_404_NOT_FOUND)
#         self.assertEquals(PartnerProject.objects.all().count(), base_count)


class TestPartnerActivityAPIView(BaseAPITestCase):

    force_login_as_role = PartnerAuthorizedOfficerRole

    def setUp(self):
        super(TestPartnerActivityAPIView, self).setUp()

        partner = self.user.partner
        self.cluster = partner.clusters.first()
        self.partner_project = partner.partner_projects.first()
        self.cluster_objective = ClusterObjectiveFactory(cluster=self.cluster)

        self.data = {
            "cluster": self.cluster.id,
            "partner": partner.id,
            "project": self.partner_project.id,
            "start_date": "2017-01-01",
            "end_date": "2017-05-31",
            "status": "Ong"
        }

    def test_create_activity_from_cluster_activity(self):
        base_count = PartnerActivity.objects.all().count()

        self.cluster_activity = self.cluster.cluster_objectives.first().cluster_activities.first()

        self.data['cluster_activity'] = self.cluster_activity.id

        # test for creating object
        url = reverse(
            'partner-activity-create',
            kwargs={
                'response_plan_id': self.cluster.response_plan_id,
                'create_mode': 'cluster',
            }
        )

        response = self.client.post(url, data=self.data, format='json')

        self.assertTrue(status.is_success(response.status_code), msg=response.content)
        created_obj = PartnerActivity.objects.get(id=response.data['id'])
        self.assertEquals(created_obj.title, self.cluster_activity.title)
        self.assertEquals(PartnerActivity.objects.all().count(), base_count + 1)

    def test_create_activity_from_custom_activity(self):
        base_count = PartnerActivity.objects.all().count()

        self.data['cluster_objective'] = self.cluster.cluster_objectives.first().id

        self.data['title'] = 'TEST'

        # test for creating object
        url = reverse(
            'partner-activity-create',
            kwargs={
                'response_plan_id': self.cluster.response_plan_id,
                'create_mode': 'custom',
            }
        )

        response = self.client.post(url, data=self.data, format='json')

        self.assertTrue(status.is_success(response.status_code), msg=response.content)
        created_obj = PartnerActivity.objects.get(id=response.data['id'])
        self.assertEquals(created_obj.title, self.data['title'])
        self.assertEquals(
            PartnerActivity.objects.all().count(),
            base_count + 1
        )


class TestPartnerProjectAPIView(BaseAPITestCase):

    def test_create_project(self):
        rp = ResponsePlan.objects.first()
        project_data = {
            'title': 'Test Partner Project',
            'start_date': '2013-01-01',
            'end_date': '2018-01-01',
            'partner_id': rp.clusters.first().partners.first().id,
        }

        url = reverse("partner-project-list", kwargs={'response_plan_id': rp.pk})
        response = self.client.post(url, data=project_data, format='json')
        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST, msg=response.content)
        self.assertIn('clusters', response.data)

        project_data['clusters'] = ClusterSimpleSerializer(rp.clusters.all(), many=True).data
        response = self.client.post(url, data=project_data, format='json')
        self.assertEquals(response.status_code, status.HTTP_201_CREATED, msg=response.content)

    def test_end_lt_start(self):
        rp = ResponsePlan.objects.first()
        project_data = {
            'title': 'Test Partner Project',
            'start_date': '2018-01-01',
            'end_date': '2013-01-01',
            'partner_id': rp.clusters.first().partners.first().id,
            'clusters': ClusterSimpleSerializer(rp.clusters.all(), many=True).data
        }

        url = reverse("partner-project-list", kwargs={'response_plan_id': rp.pk})
        response = self.client.post(url, data=project_data, format='json')
        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST, msg=response.content)
        self.assertIn('end_date', response.data)

    def test_create_project_with_custom_fields(self):
        rp = ResponsePlan.objects.first()
        project_data = {
            'title': 'Test Partner Project',
            'start_date': '2013-01-01',
            'end_date': '2018-01-01',
            'partner_id': rp.clusters.first().partners.first().id,
            'custom_fields': [{
                'name': 'Test Field 1',
                'value': '1',
            }, {
                'name': 'Test Field 2',
                'value': '2',
            }],
            'clusters': ClusterSimpleSerializer(rp.clusters.all(), many=True).data
        }

        url = reverse("partner-project-list", kwargs={'response_plan_id': rp.pk})
        response = self.client.post(url, data=project_data, format='json')
        self.assertEquals(response.status_code, status.HTTP_201_CREATED, msg=response.content)
        self.assertEquals(len(response.data['custom_fields']), 2)
