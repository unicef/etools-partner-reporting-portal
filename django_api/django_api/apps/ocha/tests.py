import json
import os
from django.test import TestCase
from django.conf import settings

from core.tests.base import BaseAPITestCase
from core.common import (
    INDICATOR_REPORT_STATUS,
    OVERALL_STATUS,
    PRP_ROLE_TYPES,
)
from core.management.commands._generate_disaggregation_fake_data import (
    generate_3_num_disagg_data,
)
from core.factories import (CartoDBTableFactory,
                            ProgressReportIndicatorReportFactory,
                            IPPRPRoleFactory,
                            CountryFactory, DisaggregationFactory,
                            DisaggregationValueFactory, GatewayTypeFactory,
                            LocationFactory,
                            LocationWithReportableLocationGoalFactory,
                            PartnerUserFactory, PartnerFactory,
                            ProgressReportFactory,
                            QuantityReportableToLowerLevelOutputFactory,
                            QuantityTypeIndicatorBlueprintFactory,
                            WorkspaceFactory,
                            SectionFactory,
                            PersonFactory,
                            IPDisaggregationFactory,
                            ProgrammeDocumentFactory,
                            QPRReportingPeriodDatesFactory,
                            HRReportingPeriodDatesFactory,
                            PDResultLinkFactory,
                            LowerLevelOutputFactory,
                            ClusterPRPRoleFactory,
                            ResponsePlanFactory,
                            ClusterFactory,
                            NonPartnerUserFactory,
                            ClusterObjectiveFactory,
                            ClusterActivityFactory,
                            PartnerProjectFactory,
                            ClusterActivityPartnerActivityFactory,
                            QuantityReportableToPartnerActivityFactory,
                            ClusterIndicatorReportFactory)

from ocha.imports.serializers import V2PartnerProjectImportSerializer, V1FundingSourceImportSerializer, \
    V1ResponsePlanImportSerializer
from partner.models import Partner
from indicator.disaggregators import QuantityIndicatorDisaggregator
from indicator.models import (
    IndicatorBlueprint,
    IndicatorLocationData,
)

SAMPLES_DIR = os.path.join(settings.APPS_DIR, 'ocha', 'samples')


class V2PartnerProjectSerializerTest(BaseAPITestCase):

    def setUp(self):
        self.country = CountryFactory()
        self.workspace = WorkspaceFactory(countries=[self.country, ])
        self.response_plan = ResponsePlanFactory(workspace=self.workspace)
        self.cluster = ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.loc_type = GatewayTypeFactory(country=self.country)
        self.carto_table = CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        self.loc1 = LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.unicef_officer = PersonFactory()
        self.unicef_focal_point = PersonFactory()
        self.partner_focal_point = PersonFactory()
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
        self.user = NonPartnerUserFactory()
        self.partner_user = PartnerUserFactory(partner=self.partner)
        ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
        IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, role=PRP_ROLE_TYPES.ip_authorized_officer)
        IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, cluster=None, role=PRP_ROLE_TYPES.cluster_member)
        self.project = PartnerProjectFactory(
            partner=self.partner,
            clusters=[self.cluster],
            locations=[self.loc1, self.loc2],
        )
        self.p_activity = ClusterActivityPartnerActivityFactory(
            cluster_activity=self.activity,
            project=self.project,
        )
        self.sample_disaggregation_value_map = {
            "height": ["tall", "medium", "short", "extrashort"],
            "age": ["1-2m", "3-4m", "5-6m", '7-10m', '11-13m', '14-16m'],
            "gender": ["male", "female", "other"],
        }

        blueprint = QuantityTypeIndicatorBlueprintFactory(
            unit=IndicatorBlueprint.NUMBER,
            calculation_formula_across_locations=IndicatorBlueprint.SUM,
            calculation_formula_across_periods=IndicatorBlueprint.SUM,
        )
        self.partneractivity_reportable = QuantityReportableToPartnerActivityFactory(
            content_object=self.p_activity, blueprint=blueprint
        )

        LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=self.partneractivity_reportable,
        )

        LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=self.partneractivity_reportable,
        )

        self.pd = ProgrammeDocumentFactory(
            workspace=self.workspace,
            partner=self.partner,
            sections=[SectionFactory(), ],
            unicef_officers=[self.unicef_officer, ],
            unicef_focal_point=[self.unicef_focal_point, ],
            partner_focal_point=[self.partner_focal_point, ]
        )

        for idx in range(2):
            qpr_period = QPRReportingPeriodDatesFactory(programme_document=self.pd)
            ProgressReportFactory(
                start_date=qpr_period.start_date,
                end_date=qpr_period.end_date,
                due_date=qpr_period.due_date,
                report_number=idx + 1,
                report_type=qpr_period.report_type,
                is_final=False,
                programme_document=self.pd,
                submitted_by=self.user,
                submitting_user=self.user,
            )

        for idx in range(6):
            hr_period = HRReportingPeriodDatesFactory(programme_document=self.pd)
            ProgressReportFactory(
                start_date=hr_period.start_date,
                end_date=hr_period.end_date,
                due_date=hr_period.due_date,
                report_number=idx + 1,
                report_type=hr_period.report_type,
                is_final=False,
                programme_document=self.pd,
                submitted_by=self.user,
                submitting_user=self.user,
            )

        self.cp_output = PDResultLinkFactory(
            programme_document=self.pd,
        )
        self.llo = LowerLevelOutputFactory(
            cp_output=self.cp_output,
        )
        self.llo_reportable = QuantityReportableToLowerLevelOutputFactory(
            content_object=self.llo,
            blueprint=QuantityTypeIndicatorBlueprintFactory(
                unit=IndicatorBlueprint.NUMBER,
                calculation_formula_across_locations=IndicatorBlueprint.SUM,
            )
        )

        self.llo_reportable.disaggregations.clear()
        self.partneractivity_reportable.disaggregations.clear()

        # Create the disaggregations and values in the db for all response plans
        # including one for no response plan as well
        for disagg_name, values in self.sample_disaggregation_value_map.items():
            disagg = IPDisaggregationFactory(name=disagg_name)
            cluster_disagg = DisaggregationFactory(name=disagg_name, response_plan=self.response_plan)

            self.llo_reportable.disaggregations.add(disagg)
            self.partneractivity_reportable.disaggregations.add(cluster_disagg)

            for value in values:
                DisaggregationValueFactory(
                    disaggregation=cluster_disagg,
                    value=value
                )
                DisaggregationValueFactory(
                    disaggregation=disagg,
                    value=value
                )

        LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=self.llo_reportable,
        )

        LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=self.llo_reportable,
        )

        for _ in range(2):
            ClusterIndicatorReportFactory(
                reportable=self.partneractivity_reportable,
                report_status=INDICATOR_REPORT_STATUS.submitted,
            )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(self.partneractivity_reportable, indicator_type="quantity")

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=self.partneractivity_reportable):
            QuantityIndicatorDisaggregator.post_process(loc_data)

        for pr in self.pd.progress_reports.all():
            ProgressReportIndicatorReportFactory(
                progress_report=pr,
                reportable=self.llo_reportable,
                report_status=INDICATOR_REPORT_STATUS.submitted,
                overall_status=OVERALL_STATUS.met,
            )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(self.llo_reportable, indicator_type="quantity")

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=self.llo_reportable):
            QuantityIndicatorDisaggregator.post_process(loc_data)

        super().setUp()

    def test_load_data(self):
        with open(os.path.join(SAMPLES_DIR, 'V2_project_info.json')) as sample_file:
            external_project_data = json.load(sample_file)['data']
        external_project_data['partner'] = Partner.objects.first().pk
        external_project_data['additional_information'] = "www.example.com"
        external_project_data['cluster_ids'] = [self.cluster.id, ]
        serializer = V2PartnerProjectImportSerializer(data=external_project_data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        partner_project = serializer.save()
        self.assertEqual(partner_project.title, external_project_data['name'].strip())
        self.assertEqual(partner_project.code, external_project_data['code'].strip())

        with open(os.path.join(SAMPLES_DIR, 'V1_cash_flow.json')) as sample_file:
            external_project_data = json.load(sample_file)['data']
        external_project_data['partner'] = Partner.objects.first().pk
        serializer = V1FundingSourceImportSerializer(data=external_project_data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        funding_source = serializer.save()
        self.assertIsNotNone(funding_source)


class V1ResponsePlanImportSerializerTest(TestCase):

    def setUp(self):
        self.country = CountryFactory()
        self.workspace = WorkspaceFactory(countries=[self.country, ])
        self.response_plan = ResponsePlanFactory(workspace=self.workspace)
        self.cluster = ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.loc_type = GatewayTypeFactory(country=self.country)
        self.carto_table = CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        self.loc1 = LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.unicef_officer = PersonFactory()
        self.unicef_focal_point = PersonFactory()
        self.partner_focal_point = PersonFactory()
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
        self.user = NonPartnerUserFactory()
        self.partner_user = PartnerUserFactory(partner=self.partner)
        ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
        IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, role=PRP_ROLE_TYPES.ip_authorized_officer)
        IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, cluster=None, role=PRP_ROLE_TYPES.cluster_member)
        self.project = PartnerProjectFactory(
            partner=self.partner,
            clusters=[self.cluster],
            locations=[self.loc1, self.loc2],
        )
        self.p_activity = ClusterActivityPartnerActivityFactory(
            cluster_activity=self.activity,
            project=self.project,
        )
        self.sample_disaggregation_value_map = {
            "height": ["tall", "medium", "short", "extrashort"],
            "age": ["1-2m", "3-4m", "5-6m", '7-10m', '11-13m', '14-16m'],
            "gender": ["male", "female", "other"],
        }

        blueprint = QuantityTypeIndicatorBlueprintFactory(
            unit=IndicatorBlueprint.NUMBER,
            calculation_formula_across_locations=IndicatorBlueprint.SUM,
            calculation_formula_across_periods=IndicatorBlueprint.SUM,
        )
        self.partneractivity_reportable = QuantityReportableToPartnerActivityFactory(
            content_object=self.p_activity, blueprint=blueprint
        )

        LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=self.partneractivity_reportable,
        )

        LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=self.partneractivity_reportable,
        )

        self.pd = ProgrammeDocumentFactory(
            workspace=self.workspace,
            partner=self.partner,
            sections=[SectionFactory(), ],
            unicef_officers=[self.unicef_officer, ],
            unicef_focal_point=[self.unicef_focal_point, ],
            partner_focal_point=[self.partner_focal_point, ]
        )

        for idx in range(2):
            qpr_period = QPRReportingPeriodDatesFactory(programme_document=self.pd)
            ProgressReportFactory(
                start_date=qpr_period.start_date,
                end_date=qpr_period.end_date,
                due_date=qpr_period.due_date,
                report_number=idx + 1,
                report_type=qpr_period.report_type,
                is_final=False,
                programme_document=self.pd,
                submitted_by=self.user,
                submitting_user=self.user,
            )

        for idx in range(6):
            hr_period = HRReportingPeriodDatesFactory(programme_document=self.pd)
            ProgressReportFactory(
                start_date=hr_period.start_date,
                end_date=hr_period.end_date,
                due_date=hr_period.due_date,
                report_number=idx + 1,
                report_type=hr_period.report_type,
                is_final=False,
                programme_document=self.pd,
                submitted_by=self.user,
                submitting_user=self.user,
            )

        self.cp_output = PDResultLinkFactory(
            programme_document=self.pd,
        )
        self.llo = LowerLevelOutputFactory(
            cp_output=self.cp_output,
        )
        self.llo_reportable = QuantityReportableToLowerLevelOutputFactory(
            content_object=self.llo,
            blueprint=QuantityTypeIndicatorBlueprintFactory(
                unit=IndicatorBlueprint.NUMBER,
                calculation_formula_across_locations=IndicatorBlueprint.SUM,
            )
        )

        self.llo_reportable.disaggregations.clear()
        self.partneractivity_reportable.disaggregations.clear()

        # Create the disaggregations and values in the db for all response plans
        # including one for no response plan as well
        for disagg_name, values in self.sample_disaggregation_value_map.items():
            disagg = IPDisaggregationFactory(name=disagg_name)
            cluster_disagg = DisaggregationFactory(name=disagg_name, response_plan=self.response_plan)

            self.llo_reportable.disaggregations.add(disagg)
            self.partneractivity_reportable.disaggregations.add(cluster_disagg)

            for value in values:
                DisaggregationValueFactory(
                    disaggregation=cluster_disagg,
                    value=value
                )
                DisaggregationValueFactory(
                    disaggregation=disagg,
                    value=value
                )

        LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=self.llo_reportable,
        )

        LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=self.llo_reportable,
        )

        for _ in range(2):
            ClusterIndicatorReportFactory(
                reportable=self.partneractivity_reportable,
                report_status=INDICATOR_REPORT_STATUS.submitted,
            )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(self.partneractivity_reportable, indicator_type="quantity")

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=self.partneractivity_reportable):
            QuantityIndicatorDisaggregator.post_process(loc_data)

        for pr in self.pd.progress_reports.all():
            ProgressReportIndicatorReportFactory(
                progress_report=pr,
                reportable=self.llo_reportable,
                report_status=INDICATOR_REPORT_STATUS.submitted,
                overall_status=OVERALL_STATUS.met,
            )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(self.llo_reportable, indicator_type="quantity")

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=self.llo_reportable):
            QuantityIndicatorDisaggregator.post_process(loc_data)

        super().setUp()

    def test_multi_country_emergency_data(self):
        with open(os.path.join(SAMPLES_DIR, 'V1_response_plan.json')) as sample_file:
            response_plan_data = json.load(sample_file)['data']
        serializer = V1ResponsePlanImportSerializer(data=response_plan_data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        response_plan = serializer.save()
        self.assertEqual(response_plan.title, 'Syria regional refugee and resilience plan (3RP) 2016')
        self.assertEqual(
            len(response_plan_data['locations']),
            response_plan.workspace.countries.count()
        )
        self.assertEqual(response_plan.workspace.title, 'Syrian Arab Republic - Civil Unrest (from 2012)')
        self.assertEqual(
            len(response_plan_data['governingEntities']),
            response_plan.clusters.count()
        )

    def test_single_country_emergency_data(self):
        with open(os.path.join(SAMPLES_DIR, 'V1_response_plan_single_country.json')) as sample_file:
            response_plan_data = json.load(sample_file)['data']
        serializer = V1ResponsePlanImportSerializer(data=response_plan_data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        response_plan = serializer.save()
        self.assertEqual(response_plan.title, 'occupied Palestinian territory 2016')
        self.assertEqual(
            len(response_plan_data['locations']),
            response_plan.workspace.countries.count()
        )
        self.assertEqual(response_plan.workspace.title, 'occupied Palestinian territory')
        self.assertEqual(
            len(response_plan_data['governingEntities']),
            response_plan.clusters.count()
        )
