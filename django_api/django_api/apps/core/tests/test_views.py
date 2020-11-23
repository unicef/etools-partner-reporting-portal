from django.urls import reverse

from core.common import CLUSTER_TYPES, PRP_ROLE_TYPES
from core.management.commands._generate_disaggregation_fake_data import add_disaggregations_to_reportable
from core.models import Location, ResponsePlan, Workspace
from core.tests import factories
from core.tests.base import BaseAPITestCase
from rest_framework import status


class TestWorkspaceListAPIView(BaseAPITestCase):
    def setUp(self):
        self.country = factories.CountryFactory()
        self.workspace = factories.WorkspaceFactory(countries=[self.country, ])
        self.user = factories.NonPartnerUserFactory()
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.prp_role = factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
        self.loc_type = factories.GatewayTypeFactory(country=self.country)
        self.carto_table = factories.CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        self.loc1 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)

        super().setUp()

    def test_list_api_by_user(self):
        url = reverse('workspace')
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            len(response.data),
            Workspace.objects.prefetch_related('countries__gateway_types__locations').filter(
                countries__gateway_types__locations__isnull=False).distinct().count()
        )

        # Cluster system admin should also be able to query workspaces
        self.admin_user = factories.NonPartnerUserFactory()
        factories.ClusterPRPRoleFactory(user=self.admin_user, workspace=None, cluster=None, role=PRP_ROLE_TYPES.cluster_system_admin)
        self.client.force_authenticate(self.admin_user)

        url = reverse('workspace')
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            len(response.data),
            Workspace.objects.prefetch_related('countries__gateway_types__locations').filter(
                countries__gateway_types__locations__isnull=False).distinct().count()
        )

    def test_api_filtering(self):
        url = reverse('workspace')
        args = "?business_area_code={}&workspace_code={}".format(self.workspace.business_area_code, self.workspace.workspace_code)
        response = self.client.get(url + args, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            len(response.data),
            Workspace.objects.prefetch_related('countries__gateway_types__locations').filter(
                countries__gateway_types__locations__isnull=False,
                business_area_code=self.workspace.business_area_code,
                workspace_code=self.workspace.workspace_code).distinct().count()
        )


class TestLocationListAPIView(BaseAPITestCase):
    def setUp(self):
        self.country = factories.CountryFactory()
        self.workspace = factories.WorkspaceFactory(countries=[self.country, ])
        self.user = factories.NonPartnerUserFactory()
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.prp_role = factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
        self.loc_type = factories.GatewayTypeFactory(country=self.country)
        self.carto_table = factories.CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        self.loc1 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)

        for _ in range(2):
            obj = factories.ClusterObjectiveFactory(
                cluster=self.cluster,
                locations=[
                    self.loc1,
                    self.loc2,
                ]
            )

            activity = factories.ClusterActivityFactory(
                cluster_objective=obj,
                locations=[
                    self.loc1, self.loc2
                ]
            )

            blueprint = factories.QuantityTypeIndicatorBlueprintFactory()
            clusteractivity_reportable = factories.QuantityReportableToClusterActivityFactory(
                content_object=activity, blueprint=blueprint
            )

            clusteractivity_reportable.disaggregations.clear()

            self.sample_disaggregation_value_map = {
                "height": ["tall", "medium", "short", "extrashort"],
                "age": ["1-2m", "3-4m", "5-6m", '7-10m', '11-13m', '14-16m'],
                "gender": ["male", "female", "other"],
            }

            # Create the disaggregations and values in the db for all response plans
            # including one for no response plan as well
            for disagg_name, values in self.sample_disaggregation_value_map.items():
                for value in values:
                    factories.DisaggregationValueFactory(
                        disaggregation=factories.DisaggregationFactory(
                            name=disagg_name,
                            response_plan=self.response_plan,
                        ),
                        value=value
                    )

            add_disaggregations_to_reportable(
                clusteractivity_reportable,
                disaggregation_targets=["age", "gender", "height"]
            )

            factories.LocationWithReportableLocationGoalFactory(
                location=self.loc1,
                reportable=clusteractivity_reportable,
            )

            factories.LocationWithReportableLocationGoalFactory(
                location=self.loc2,
                reportable=clusteractivity_reportable,
            )

        super().setUp()

    def test_list_api(self):
        url = reverse(
            'location', kwargs={
                'response_plan_id': self.response_plan.id})
        response = self.client.get(url, format='json')

        result = ResponsePlan.objects.filter(id=self.response_plan.id).values_list(
            'clusters__cluster_objectives__reportables__locations',
            'clusters__cluster_objectives__cluster_activities__reportables__locations',
            'clusters__partner_projects__reportables__locations',
            'clusters__partner_projects__partneractivityprojectcontext__reportables__locations',
        ).distinct()
        pks = []
        [pks.extend(filter(lambda x: x is not None, part)) for part in result]
        expected = Location.objects.filter(pk__in=pks).count()

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), expected)

    def test_api_filtering(self):
        url = reverse(
            'location', kwargs={
                'response_plan_id': self.response_plan.id})
        objective_ids = list(map(lambda x: str(x), self.cluster.cluster_objectives.values_list('id', flat=True)))
        args = "?loc_type={}&cluster_objectives={}".format(self.loc_type.admin_level, ",".join(objective_ids))
        response = self.client.get(url + args, format='json')

        result = ResponsePlan.objects.filter(id=self.response_plan.id).values_list(
            'clusters__cluster_objectives__reportables__locations',
            'clusters__cluster_objectives__cluster_activities__reportables__locations',
            'clusters__partner_projects__reportables__locations',
            'clusters__partner_projects__partneractivityprojectcontext__reportables__locations',
        ).distinct()
        pks = []
        [pks.extend(filter(lambda x: x is not None, part)) for part in result]
        expected = Location.objects.filter(
            pk__in=pks,
            gateway__admin_level=self.loc_type.admin_level,
            cluster_objectives__in=objective_ids).count()

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), expected)


class TestResponsePlanAPIView(BaseAPITestCase):

    def setUp(self):
        self.country = factories.CountryFactory()
        self.workspace = factories.WorkspaceFactory(countries=[self.country, ])
        self.user = factories.NonPartnerUserFactory()
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.prp_role = factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)

        super().setUp()

    def test_list_response_plan(self):
        url = reverse("response-plan", kwargs={'workspace_id': self.workspace.id})
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), self.workspace.response_plans.count())

        # Cluster system admin should also be able to query response plans
        self.admin_user = factories.NonPartnerUserFactory()
        factories.ClusterPRPRoleFactory(user=self.admin_user, workspace=None, cluster=None, role=PRP_ROLE_TYPES.cluster_system_admin)
        self.client.force_authenticate(self.admin_user)

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), self.workspace.response_plans.count())

    def test_create_response_plan(self):
        rp_data = {
            'title': 'Test Response Plan',
            'plan_type': 'HRP',
            'start': '2013-01-01',
            'end': '2018-01-01',
            'clusters': [
                CLUSTER_TYPES.cccm,
                CLUSTER_TYPES.nutrition,
            ],
        }

        url = reverse("response-plan-create", kwargs={'workspace_id': self.workspace.id})
        response = self.client.post(url, data=rp_data, format='json')
        self.assertEquals(response.status_code, status.HTTP_201_CREATED, msg=response.content)

        # Cluster system admin should also be able to create response plan
        self.admin_user = factories.NonPartnerUserFactory()
        factories.ClusterPRPRoleFactory(user=self.admin_user, workspace=None, cluster=None, role=PRP_ROLE_TYPES.cluster_system_admin)
        self.client.force_authenticate(self.admin_user)

        rp_data['title'] += ' 2'
        response = self.client.post(url, data=rp_data, format='json')
        self.assertEquals(response.status_code, status.HTTP_201_CREATED, msg=response.content)

    def test_end_lt_start(self):
        rp_data = {
            'title': 'Test Response Plan',
            'plan_type': 'HRP',
            'start': '2018-01-01',
            'end': '2013-01-01',
            'clusters': [
                CLUSTER_TYPES.cccm,
                CLUSTER_TYPES.nutrition,
            ],
        }

        url = reverse("response-plan-create", kwargs={'workspace_id': self.workspace.id})
        response = self.client.post(url, data=rp_data, format='json')
        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST, msg=response.content)

        # Cluster system admin should also be able to create response plan
        self.admin_user = factories.NonPartnerUserFactory()
        factories.ClusterPRPRoleFactory(user=self.admin_user, workspace=None, cluster=None, role=PRP_ROLE_TYPES.cluster_system_admin)
        self.client.force_authenticate(self.admin_user)

        rp_data['title'] += ' 2'
        response = self.client.post(url, data=rp_data, format='json')
        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST, msg=response.content)
