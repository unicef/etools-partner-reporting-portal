from django.contrib.contenttypes.models import ContentType
from django.test import TestCase
from django.urls import reverse

from rest_framework.test import APIClient

from etools_prp.apps.core.common import PRP_ROLE_TYPES
from etools_prp.apps.core.tests import factories
from etools_prp.apps.indicator.models import IndicatorBlueprint, Reportable, ReportableLocationGoal
from etools_prp.apps.unicef.sync.update_create_reportable_location_goal import update_create_reportable_location_goals


class TestUpdateCreateReportableLocationGoals(TestCase):

    def setUp(self):
        # creating pd, llos, etc.
        self.pd = factories.ProgrammeDocumentFactory()
        self.cp_output = factories.PDResultLinkFactory(programme_document=self.pd)
        self.llo = factories.LowerLevelOutputFactory(cp_output=self.cp_output)
        self.blueprint = IndicatorBlueprint.objects.create(
            title="Test Indicator",
            unit=IndicatorBlueprint.NUMBER,
            calculation_formula_across_locations=IndicatorBlueprint.SUM,
            calculation_formula_across_periods=IndicatorBlueprint.SUM,
            display_type=IndicatorBlueprint.NUMBER,
        )
        llo_ct = ContentType.objects.get_for_model(type(self.llo))

        # creating reportable
        self.reportable = Reportable.objects.create(
            content_type=llo_ct,
            object_id=self.llo.id,
            blueprint=self.blueprint,
        )

        # creating locations
        self.loc1 = factories.LocationFactory()
        self.loc2 = factories.LocationFactory()

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=self.reportable,
        )
        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=self.reportable,
        )

    def test_deactivates_removed_locations(self):
        # asserting that locations are active initially
        rlg1 = ReportableLocationGoal.objects.get(
            reportable=self.reportable, location=self.loc1
        )
        rlg2 = ReportableLocationGoal.objects.get(
            reportable=self.reportable, location=self.loc2
        )
        self.assertTrue(rlg1.is_active)
        self.assertTrue(rlg2.is_active)

        # this is what the process_pd_item script would run
        update_create_reportable_location_goals(self.reportable, [self.loc1])

        # asserting the locations are active
        rlg1.refresh_from_db()
        rlg2.refresh_from_db()
        self.assertTrue(rlg1.is_active)
        self.assertFalse(rlg2.is_active)

        self.assertEqual(
            ReportableLocationGoal.objects.filter(reportable=self.reportable).count(),
            2,
        )

    def test_reactivate_and_deactivate_mixed_state(self):
        # setting first location to inactive
        # (what happens when a location is removed from the pd)
        ReportableLocationGoal.objects.filter(
            reportable=self.reportable, location=self.loc1
        ).update(is_active=False)

        # setting second location to active
        ReportableLocationGoal.objects.filter(
            reportable=self.reportable, location=self.loc2
        ).update(is_active=True)

        # running script
        update_create_reportable_location_goals(self.reportable, [self.loc1])

        # location 2 is now effectively inactive
        rlg1 = ReportableLocationGoal.objects.get(
            reportable=self.reportable, location=self.loc1
        )
        rlg2 = ReportableLocationGoal.objects.get(
            reportable=self.reportable, location=self.loc2
        )
        self.assertTrue(rlg1.is_active)
        self.assertFalse(rlg2.is_active)

    def test_only_show_deactivated_reportable_locations(self):
        ReportableLocationGoal.objects.filter(
            reportable=self.reportable, location=self.loc2
        ).update(is_active=False)

        user = factories.NonPartnerUserFactory()
        factories.ClusterPRPRoleFactory(user=user, workspace=None, cluster=None, role=PRP_ROLE_TYPES.cluster_system_admin)
        api_client = APIClient()
        api_client.force_authenticate(user)

        url = reverse('indicator-location-goal-detail', args=[self.reportable.id])
        response = api_client.get(url)

        self.assertEqual(response.status_code, 200, response.content)

        returned_ids = sorted([item['id'] for item in response.json()])
        expected_ids = sorted(list(ReportableLocationGoal.objects.filter(reportable=self.reportable, is_active=True).values_list('id', flat=True)))
        self.assertListEqual(returned_ids, expected_ids)
