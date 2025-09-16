from django.test import TestCase

from etools_prp.apps.core.tests import factories
from etools_prp.apps.indicator.models import ReportableLocationGoal
from etools_prp.apps.unicef.sync.update_create_reportable_location_goal import (
    update_create_reportable_location_goals,
)


class TestUpdateCreateReportableLocationGoals(TestCase):

    def setUp(self):
        self.reportable = factories.QuantityReportableToLowerLevelOutputFactory()
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
        rlg1 = ReportableLocationGoal.objects.get(
            reportable=self.reportable, location=self.loc1
        )
        rlg2 = ReportableLocationGoal.objects.get(
            reportable=self.reportable, location=self.loc2
        )
        self.assertTrue(rlg1.is_active)
        self.assertTrue(rlg2.is_active)

        update_create_reportable_location_goals(self.reportable, [self.loc1])

        rlg1.refresh_from_db()
        rlg2.refresh_from_db()
        self.assertTrue(rlg1.is_active)
        self.assertFalse(rlg2.is_active)

        self.assertEqual(
            ReportableLocationGoal.objects.filter(reportable=self.reportable).count(),
            2,
        )

    def test_reactivate_and_deactivate_mixed_state(self):
        ReportableLocationGoal.objects.filter(
            reportable=self.reportable, location=self.loc1
        ).update(is_active=False)
        ReportableLocationGoal.objects.filter(
            reportable=self.reportable, location=self.loc2
        ).update(is_active=True)

        update_create_reportable_location_goals(self.reportable, [self.loc1])

        rlg1 = ReportableLocationGoal.objects.get(
            reportable=self.reportable, location=self.loc1
        )
        rlg2 = ReportableLocationGoal.objects.get(
            reportable=self.reportable, location=self.loc2
        )
        self.assertTrue(rlg1.is_active)
        self.assertFalse(rlg2.is_active)


