from django.urls import reverse

from rest_framework import status

from etools_prp.apps.core.common import CLUSTER_TYPES, CURRENCIES, PRP_ROLE_TYPES
from etools_prp.apps.core.management.commands._generate_disaggregation_fake_data import (
    add_disaggregations_to_reportable,
)
from etools_prp.apps.core.models import Location, ResponsePlan, Workspace
from etools_prp.apps.core.tests import factories
from etools_prp.apps.core.tests.base import BaseAPITestCase


class TestWorkspaceListAPIView(BaseAPITestCase):
    def setUp(self):
        self.workspace = factories.WorkspaceFactory()
        self.user = factories.NonPartnerUserFactory()
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.prp_role = factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
        self.loc1 = factories.LocationFactory()
        self.loc2 = factories.LocationFactory()
        self.loc1.workspaces.add(self.workspace)
        self.loc2.workspaces.add(self.workspace)

        super().setUp()

    def test_list_api_by_user(self):
        url = reverse('workspace')
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            len(response.data),
            Workspace.objects.prefetch_related('locations').filter(
                locations__isnull=False, response_plans=self.response_plan).distinct().count()
        )

        # Cluster system admin should also be able to query workspaces
        self.admin_user = factories.NonPartnerUserFactory()
        factories.ClusterPRPRoleFactory(user=self.admin_user, workspace=None, cluster=None, role=PRP_ROLE_TYPES.cluster_system_admin)
        self.client.force_authenticate(self.admin_user)

        url = reverse('workspace')
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            len(response.data),
            Workspace.objects.prefetch_related('locations').filter(
                locations__isnull=False, response_plans=self.response_plan).distinct().count()
        )

    def test_api_filtering(self):
        url = reverse('workspace')
        args = "?business_area_code={}&workspace_code={}".format(self.workspace.business_area_code, self.workspace.workspace_code)
        response = self.client.get(url + args, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            len(response.data),
            Workspace.objects.prefetch_related('locations').filter(
                locations__isnull=False,
                business_area_code=self.workspace.business_area_code,
                workspace_code=self.workspace.workspace_code).distinct().count()
        )


class TestLocationListAPIView(BaseAPITestCase):
    def setUp(self):
        self.workspace = factories.WorkspaceFactory()
        self.user = factories.NonPartnerUserFactory()
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.prp_role = factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
        self.carto_table = factories.CartoDBTableFactory()
        self.admin_level = 2
        self.loc1 = factories.LocationFactory(admin_level=self.admin_level)
        self.loc2 = factories.LocationFactory(admin_level=self.admin_level)
        self.loc1.workspaces.add(self.workspace)
        self.loc2.workspaces.add(self.workspace)

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

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), expected)

    def test_api_filtering(self):
        url = reverse(
            'location', kwargs={
                'response_plan_id': self.response_plan.id})
        objective_ids = list(map(lambda x: str(x), self.cluster.cluster_objectives.values_list('id', flat=True)))
        args = "?loc_type={}&cluster_objectives={}".format(self.admin_level, ",".join(objective_ids))
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
            admin_level=self.admin_level,
            cluster_objectives__in=objective_ids).count()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), expected)


class TestResponsePlanAPIView(BaseAPITestCase):

    def setUp(self):
        self.workspace = factories.WorkspaceFactory()
        self.user = factories.NonPartnerUserFactory()
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.prp_role = factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)

        super().setUp()

    def test_list_response_plan(self):
        url = reverse("response-plan", kwargs={'workspace_id': self.workspace.id})
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), self.workspace.response_plans.count())

        # Cluster system admin should also be able to query response plans
        self.admin_user = factories.NonPartnerUserFactory()
        factories.ClusterPRPRoleFactory(user=self.admin_user, workspace=None, cluster=None, role=PRP_ROLE_TYPES.cluster_system_admin)
        self.client.force_authenticate(self.admin_user)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), self.workspace.response_plans.count())

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
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, msg=response.content)

        # Cluster system admin should also be able to create response plan
        self.admin_user = factories.NonPartnerUserFactory()
        factories.ClusterPRPRoleFactory(user=self.admin_user, workspace=None, cluster=None, role=PRP_ROLE_TYPES.cluster_system_admin)
        self.client.force_authenticate(self.admin_user)

        rp_data['title'] += ' 2'
        response = self.client.post(url, data=rp_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, msg=response.content)

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
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, msg=response.content)

        # Cluster system admin should also be able to create response plan
        self.admin_user = factories.NonPartnerUserFactory()
        factories.ClusterPRPRoleFactory(user=self.admin_user, workspace=None, cluster=None, role=PRP_ROLE_TYPES.cluster_system_admin)
        self.client.force_authenticate(self.admin_user)

        rp_data['title'] += ' 2'
        response = self.client.post(url, data=rp_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, msg=response.content)


class TestCurrenciesView(BaseAPITestCase):
    def test_get_permission(self):
        response = self.client.get(reverse("currencies"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get(self):
        user = factories.NonPartnerUserFactory()
        self.client.force_authenticate(user)
        response = self.client.get(reverse("currencies"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), len(CURRENCIES))
