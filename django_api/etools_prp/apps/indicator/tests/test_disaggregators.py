import copy

from etools_prp.apps.core.common import INDICATOR_REPORT_STATUS, OVERALL_STATUS, PRP_ROLE_TYPES
from etools_prp.apps.core.helpers import get_cast_dictionary_keys_as_tuple
from etools_prp.apps.core.management.commands._generate_disaggregation_fake_data import (
    add_disaggregations_to_reportable,
    generate_3_num_disagg_data,
)
from etools_prp.apps.core.tests import factories
from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.core.tests.factories import faker
from etools_prp.apps.indicator.disaggregators import QuantityIndicatorDisaggregator, RatioIndicatorDisaggregator
from etools_prp.apps.indicator.models import IndicatorBlueprint, IndicatorLocationData


class TestQuantityIndicatorDisaggregator(BaseAPITestCase):

    def setUp(self):
        self.workspace = factories.WorkspaceFactory()
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.carto_table = factories.CartoDBTableFactory()
        self.user = factories.NonPartnerUserFactory()
        self.prp_role = factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
        self.loc1 = factories.LocationFactory()
        self.loc2 = factories.LocationFactory()
        self.loc1.workspaces.add(self.workspace)
        self.loc2.workspaces.add(self.workspace)

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

        self.partner = factories.PartnerFactory(country_code=faker.country_code())

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
                    disaggregation=factories.DisaggregationFactory(name=disagg_name, response_plan=self.response_plan),
                    value=value
                )

        super().setUp()

    def test_post_process_location_sum_calc(self):
        unit_type = IndicatorBlueprint.NUMBER
        calc_type = IndicatorBlueprint.SUM

        blueprint = factories.QuantityTypeIndicatorBlueprintFactory(
            unit=unit_type,
            calculation_formula_across_locations=calc_type,
        )
        partneractivity_reportable = factories.QuantityReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=blueprint
        )

        partneractivity_reportable.disaggregations.clear()

        add_disaggregations_to_reportable(
            partneractivity_reportable,
            disaggregation_targets=["age", "gender", "height"]
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=partneractivity_reportable,
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=partneractivity_reportable,
        )

        ir = factories.ClusterIndicatorReportFactory(
            reportable=partneractivity_reportable,
            report_status=INDICATOR_REPORT_STATUS.due,
            overall_status=OVERALL_STATUS.met,
        )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(partneractivity_reportable, indicator_type="quantity")

        loc_total = 0

        for loc_data in ir.indicator_location_data.all():
            QuantityIndicatorDisaggregator.post_process(loc_data)
            loc_total += loc_data.disaggregation['()']['c']

        self.assertEqual(ir.total['c'], loc_total)

    def test_post_process_location_max_calc(self):
        unit_type = IndicatorBlueprint.NUMBER
        calc_type = IndicatorBlueprint.MAX

        blueprint = factories.QuantityTypeIndicatorBlueprintFactory(
            unit=unit_type,
            calculation_formula_across_locations=calc_type,
        )
        partneractivity_reportable = factories.QuantityReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=blueprint
        )

        partneractivity_reportable.disaggregations.clear()

        add_disaggregations_to_reportable(
            partneractivity_reportable,
            disaggregation_targets=["age", "gender", "height"]
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=partneractivity_reportable,
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=partneractivity_reportable,
        )

        ir = factories.ClusterIndicatorReportFactory(
            reportable=partneractivity_reportable,
            report_status=INDICATOR_REPORT_STATUS.due,
        )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(partneractivity_reportable, indicator_type="quantity")

        max_value = 0

        for loc_data in ir.indicator_location_data.all():
            QuantityIndicatorDisaggregator.post_process(loc_data)

            if loc_data.disaggregation['()']['c'] > max_value:
                max_value = loc_data.disaggregation['()']['c']

        self.assertEqual(ir.total['c'], max_value)

    def test_post_process_location_avg_calc(self):
        unit_type = IndicatorBlueprint.NUMBER
        calc_type = IndicatorBlueprint.AVG

        blueprint = factories.QuantityTypeIndicatorBlueprintFactory(
            unit=unit_type,
            calculation_formula_across_locations=calc_type,
        )
        partneractivity_reportable = factories.QuantityReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=blueprint
        )

        partneractivity_reportable.disaggregations.clear()

        add_disaggregations_to_reportable(
            partneractivity_reportable,
            disaggregation_targets=["age", "gender", "height"]
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=partneractivity_reportable,
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=partneractivity_reportable,
        )

        ir = factories.ClusterIndicatorReportFactory(
            reportable=partneractivity_reportable,
            report_status=INDICATOR_REPORT_STATUS.due,
        )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(partneractivity_reportable, indicator_type="quantity")

        avg_value = 0

        for loc_data in ir.indicator_location_data.all():
            QuantityIndicatorDisaggregator.post_process(loc_data)
            avg_value += loc_data.disaggregation['()']['c']

        avg_value /= (ir.indicator_location_data.count() * 1.0)

        self.assertEqual(ir.total['c'], avg_value)

    def test_post_process_reporting_period_sum_calc(self):
        unit_type = IndicatorBlueprint.NUMBER
        calc_type = IndicatorBlueprint.SUM

        blueprint = factories.QuantityTypeIndicatorBlueprintFactory(
            unit=unit_type,
            calculation_formula_across_locations=calc_type,
            calculation_formula_across_periods=calc_type,
        )
        partneractivity_reportable = factories.QuantityReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=blueprint
        )

        partneractivity_reportable.disaggregations.clear()

        add_disaggregations_to_reportable(
            partneractivity_reportable,
            disaggregation_targets=["age", "gender", "height"]
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=partneractivity_reportable,
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=partneractivity_reportable,
        )

        for _ in range(2):
            factories.ClusterIndicatorReportFactory(
                reportable=partneractivity_reportable,
                report_status=INDICATOR_REPORT_STATUS.due,
            )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(partneractivity_reportable, indicator_type="quantity")

        report_total = 0

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=partneractivity_reportable):
            QuantityIndicatorDisaggregator.post_process(loc_data)

        # Indicator total only gets calculated if it's accepted or is sent back
        for ir in partneractivity_reportable.indicator_reports.all():
            ir.report_status = INDICATOR_REPORT_STATUS.accepted
            ir.save()
            report_total += ir.total['c']

        self.assertEqual(partneractivity_reportable.total['c'], report_total)

    def test_post_process_reporting_period_max_calc(self):
        unit_type = IndicatorBlueprint.NUMBER
        calc_type = IndicatorBlueprint.MAX

        blueprint = factories.QuantityTypeIndicatorBlueprintFactory(
            unit=unit_type,
            calculation_formula_across_locations=calc_type,
            calculation_formula_across_periods=calc_type,
        )
        partneractivity_reportable = factories.QuantityReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=blueprint
        )

        partneractivity_reportable.disaggregations.clear()

        add_disaggregations_to_reportable(
            partneractivity_reportable,
            disaggregation_targets=["age", "gender", "height"]
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=partneractivity_reportable,
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=partneractivity_reportable,
        )

        for _ in range(2):
            factories.ClusterIndicatorReportFactory(
                reportable=partneractivity_reportable,
                report_status=INDICATOR_REPORT_STATUS.due,
            )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(partneractivity_reportable, indicator_type="quantity")

        report_total = 0

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=partneractivity_reportable):
            QuantityIndicatorDisaggregator.post_process(loc_data)

        # Indicator total only gets calculated if it's accepted or is sent back
        for ir in partneractivity_reportable.indicator_reports.all():
            ir.report_status = INDICATOR_REPORT_STATUS.accepted
            ir.save()

            if ir.total['c'] > report_total:
                report_total = ir.total['c']

        self.assertEqual(partneractivity_reportable.total['c'], report_total)

    def test_post_process_reporting_period_avg_calc(self):
        unit_type = IndicatorBlueprint.NUMBER
        calc_type = IndicatorBlueprint.AVG

        blueprint = factories.QuantityTypeIndicatorBlueprintFactory(
            unit=unit_type,
            calculation_formula_across_locations=calc_type,
            calculation_formula_across_periods=calc_type,
        )
        partneractivity_reportable = factories.QuantityReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=blueprint
        )

        partneractivity_reportable.disaggregations.clear()

        add_disaggregations_to_reportable(
            partneractivity_reportable,
            disaggregation_targets=["age", "gender", "height"]
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=partneractivity_reportable,
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=partneractivity_reportable,
        )

        for _ in range(2):
            factories.ClusterIndicatorReportFactory(
                reportable=partneractivity_reportable,
                report_status=INDICATOR_REPORT_STATUS.due,
            )

        report_total = 0

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=partneractivity_reportable):
            QuantityIndicatorDisaggregator.post_process(loc_data)

        # Indicator total only gets calculated if it's accepted or is sent back
        for ir in partneractivity_reportable.indicator_reports.all():
            ir.report_status = INDICATOR_REPORT_STATUS.accepted
            ir.save()

            report_total += ir.total['v']

        report_total /= (partneractivity_reportable.indicator_reports.count() * 1.0)

        self.assertEqual(partneractivity_reportable.total['v'], report_total)


class TestRatioIndicatorDisaggregator(BaseAPITestCase):
    def setUp(self):
        self.workspace = factories.WorkspaceFactory()
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.carto_table = factories.CartoDBTableFactory()
        self.user = factories.NonPartnerUserFactory()
        self.prp_role = factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
        self.loc1 = factories.LocationFactory()
        self.loc2 = factories.LocationFactory()
        self.loc1.workspaces.add(self.workspace)
        self.loc2.workspaces.add(self.workspace)

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

        self.partner = factories.PartnerFactory(country_code=faker.country_code())

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

        super().setUp()

    def test_post_process_location_ratio_calc(self):
        unit_type = IndicatorBlueprint.PERCENTAGE
        calc_type = IndicatorBlueprint.SUM
        display_type = IndicatorBlueprint.RATIO

        blueprint = factories.RatioTypeIndicatorBlueprintFactory(
            unit=unit_type,
            calculation_formula_across_locations=calc_type,
            calculation_formula_across_periods=calc_type,
            display_type=display_type,
        )
        partneractivity_reportable = factories.RatioReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=blueprint
        )

        partneractivity_reportable.disaggregations.clear()

        add_disaggregations_to_reportable(
            partneractivity_reportable,
            disaggregation_targets=["age", "gender", "height"]
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=partneractivity_reportable,
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=partneractivity_reportable,
        )

        ir = factories.ClusterIndicatorReportFactory(
            reportable=partneractivity_reportable,
            report_status=INDICATOR_REPORT_STATUS.due,
        )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(partneractivity_reportable, indicator_type="ratio")

        v_total = 0
        d_total = 0

        for loc_data in ir.indicator_location_data.all():
            RatioIndicatorDisaggregator.post_process(loc_data)
            v_total += loc_data.disaggregation['()']['v']
            d_total += loc_data.disaggregation['()']['d']

        ratio_value = v_total / (d_total * 1.0)

        self.assertEqual(ir.total['c'], ratio_value)

    def test_post_process_location_percentage_calc(self):
        unit_type = IndicatorBlueprint.PERCENTAGE
        calc_type = IndicatorBlueprint.SUM
        display_type = IndicatorBlueprint.PERCENTAGE

        blueprint = factories.RatioTypeIndicatorBlueprintFactory(
            unit=unit_type,
            calculation_formula_across_locations=calc_type,
            calculation_formula_across_periods=calc_type,
            display_type=display_type,
        )
        partneractivity_reportable = factories.RatioReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=blueprint
        )

        partneractivity_reportable.disaggregations.clear()

        add_disaggregations_to_reportable(
            partneractivity_reportable,
            disaggregation_targets=["age", "gender", "height"]
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=partneractivity_reportable,
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=partneractivity_reportable,
        )

        ir = factories.ClusterIndicatorReportFactory(
            reportable=partneractivity_reportable,
            report_status=INDICATOR_REPORT_STATUS.due,
        )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(partneractivity_reportable, indicator_type="ratio")

        v_total = 0
        d_total = 0

        for loc_data in ir.indicator_location_data.all():
            RatioIndicatorDisaggregator.post_process(loc_data)
            v_total += loc_data.disaggregation['()']['v']
            d_total += loc_data.disaggregation['()']['d']

        ratio_value = v_total / (d_total * 1.0)

        self.assertEqual(ir.total['c'], ratio_value * 100)

    def test_post_process_location_calc_with_zero_value_entry(self):
        unit_type = IndicatorBlueprint.PERCENTAGE
        calc_type = IndicatorBlueprint.SUM
        display_type = IndicatorBlueprint.RATIO

        blueprint = factories.RatioTypeIndicatorBlueprintFactory(
            unit=unit_type,
            calculation_formula_across_locations=calc_type,
            calculation_formula_across_periods=calc_type,
            display_type=display_type,
        )
        partneractivity_reportable = factories.RatioReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=blueprint
        )

        partneractivity_reportable.disaggregations.clear()

        add_disaggregations_to_reportable(
            partneractivity_reportable,
            disaggregation_targets=["age", "gender", "height"]
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=partneractivity_reportable,
        )

        ir = factories.ClusterIndicatorReportFactory(
            reportable=partneractivity_reportable,
            report_status=INDICATOR_REPORT_STATUS.due,
        )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(partneractivity_reportable, indicator_type="ratio")

        loc_data1 = ir.indicator_location_data.first()

        # Mark some data entries on location data 1 to be zero
        level_reported_3_key = None
        tuple_disaggregation = get_cast_dictionary_keys_as_tuple(loc_data1.disaggregation)

        for key in tuple_disaggregation:
            if len(key) == 3:
                level_reported_3_key = key
                break

        validated_data = copy.deepcopy(loc_data1.disaggregation)

        old_totals = validated_data['()']
        loc_data1.disaggregation[str(level_reported_3_key)]['d'] = 0
        loc_data1.disaggregation[str(level_reported_3_key)]['v'] = 0
        loc_data1.disaggregation[str(level_reported_3_key)]['c'] = 0
        loc_data1.save()

        RatioIndicatorDisaggregator.post_process(loc_data1)

        self.assertNotEqual(old_totals['c'], loc_data1.disaggregation['()']['c'])

    def test_post_process_reporting_period_ratio_calc(self):
        unit_type = IndicatorBlueprint.PERCENTAGE
        calc_type = IndicatorBlueprint.SUM
        display_type = IndicatorBlueprint.RATIO

        blueprint = factories.RatioTypeIndicatorBlueprintFactory(
            unit=unit_type,
            calculation_formula_across_locations=calc_type,
            calculation_formula_across_periods=calc_type,
            display_type=display_type,
        )
        partneractivity_reportable = factories.RatioReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=blueprint
        )

        partneractivity_reportable.disaggregations.clear()

        add_disaggregations_to_reportable(
            partneractivity_reportable,
            disaggregation_targets=["age", "gender", "height"]
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=partneractivity_reportable,
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=partneractivity_reportable,
        )

        for _ in range(2):
            factories.ClusterIndicatorReportFactory(
                reportable=partneractivity_reportable,
                report_status=INDICATOR_REPORT_STATUS.due,
            )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(partneractivity_reportable, indicator_type="ratio")

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=partneractivity_reportable):
            RatioIndicatorDisaggregator.post_process(loc_data)

        # Indicator total only gets calculated if it's accepted or is sent back
        for ir in partneractivity_reportable.indicator_reports.all():
            ir.report_status = INDICATOR_REPORT_STATUS.accepted
            ir.save()

        latest_accepted_indicator_report = partneractivity_reportable.indicator_reports.order_by('-time_period_start').first()

        self.assertEqual(partneractivity_reportable.total['c'], latest_accepted_indicator_report.total['c'])

    def test_post_process_reporting_period_percentage_calc(self):
        unit_type = IndicatorBlueprint.PERCENTAGE
        calc_type = IndicatorBlueprint.SUM
        display_type = IndicatorBlueprint.RATIO

        blueprint = factories.RatioTypeIndicatorBlueprintFactory(
            unit=unit_type,
            calculation_formula_across_locations=calc_type,
            calculation_formula_across_periods=calc_type,
            display_type=display_type,
        )
        partneractivity_reportable = factories.RatioReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=blueprint
        )

        partneractivity_reportable.disaggregations.clear()

        add_disaggregations_to_reportable(
            partneractivity_reportable,
            disaggregation_targets=["age", "gender", "height"]
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=partneractivity_reportable,
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=partneractivity_reportable,
        )

        for _ in range(2):
            factories.ClusterIndicatorReportFactory(
                reportable=partneractivity_reportable,
                report_status=INDICATOR_REPORT_STATUS.due,
            )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(partneractivity_reportable, indicator_type="ratio")

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=partneractivity_reportable):
            RatioIndicatorDisaggregator.post_process(loc_data)

        # Indicator total only gets calculated if it's accepted or is sent back
        for ir in partneractivity_reportable.indicator_reports.all():
            ir.report_status = INDICATOR_REPORT_STATUS.accepted
            ir.save()

        latest_accepted_indicator_report = partneractivity_reportable.indicator_reports.order_by('-time_period_start').first()

        self.assertEqual(partneractivity_reportable.total['c'] * 100, latest_accepted_indicator_report.total['c'] * 100)
