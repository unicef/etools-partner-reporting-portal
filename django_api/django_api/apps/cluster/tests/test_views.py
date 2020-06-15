import datetime

from django.urls import reverse

from core.common import INDICATOR_REPORT_STATUS, OVERALL_STATUS, PRP_ROLE_TYPES
from core.tests import factories
from core.tests.base import BaseAPITestCase
from dateutil.relativedelta import relativedelta
from rest_framework import status


class ClusterListAPIViewTestCase(BaseAPITestCase):

    def setUp(self):
        self.country = factories.CountryFactory()
        self.workspace = factories.WorkspaceFactory(countries=[self.country, ])
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.user = factories.NonPartnerUserFactory()

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
            cluster = factories.ClusterFactory(type=cluster_type, response_plan=self.response_plan)

            # Associate partner to created cluster for filtering later
            factories.PartnerFactory(clusters=[cluster, ])
            factories.ClusterPRPRoleFactory(
                user=self.user,
                workspace=self.workspace,
                cluster=cluster,
                role=PRP_ROLE_TYPES.cluster_imo,
            )

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
        self.country = factories.CountryFactory()
        self.workspace = factories.WorkspaceFactory(countries=[self.country, ])
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.user = factories.NonPartnerUserFactory()
        self.loc_type = factories.GatewayTypeFactory(country=self.country)
        self.carto_table = factories.CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        factories.ClusterPRPRoleFactory(
            user=self.user,
            workspace=self.workspace,
            cluster=self.cluster,
            role=PRP_ROLE_TYPES.cluster_imo,
        )

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
            factories.ClusterObjectiveFactory(
                cluster=self.cluster,
                locations=[
                    factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table),
                    factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
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
            'title': factories.faker.sentence(),
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
        new_cluster = factories.ClusterFactory(type='education', response_plan=self.response_plan)

        data = {
            'title': factories.faker.sentence(),
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
        self.country = factories.CountryFactory()
        self.workspace = factories.WorkspaceFactory(countries=[self.country, ])
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.user = factories.NonPartnerUserFactory()
        self.loc_type = factories.GatewayTypeFactory(country=self.country)
        self.carto_table = factories.CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)

        super().setUp()

    def test_invalid_requests(self):
        """Test the API response for invalid payloads.
        """
        obj = factories.ClusterObjectiveFactory(
            cluster=self.cluster,
            locations=[
                factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table),
                factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
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
        obj = factories.ClusterObjectiveFactory(
            cluster=self.cluster,
            locations=[
                factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table),
                factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
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
        obj = factories.ClusterObjectiveFactory(
            cluster=self.cluster,
            locations=[
                factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table),
                factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
            ]
        )

        new_title = factories.faker.sentence()
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
        obj = factories.ClusterObjectiveFactory(
            cluster=self.cluster,
            locations=[
                factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table),
                factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
            ]
        )

        new_title = factories.faker.sentence()
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
        self.country = factories.CountryFactory()
        self.workspace = factories.WorkspaceFactory(countries=[self.country, ])
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.user = factories.NonPartnerUserFactory()
        self.loc_type = factories.GatewayTypeFactory(country=self.country)
        self.carto_table = factories.CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)

        self.loc1 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)

        self.objective = factories.ClusterObjectiveFactory(
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
            factories.ClusterActivityFactory(
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
            'title': factories.faker.sentence(),
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
        new_cluster = factories.ClusterFactory(type='education', response_plan=self.response_plan)

        data = {
            'title': factories.faker.sentence(),
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
        self.country = factories.CountryFactory()
        self.workspace = factories.WorkspaceFactory(countries=[self.country, ])
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.user = factories.NonPartnerUserFactory()
        self.loc_type = factories.GatewayTypeFactory(country=self.country)
        self.carto_table = factories.CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)

        self.loc1 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)

        self.objective = factories.ClusterObjectiveFactory(
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
        obj = factories.ClusterActivityFactory(
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
        obj = factories.ClusterActivityFactory(
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
        obj = factories.ClusterActivityFactory(
            cluster_objective=self.objective,
            locations=[
                factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table),
                factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
            ]
        )

        new_title = factories.faker.sentence()
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
        obj = factories.ClusterActivityFactory(
            cluster_objective=self.objective,
            locations=[
                self.loc1, self.loc2
            ]
        )

        new_title = factories.faker.sentence()
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
        self.country = factories.CountryFactory()
        self.workspace = factories.WorkspaceFactory(countries=[self.country, ])
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.loc_type = factories.GatewayTypeFactory(country=self.country)
        self.carto_table = factories.CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        self.user = factories.NonPartnerUserFactory()
        factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)

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
        self.loc1 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)

        self.objective = factories.ClusterObjectiveFactory(
            cluster=self.cluster,
            locations=[
                self.loc1,
                self.loc2,
            ]
        )

        self.activity = factories.ClusterActivityFactory(
            cluster_objective=self.objective,
            locations=[
                self.loc1, self.loc2
            ]
        )

        self.partner = factories.PartnerFactory(country_code=self.country.country_short_code)

        self.project = factories.PartnerProjectFactory(
            partner=self.partner,
            clusters=[self.cluster],
            locations=[self.loc1, self.loc2],
        )

        self.p_activity = factories.ClusterActivityPartnerActivityFactory(
            partner=self.partner,
            cluster_activity=self.activity,
        )
        self.project_context = factories.PartnerActivityProjectContextFactory(
            project=self.project,
            activity=self.p_activity,
        )

        self.blueprint = factories.QuantityTypeIndicatorBlueprintFactory()
        self.clusteractivity_reportable = factories.QuantityReportableToClusterActivityFactory(
            content_object=self.activity, blueprint=self.blueprint
        )
        self.partneractivity_reportable = factories.QuantityReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=self.blueprint
        )
        self.clusterobjective_reportable = factories.QuantityReportableToClusterObjectiveFactory(
            content_object=self.objective, blueprint=self.blueprint
        )
        self.partnerproject_reportable = factories.QuantityReportableToPartnerProjectFactory(
            content_object=self.project, blueprint=self.blueprint
        )

        # Create 4 indicator reports across generic relation
        self.clusteractivity_indicator_report = factories.ClusterIndicatorReportFactory(
            reportable=self.clusteractivity_reportable,
        )
        self.partneractivity_indicator_report = factories.ClusterIndicatorReportFactory(
            reportable=self.partneractivity_reportable,
            report_status=INDICATOR_REPORT_STATUS.submitted,
        )
        self.clusterobjective_indicator_report = factories.ClusterIndicatorReportFactory(
            reportable=self.clusterobjective_reportable,
            report_status=INDICATOR_REPORT_STATUS.overdue,
        )
        self.partnerproject_indicator_report = factories.ClusterIndicatorReportFactory(
            reportable=self.partnerproject_reportable,
        )

        self.loc_data = factories.IndicatorLocationDataFactory(
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
        self.admin_user = factories.NonPartnerUserFactory()
        factories.ClusterPRPRoleFactory(user=self.admin_user, workspace=None, cluster=None, role=PRP_ROLE_TYPES.cluster_system_admin)
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


class IndicatorReportDetailAPIViewTestCase(BaseAPITestCase):

    def setUp(self):
        self.country = factories.CountryFactory()
        self.workspace = factories.WorkspaceFactory(countries=[self.country, ])
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.loc_type = factories.GatewayTypeFactory(country=self.country)
        self.carto_table = factories.CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        self.user = factories.NonPartnerUserFactory()
        self.prp_role = factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
        self.loc1 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)

        self.objective = factories.ClusterObjectiveFactory(
            cluster=self.cluster,
            locations=[
                self.loc1,
                self.loc2,
            ]
        )

        self.activity = factories.ClusterActivityFactory(
            cluster_objective=self.objective,
            locations=[
                self.loc1, self.loc2
            ]
        )

        self.partner = factories.PartnerFactory(country_code=self.country.country_short_code)

        self.project = factories.PartnerProjectFactory(
            partner=self.partner,
            clusters=[self.cluster],
            locations=[self.loc1, self.loc2],
        )

        self.p_activity = factories.ClusterActivityPartnerActivityFactory(
            partner=self.partner,
            cluster_activity=self.activity,
        )
        self.project_context = factories.PartnerActivityProjectContextFactory(
            project=self.project,
            activity=self.p_activity,
        )

        self.p_custom_activity = factories.CustomPartnerActivityFactory(
            cluster_objective=self.objective,
            partner=self.partner,
        )
        self.project_context = factories.PartnerActivityProjectContextFactory(
            project=self.project,
            activity=self.p_activity,
        )

        self.blueprint = factories.QuantityTypeIndicatorBlueprintFactory()
        self.clusteractivity_reportable = factories.QuantityReportableToClusterActivityFactory(
            content_object=self.activity, blueprint=self.blueprint
        )
        self.partneractivity_reportable = factories.QuantityReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=self.blueprint
        )
        self.custom_partneractivity_reportable = factories.QuantityReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=self.blueprint
        )
        self.clusterobjective_reportable = factories.QuantityReportableToClusterObjectiveFactory(
            content_object=self.objective, blueprint=self.blueprint
        )
        self.partnerproject_reportable = factories.QuantityReportableToPartnerProjectFactory(
            content_object=self.project, blueprint=self.blueprint
        )

        # Create 4 indicator reports across generic relation
        self.clusteractivity_indicator_report = factories.ClusterIndicatorReportFactory(
            reportable=self.clusteractivity_reportable,
        )
        self.partneractivity_indicator_report = factories.ClusterIndicatorReportFactory(
            reportable=self.partneractivity_reportable,
            report_status=INDICATOR_REPORT_STATUS.submitted,
        )
        self.custom_partneractivity_indicator_report = factories.ClusterIndicatorReportFactory(
            reportable=self.custom_partneractivity_reportable,
            report_status=INDICATOR_REPORT_STATUS.submitted,
        )
        self.clusterobjective_indicator_report = factories.ClusterIndicatorReportFactory(
            reportable=self.clusterobjective_reportable,
            report_status=INDICATOR_REPORT_STATUS.overdue,
        )
        self.partnerproject_indicator_report = factories.ClusterIndicatorReportFactory(
            reportable=self.partnerproject_reportable,
        )

        self.clusteractivity_loc_data = factories.IndicatorLocationDataFactory(
            indicator_report=self.clusteractivity_indicator_report,
            location=self.loc1,
        )
        self.partneractivity_loc_data = factories.IndicatorLocationDataFactory(
            indicator_report=self.partneractivity_indicator_report,
            location=self.loc1,
        )
        self.custom_partneractivity_loc_data = factories.IndicatorLocationDataFactory(
            indicator_report=self.custom_partneractivity_indicator_report,
            location=self.loc1,
        )
        self.clusterobjective_loc_data = factories.IndicatorLocationDataFactory(
            indicator_report=self.clusterobjective_indicator_report,
            location=self.loc1,
        )
        self.partnerproject_loc_data = factories.IndicatorLocationDataFactory(
            indicator_report=self.partnerproject_indicator_report,
            location=self.loc1,
        )

        super().setUp()

    def test_invalid_list_requests(self):
        """Test the API response for invalid payloads.
        """

        # User must have PRP role
        self.user.prp_roles.all().delete()

        response = self.client.get(
            reverse('cluster-indicator-reports-detail', kwargs={'response_plan_id': self.response_plan.id, 'pk': self.clusteractivity_indicator_report.id})
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # User must be logged in
        self.client.logout()

        response = self.client.get(
            reverse('cluster-indicator-reports-detail', kwargs={'response_plan_id': self.response_plan.id, 'pk': self.clusteractivity_indicator_report.id})
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cluster_indicator_report_details(self):
        """Test the API response for Indicator report details.
        """

        # Query ClusterActivity indicator report
        url = reverse(
            'cluster-indicator-reports-detail',
            kwargs={'response_plan_id': self.response_plan.id, 'pk': self.clusteractivity_indicator_report.id}
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(self.clusteractivity_indicator_report.id, response.data['id'])

        # Query PartnerActivity indicator report
        url = reverse(
            'cluster-indicator-reports-detail',
            kwargs={'response_plan_id': self.response_plan.id, 'pk': self.partneractivity_indicator_report.id}
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(self.partneractivity_indicator_report.id, response.data['id'])

        # Query Custom PartnerActivity indicator report
        url = reverse(
            'cluster-indicator-reports-detail',
            kwargs={'response_plan_id': self.response_plan.id, 'pk': self.custom_partneractivity_indicator_report.id}
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(self.custom_partneractivity_indicator_report.id, response.data['id'])

        # Query ClusterObjective indicator report
        url = reverse(
            'cluster-indicator-reports-detail',
            kwargs={'response_plan_id': self.response_plan.id, 'pk': self.clusterobjective_indicator_report.id}
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(self.clusterobjective_indicator_report.id, response.data['id'])

        # Query PartnerProject indicator report
        url = reverse(
            'cluster-indicator-reports-detail',
            kwargs={'response_plan_id': self.response_plan.id, 'pk': self.partnerproject_indicator_report.id}
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(self.partnerproject_indicator_report.id, response.data['id'])

        # Cluster system admin should also be able to query indicator report details
        self.admin_user = factories.NonPartnerUserFactory()
        factories.ClusterPRPRoleFactory(user=self.admin_user, workspace=None, cluster=None, role=PRP_ROLE_TYPES.cluster_system_admin)
        self.client.force_authenticate(self.admin_user)

        url = reverse(
            'cluster-indicator-reports-detail',
            kwargs={'response_plan_id': self.response_plan.id, 'pk': self.clusterobjective_indicator_report.id}
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(self.clusterobjective_indicator_report.id, response.data['id'])


class ClusterReportablesIdListAPIViewTestCase(BaseAPITestCase):

    def setUp(self):
        self.country = factories.CountryFactory()
        self.workspace = factories.WorkspaceFactory(countries=[self.country, ])
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.loc_type = factories.GatewayTypeFactory(country=self.country)
        self.carto_table = factories.CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        self.user = factories.NonPartnerUserFactory()
        factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)

        self.loc1 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)

        self.objective = factories.ClusterObjectiveFactory(
            cluster=self.cluster,
            locations=[
                self.loc1,
                self.loc2,
            ]
        )

        self.activity = factories.ClusterActivityFactory(
            cluster_objective=self.objective,
            locations=[
                self.loc1, self.loc2
            ]
        )

        self.partner = factories.PartnerFactory(country_code=self.country.country_short_code)

        self.project = factories.PartnerProjectFactory(
            partner=self.partner,
            clusters=[self.cluster],
            locations=[self.loc1, self.loc2],
        )

        self.p_custom_activity = factories.CustomPartnerActivityFactory(
            cluster_objective=self.objective,
            partner=self.partner,
        )
        self.project_context = factories.PartnerActivityProjectContextFactory(
            project=self.project,
            activity=self.p_custom_activity,
        )

        self.blueprint = factories.QuantityTypeIndicatorBlueprintFactory()
        self.clusteractivity_reportable = factories.QuantityReportableToClusterActivityFactory(
            content_object=self.activity, blueprint=self.blueprint
        )
        self.custom_partneractivity_reportable = factories.QuantityReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=self.blueprint
        )
        self.clusterobjective_reportable = factories.QuantityReportableToClusterObjectiveFactory(
            content_object=self.objective, blueprint=self.blueprint
        )
        self.partnerproject_reportable = factories.QuantityReportableToPartnerProjectFactory(
            content_object=self.project, blueprint=self.blueprint
        )

        super().setUp()

    def test_invalid_list_requests(self):
        """Test the API response for invalid payloads.
        """

        # User must have PRP role
        self.user.prp_roles.all().delete()

        response = self.client.get(reverse('cluster-reportable-simple-list', kwargs={'response_plan_id': self.response_plan.id}))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # User must be logged in
        self.client.logout()

        response = self.client.get(reverse('cluster-reportable-simple-list', kwargs={'response_plan_id': self.response_plan.id}))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cluster_reportable_list_and_filtering_and_ordering(self):
        """Test the API response and queryset count with ordering.
        """
        url = reverse(
            'cluster-reportable-simple-list',
            kwargs={'response_plan_id': self.response_plan.id}
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(4, len(response.data))

        # Cluster system admin should also be able to query cluster reportables
        self.admin_user = factories.NonPartnerUserFactory()
        factories.ClusterPRPRoleFactory(user=self.admin_user, workspace=None, cluster=None, role=PRP_ROLE_TYPES.cluster_system_admin)
        self.client.force_authenticate(self.admin_user)

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            4, len(response.data)
        )


class ResponsePlanClusterDashboardAPIViewTestCase(BaseAPITestCase):

    def setUp(self):
        self.country = factories.CountryFactory()
        self.workspace = factories.WorkspaceFactory(countries=[self.country, ])
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.loc_type = factories.GatewayTypeFactory(country=self.country)
        self.carto_table = factories.CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        self.user = factories.NonPartnerUserFactory()
        self.prp_role = factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
        self.loc1 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)

        self.objective = factories.ClusterObjectiveFactory(
            cluster=self.cluster,
            locations=[
                self.loc1,
                self.loc2,
            ]
        )

        self.activity = factories.ClusterActivityFactory(
            cluster_objective=self.objective,
            locations=[
                self.loc1, self.loc2
            ]
        )

        self.blueprint = factories.QuantityTypeIndicatorBlueprintFactory()
        self.clusteractivity_reportable = factories.QuantityReportableToClusterActivityFactory(
            content_object=self.activity, blueprint=self.blueprint
        )

        super().setUp()

    def test_invalid_list_requests(self):
        """Test the API response for invalid payloads.
        """

        # 404 on non-existent response plan
        response = self.client.get(reverse('response-plan-cluster-dashboard', kwargs={'response_plan_id': 9999999}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Bad request when cluster id does not exist for response plan
        url = reverse('response-plan-cluster-dashboard', kwargs={'response_plan_id': self.response_plan.id})
        args = '?cluster_id=999999'
        response = self.client.get(url + args)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # User must have PRP role
        self.user.prp_roles.all().delete()

        response = self.client.get(reverse('response-plan-cluster-dashboard', kwargs={'response_plan_id': self.response_plan.id}))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # User must be logged in
        self.client.logout()

        response = self.client.get(reverse('response-plan-cluster-dashboard', kwargs={'response_plan_id': self.response_plan.id}))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_response_details(self):
        """Test the API response for Cluster dashboard data response.
        """

        for idx in range(4):
            partner = factories.PartnerFactory(country_code=self.country.country_short_code)
            partner.clusters.add(self.cluster)

            project = factories.PartnerProjectFactory(
                partner=partner,
                clusters=[self.cluster],
                locations=[self.loc1, self.loc2],
            )

            p_activity = factories.ClusterActivityPartnerActivityFactory(
                cluster_activity=self.activity,
                partner=partner,
            )
            self.ca_project_context = factories.PartnerActivityProjectContextFactory(
                project=project,
                activity=p_activity,
            )

            p_custom_activity = factories.CustomPartnerActivityFactory(
                cluster_objective=self.objective,
                partner=partner,
            )

            self.project_context = factories.PartnerActivityProjectContextFactory(
                project=project,
                activity=p_custom_activity,
            )

            partneractivity_reportable = factories.QuantityReportableToPartnerActivityProjectContextFactory(
                content_object=self.ca_project_context, blueprint=self.blueprint,
                parent_indicator=self.clusteractivity_reportable,
            )
            custom_partneractivity_reportable = factories.QuantityReportableToPartnerActivityProjectContextFactory(
                content_object=self.project_context, blueprint=self.blueprint
            )

            if idx == 0:
                factories.IndicatorLocationDataFactory(
                    indicator_report=factories.ClusterIndicatorReportFactory(
                        reportable=partneractivity_reportable,
                        report_status=INDICATOR_REPORT_STATUS.accepted,
                        overall_status=OVERALL_STATUS.met,
                    ),
                    location=self.loc1,
                )
                self.constrained_loc = factories.IndicatorLocationDataFactory(
                    indicator_report=factories.ClusterIndicatorReportFactory(
                        reportable=custom_partneractivity_reportable,
                        report_status=INDICATOR_REPORT_STATUS.accepted,
                        overall_status=OVERALL_STATUS.constrained,
                    ),
                    location=self.loc1,
                )
            elif idx == 1:
                factories.IndicatorLocationDataFactory(
                    indicator_report=factories.ClusterIndicatorReportFactory(
                        reportable=partneractivity_reportable,
                        report_status=INDICATOR_REPORT_STATUS.accepted,
                        overall_status=OVERALL_STATUS.on_track,
                    ),
                    location=self.loc1,
                )
                factories.IndicatorLocationDataFactory(
                    indicator_report=factories.ClusterIndicatorReportFactory(
                        reportable=custom_partneractivity_reportable,
                        report_status=INDICATOR_REPORT_STATUS.accepted,
                        overall_status=OVERALL_STATUS.no_progress,
                    ),
                    location=self.loc1,
                )
            elif idx == 2:
                factories.IndicatorLocationDataFactory(
                    indicator_report=factories.ClusterIndicatorReportFactory(
                        reportable=custom_partneractivity_reportable,
                        report_status=INDICATOR_REPORT_STATUS.due,
                        overall_status=OVERALL_STATUS.on_track,
                    ),
                    location=self.loc1,
                )
                self.overdue_loc = factories.IndicatorLocationDataFactory(
                    indicator_report=factories.ClusterIndicatorReportFactory(
                        reportable=custom_partneractivity_reportable,
                        report_status=INDICATOR_REPORT_STATUS.overdue,
                        overall_status=OVERALL_STATUS.constrained,
                    ),
                    location=self.loc1,
                )
            elif idx == 3:
                factories.IndicatorLocationDataFactory(
                    indicator_report=factories.ClusterIndicatorReportFactory(
                        reportable=custom_partneractivity_reportable,
                        report_status=INDICATOR_REPORT_STATUS.accepted,
                        overall_status=OVERALL_STATUS.no_status,
                    ),
                    location=self.loc1,
                )
                self.upcoming_loc = factories.IndicatorLocationDataFactory(
                    indicator_report=factories.ClusterIndicatorReportFactory(
                        reportable=partneractivity_reportable,
                        report_status=INDICATOR_REPORT_STATUS.due,
                        overall_status=OVERALL_STATUS.constrained,
                        time_period_start=datetime.date.today(),
                        time_period_end=datetime.date.today() + relativedelta(days=10),
                        due_date=datetime.date.today() + relativedelta(days=11),
                    ),
                    location=self.loc1,
                )

        # Query ClusterActivity indicator report
        url = reverse(
            'response-plan-cluster-dashboard',
            kwargs={'response_plan_id': self.response_plan.id}
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(4, response.data['num_of_partners'])
        self.assertEqual(1, response.data['num_of_met_indicator_reports'])
        self.assertEqual(1, response.data['num_of_constrained_indicator_reports'])
        self.assertEqual(1, response.data['num_of_on_track_indicator_reports'])
        self.assertEqual(1, response.data['num_of_no_progress_indicator_reports'])
        self.assertEqual(1, response.data['num_of_no_status_indicator_reports'])
        self.assertEqual(3, response.data['num_of_due_overdue_indicator_reports'])
        self.assertEqual(4, response.data['num_of_non_cluster_activities'])
        self.assertEqual(1, len(response.data['upcoming_indicator_reports']))
        self.assertEqual(self.upcoming_loc.indicator_report.id, response.data['upcoming_indicator_reports'][0]['id'])
        self.assertEqual(1, len(response.data['overdue_indicator_reports']))
        self.assertEqual(self.overdue_loc.indicator_report.id, response.data['overdue_indicator_reports'][0]['id'])
        self.assertEqual(1, len(response.data['constrained_indicator_reports']))
        self.assertEqual(self.constrained_loc.indicator_report.id, response.data['constrained_indicator_reports'][0]['id'])

        # Cluster system admin should also be able to query indicator report details
        self.admin_user = factories.NonPartnerUserFactory()
        factories.ClusterPRPRoleFactory(user=self.admin_user, workspace=None, cluster=None, role=PRP_ROLE_TYPES.cluster_system_admin)
        self.client.force_authenticate(self.admin_user)

        url = reverse(
            'response-plan-cluster-dashboard',
            kwargs={'response_plan_id': self.response_plan.id}
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(4, response.data['num_of_partners'])
        self.assertEqual(1, response.data['num_of_met_indicator_reports'])
        self.assertEqual(1, response.data['num_of_constrained_indicator_reports'])
        self.assertEqual(1, response.data['num_of_on_track_indicator_reports'])
        self.assertEqual(1, response.data['num_of_no_progress_indicator_reports'])
        self.assertEqual(1, response.data['num_of_no_status_indicator_reports'])
        self.assertEqual(3, response.data['num_of_due_overdue_indicator_reports'])
        self.assertEqual(4, response.data['num_of_non_cluster_activities'])
        self.assertEqual(1, len(response.data['upcoming_indicator_reports']))
        self.assertEqual(self.upcoming_loc.indicator_report.id, response.data['upcoming_indicator_reports'][0]['id'])
        self.assertEqual(1, len(response.data['overdue_indicator_reports']))
        self.assertEqual(self.overdue_loc.indicator_report.id, response.data['overdue_indicator_reports'][0]['id'])
        self.assertEqual(1, len(response.data['constrained_indicator_reports']))
        self.assertEqual(self.constrained_loc.indicator_report.id, response.data['constrained_indicator_reports'][0]['id'])
