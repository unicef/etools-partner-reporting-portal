from django.urls import reverse

from rest_framework import status

from faker import Faker

from core.tests.base import BaseAPITestCase
from core.common import FREQUENCY_LEVEL, PRP_ROLE_TYPES, CLUSTER_TYPES, INDICATOR_REPORT_STATUS
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
    ClusterActivityFactory,
    PartnerProjectFactory,
    ClusterActivityPartnerActivityFactory,
    QuantityTypeIndicatorBlueprintFactory,
    QuantityReportableToClusterActivityFactory,
    QuantityReportableToPartnerActivityFactory,
    QuantityReportableToClusterObjectiveFactory,
    QuantityReportableToPartnerProjectFactory,
    ClusterIndicatorReportFactory,
    IndicatorLocationDataFactory,
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


class ClusterObjectiveAPIViewTestCase(BaseAPITestCase):

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

    def test_invalid_requests(self):
        """Test the API response for invalid payloads.
        """
        obj = ClusterObjectiveFactory(
            cluster=self.cluster,
            locations=[
                LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table),
                LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
            ]
        )

        url = reverse(
            'cluster-objective',
            kwargs={'pk': obj.id}
        )

        # User must have PRP role
        self.user.prp_roles.all().delete()

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # User must be logged in
        self.client.logout()

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cluster_objective_detail(self):
        """Test the API response to get ClusterObjective detail response.
        """
        obj = ClusterObjectiveFactory(
            cluster=self.cluster,
            locations=[
                LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table),
                LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
            ]
        )

        # Non-existent cluster objective should throw 404 response
        url = reverse(
            'cluster-objective',
            kwargs={'pk': 9999999}
        )

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # API response should return same ClusterObjective ID from database
        url = reverse(
            'cluster-objective',
            kwargs={'pk': obj.id}
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            obj.id,
            response.data['id']
        )

    def test_update_put_cluster_objective(self):
        """Test the API response to update ClusterObjective object as a whole.
        """
        obj = ClusterObjectiveFactory(
            cluster=self.cluster,
            locations=[
                LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table),
                LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
            ]
        )

        new_title = faker.sentence()
        data = {
            'title': new_title,
            'cluster': self.cluster.id,
        }

        url = reverse(
            'cluster-objective',
            kwargs={'pk': obj.id}
        )
        response = self.client.put(url, data=data)

        # id payload field is required
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Non-existent cluster objective should throw 404 response
        url = reverse(
            'cluster-objective',
            kwargs={'pk': 9999999}
        )

        data['id'] = 9999999
        response = self.client.put(url, data=data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Successful response should return new title
        data['id'] = obj.id
        response = self.client.put(url, data=data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(new_title, response.data['title'])

    def test_update_patch_cluster_objective(self):
        """Test the API response to update ClusterObjective object partially.
        """
        obj = ClusterObjectiveFactory(
            cluster=self.cluster,
            locations=[
                LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table),
                LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
            ]
        )

        new_title = faker.sentence()
        data = {
            'title': new_title,
            'cluster': self.cluster.id,
        }

        # Non-existent cluster objective should throw 404 response
        url = reverse(
            'cluster-objective',
            kwargs={'pk': 9999999}
        )

        response = self.client.patch(url, data=data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Successful response should return new title
        url = reverse(
            'cluster-objective',
            kwargs={'pk': obj.id}
        )
        response = self.client.patch(url, data=data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(new_title, response.data['title'])


class ClusterActivityListAPIViewTestCase(BaseAPITestCase):

    def setUp(self):
        self.country = CountryFactory()
        self.workspace = WorkspaceFactory(countries=[self.country, ])
        self.response_plan = ResponsePlanFactory(workspace=self.workspace)
        self.cluster = ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.user = NonPartnerUserFactory()
        self.loc_type = GatewayTypeFactory(country=self.country)
        self.carto_table = CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)

        self.loc1 = LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)

        self.objective = ClusterObjectiveFactory(
            cluster=self.cluster,
            locations=[
                self.loc1,
                self.loc2,
            ]
        )

        super().setUp()

    def test_invalid_list_requests(self):
        """Test the API response for invalid payloads.
        """

        # User must have PRP role
        self.user.prp_roles.all().delete()

        response = self.client.get(reverse('cluster-activity-list', kwargs={'response_plan_id': self.response_plan.id}))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # User must be logged in
        self.client.logout()

        response = self.client.get(reverse('cluster-activity-list', kwargs={'response_plan_id': self.response_plan.id}))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cluster_actvitiy_list_and_filtering_and_ordering(self):
        """Test the API response and queryset count with ordering.
        Also, the filtering by ClusterActivityFilter will be tested: partner.
        """
        for _ in range(3):
            ClusterActivityFactory(
                cluster_objective=self.objective,
                locations=[self.loc1, self.loc2, ]
            )

        url = reverse(
            'cluster-activity-list',
            kwargs={'response_plan_id': self.response_plan.id}
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            self.objective.cluster_activities.all().count(),
            response.data['count']
        )

        # Sorting
        response = self.client.get(url + '?sort=title.desc')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            self.objective.cluster_activities.order_by('-title').first().id,
            response.data['results'][0]['id']
        )

        # Filterings
        target_activity = self.objective.cluster_activities.last()
        filter_args = '?title={}&cluster_id={}&cluster_objective_id={}'.format(target_activity.title, self.cluster.id, self.objective.id)

        response = self.client.get(url + filter_args)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            target_activity.id,
            response.data['results'][0]['id']
        )

    def test_cluster_activity_create(self):
        """Test the API response to create ClusterActivity instance.
        """
        base_count = self.objective.cluster_activities.all().count()
        data = {
            'title': faker.sentence(),
            'cluster': self.cluster.id,
            'cluster_objective': self.objective.id,
        }

        url = reverse(
            'cluster-activity-list',
            kwargs={'response_plan_id': self.response_plan.id}
        )
        response = self.client.post(url, data=data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEquals(
            self.objective.cluster_activities.all().count(),
            base_count + 1
        )

    def test_cluster_activity_create_validation_error(self):
        """Test the API response to throw a validation error if user has no cluster access.
        """
        new_cluster = ClusterFactory(type='education', response_plan=self.response_plan)

        data = {
            'title': faker.sentence(),
            'cluster': new_cluster.id,
        }

        url = reverse(
            'cluster-activity-list',
            kwargs={'response_plan_id': self.response_plan.id}
        )
        response = self.client.post(url, data=data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ClusterActivityAPIViewTestCase(BaseAPITestCase):

    def setUp(self):
        self.country = CountryFactory()
        self.workspace = WorkspaceFactory(countries=[self.country, ])
        self.response_plan = ResponsePlanFactory(workspace=self.workspace)
        self.cluster = ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.user = NonPartnerUserFactory()
        self.loc_type = GatewayTypeFactory(country=self.country)
        self.carto_table = CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)

        self.loc1 = LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)

        self.objective = ClusterObjectiveFactory(
            cluster=self.cluster,
            locations=[
                self.loc1,
                self.loc2,
            ]
        )

        super().setUp()

    def test_invalid_requests(self):
        """Test the API response for invalid payloads.
        """
        obj = ClusterActivityFactory(
            cluster_objective=self.objective,
            locations=[
                self.loc1, self.loc2
            ]
        )

        url = reverse(
            'cluster-activity',
            kwargs={'pk': obj.id}
        )

        # User must have PRP role
        self.user.prp_roles.all().delete()

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # User must be logged in
        self.client.logout()

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cluster_activity_detail(self):
        """Test the API response to get ClusterActivity detail response.
        """
        obj = ClusterActivityFactory(
            cluster_objective=self.objective,
            locations=[
                self.loc1, self.loc2
            ]
        )

        # Non-existent cluster activity should throw 404 response
        url = reverse(
            'cluster-activity',
            kwargs={'pk': 9999999}
        )

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # API response should return same ClusterActivity ID from database
        url = reverse(
            'cluster-activity',
            kwargs={'pk': obj.id}
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            obj.id,
            response.data['id']
        )

    def test_update_put_cluster_activity(self):
        """Test the API response to update ClusterActivity object as a whole.
        """
        obj = ClusterActivityFactory(
            cluster_objective=self.objective,
            locations=[
                LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table),
                LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
            ]
        )

        new_title = faker.sentence()
        data = {
            'title': new_title,
            'cluster': self.cluster.id,
            'cluster_objective': self.objective.id,
        }

        url = reverse(
            'cluster-activity',
            kwargs={'pk': obj.id}
        )
        response = self.client.put(url, data=data)

        # id payload field is required
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Non-existent cluster objective should throw 404 response
        url = reverse(
            'cluster-activity',
            kwargs={'pk': 9999999}
        )

        data['id'] = 9999999
        response = self.client.put(url, data=data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Successful response should return new title
        url = reverse(
            'cluster-activity',
            kwargs={'pk': obj.id}
        )

        data['id'] = obj.id
        response = self.client.put(url, data=data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(new_title, response.data['title'])

    def test_update_patch_cluster_activity(self):
        """Test the API response to update ClusterActivity object partially.
        """
        obj = ClusterActivityFactory(
            cluster_objective=self.objective,
            locations=[
                self.loc1, self.loc2
            ]
        )

        new_title = faker.sentence()
        data = {
            'title': new_title,
            'cluster': self.cluster.id,
            'cluster_objective': self.objective.id,
        }

        # Non-existent cluster activity should throw 404 response
        url = reverse(
            'cluster-activity',
            kwargs={'pk': 9999999}
        )

        response = self.client.patch(url, data=data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Successful response should return new title
        url = reverse(
            'cluster-activity',
            kwargs={'pk': obj.id}
        )
        response = self.client.patch(url, data=data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(new_title, response.data['title'])


class IndicatorReportsListAPIViewTestCase(BaseAPITestCase):

    def setUp(self):
        self.country = CountryFactory()
        self.workspace = WorkspaceFactory(countries=[self.country, ])
        self.response_plan = ResponsePlanFactory(workspace=self.workspace)
        self.cluster = ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.loc_type = GatewayTypeFactory(country=self.country)
        self.carto_table = CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        self.user = NonPartnerUserFactory()
        ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)

        super().setUp()

    def test_invalid_list_requests(self):
        """Test the API response for invalid payloads.
        """

        # User must have PRP role
        self.user.prp_roles.all().delete()

        response = self.client.get(reverse('cluster-indicator-reports-list', kwargs={'response_plan_id': self.response_plan.id}))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # User must be logged in
        self.client.logout()

        response = self.client.get(reverse('cluster-indicator-reports-list', kwargs={'response_plan_id': self.response_plan.id}))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cluster_indicator_reports_list_and_filtering_and_ordering(self):
        """Test the API response and queryset count with ordering.
        Also, the filtering by ClusterActivityFilter will be tested: partner.
        """
        self.loc1 = LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)

        self.objective = ClusterObjectiveFactory(
            cluster=self.cluster,
            locations=[
                self.loc1,
                self.loc2,
            ]
        )

        self.activity = ClusterActivityFactory(
            cluster_objective=self.objective,
            locations=[
                self.loc1, self.loc2
            ]
        )

        self.partner = PartnerFactory(country_code=self.country.country_short_code)

        self.project = PartnerProjectFactory(
            partner=self.partner,
            clusters=[self.cluster],
            locations=[self.loc1, self.loc2],
        )

        self.p_activity = ClusterActivityPartnerActivityFactory(
            cluster_activity=self.activity,
            project=self.project,
        )

        self.blueprint = QuantityTypeIndicatorBlueprintFactory()
        self.clusteractivity_reportable = QuantityReportableToClusterActivityFactory(
            content_object=self.activity, blueprint=self.blueprint
        )
        self.partneractivity_reportable = QuantityReportableToPartnerActivityFactory(
            content_object=self.p_activity, blueprint=self.blueprint
        )
        self.clusterobjective_reportable = QuantityReportableToClusterObjectiveFactory(
            content_object=self.objective, blueprint=self.blueprint
        )
        self.partnerproject_reportable = QuantityReportableToPartnerProjectFactory(
            content_object=self.project, blueprint=self.blueprint
        )

        # Create 4 indicator reports across generic relation
        self.clusteractivity_indicator_report = ClusterIndicatorReportFactory(
            reportable=self.clusteractivity_reportable,
        )
        self.partneractivity_indicator_report = ClusterIndicatorReportFactory(
            reportable=self.partneractivity_reportable,
            report_status=INDICATOR_REPORT_STATUS.submitted,
        )
        self.clusterobjective_indicator_report = ClusterIndicatorReportFactory(
            reportable=self.clusterobjective_reportable,
            report_status=INDICATOR_REPORT_STATUS.overdue,
        )
        self.partnerproject_indicator_report = ClusterIndicatorReportFactory(
            reportable=self.partnerproject_reportable,
        )

        self.loc_data = IndicatorLocationDataFactory(
            indicator_report=self.partnerproject_indicator_report,
            location=self.loc1,
        )

        url = reverse(
            'cluster-indicator-reports-list',
            kwargs={'response_plan_id': self.response_plan.id}
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(4, response.data['count'])

        # Filterings
        filter_args = '?submitted=1&cluster={}&partner={}&indicator_type={}'.format(
            self.cluster.id,
            self.partner.id,
            'partner_activity',
        )

        response = self.client.get(url + filter_args)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            self.partneractivity_indicator_report.id,
            response.data['results'][0]['id']
        )

        filter_args = '?submitted=0&indicator_type={}&cluster_objective={}'.format(
            'cluster_objective', self.objective.id,
        )

        response = self.client.get(url + filter_args)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            self.clusterobjective_indicator_report.id,
            response.data['results'][0]['id']
        )

        filter_args = '?indicator={}&project={}&location={}&indicator_type={}'.format(
            self.partnerproject_reportable.id, self.project.id, self.loc1.id, 'partner_project'
        )

        response = self.client.get(url + filter_args)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            self.partnerproject_indicator_report.id,
            response.data['results'][0]['id']
        )

        filter_args = '?indicator={}&cluster_activity={}&indicator_type={}'.format(
            self.clusteractivity_reportable.id, self.activity.id, 'cluster_activity'
        )

        response = self.client.get(url + filter_args)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            self.clusteractivity_indicator_report.id,
            response.data['results'][0]['id']
        )

        filter_args = '?indicator={}&cluster_activity={}&indicator_type={}'.format(
            self.clusteractivity_reportable.id, self.activity.id, 'bad_indicator_type'
        )

        response = self.client.get(url + filter_args)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            self.clusteractivity_indicator_report.id,
            response.data['results'][0]['id']
        )

        # Cluster system admin should also be able to query indicator reports
        self.admin_user = NonPartnerUserFactory()
        ClusterPRPRoleFactory(user=self.admin_user, workspace=None, cluster=None, role=PRP_ROLE_TYPES.cluster_system_admin)
        self.client.force_authenticate(self.admin_user)

        filter_args = '?indicator={}&cluster_activity={}&indicator_type={}'.format(
            self.clusteractivity_reportable.id, self.activity.id, 'bad_indicator_type'
        )

        response = self.client.get(url + filter_args)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            self.clusteractivity_indicator_report.id,
            response.data['results'][0]['id']
        )


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
