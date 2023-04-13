import json
import os
from unittest.mock import Mock, patch

from django.conf import settings
from django.test import TestCase

from etools_prp.apps.core.common import INDICATOR_REPORT_STATUS, OVERALL_STATUS, PRP_ROLE_TYPES
from etools_prp.apps.core.management.commands._generate_disaggregation_fake_data import generate_3_num_disagg_data
from etools_prp.apps.core.tests import factories
from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.core.tests.factories import faker
from etools_prp.apps.indicator.disaggregators import QuantityIndicatorDisaggregator
from etools_prp.apps.indicator.models import IndicatorBlueprint, IndicatorLocationData
from etools_prp.apps.ocha.imports.serializers import (
    V1FundingSourceImportSerializer,
    V1ResponsePlanImportSerializer,
    V2PartnerProjectImportSerializer,
)
from etools_prp.apps.partner.models import Partner

SAMPLES_DIR = os.path.join(settings.APPS_DIR, 'ocha', 'samples')


class V2PartnerProjectSerializerTest(BaseAPITestCase):

    def setUp(self):
        self.workspace = factories.WorkspaceFactory()
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.carto_table = factories.CartoDBTableFactory()
        self.loc1 = factories.LocationFactory()
        self.loc2 = factories.LocationFactory()
        self.loc1.workspaces.add(self.workspace)
        self.loc2.workspaces.add(self.workspace)
        self.unicef_officer = factories.PersonFactory()
        self.unicef_focal_point = factories.PersonFactory()
        self.partner_focal_point = factories.PersonFactory()
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
        self.user = factories.NonPartnerUserFactory()
        self.partner_user = factories.PartnerUserFactory(
            workspace=self.workspace,
            partner=self.partner,
            realms__data=[PRP_ROLE_TYPES.ip_authorized_officer, PRP_ROLE_TYPES.cluster_member]
        )
        factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
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

        blueprint = factories.QuantityTypeIndicatorBlueprintFactory(
            unit=IndicatorBlueprint.NUMBER,
            calculation_formula_across_locations=IndicatorBlueprint.SUM,
            calculation_formula_across_periods=IndicatorBlueprint.SUM,
        )
        self.partneractivity_reportable = factories.QuantityReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=blueprint
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=self.partneractivity_reportable,
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=self.partneractivity_reportable,
        )

        self.pd = factories.ProgrammeDocumentFactory(
            workspace=self.workspace,
            partner=self.partner,
            sections=[factories.SectionFactory(), ],
            unicef_officers=[self.unicef_officer, ],
            unicef_focal_point=[self.unicef_focal_point, ],
            partner_focal_point=[self.partner_focal_point, ]
        )

        for idx in range(2):
            qpr_period = factories.QPRReportingPeriodDatesFactory(programme_document=self.pd)
            factories.ProgressReportFactory(
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
            hr_period = factories.HRReportingPeriodDatesFactory(programme_document=self.pd)
            factories.ProgressReportFactory(
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

        self.cp_output = factories.PDResultLinkFactory(
            programme_document=self.pd,
        )
        self.llo = factories.LowerLevelOutputFactory(
            cp_output=self.cp_output,
        )
        self.llo_reportable = factories.QuantityReportableToLowerLevelOutputFactory(
            content_object=self.llo,
            blueprint=factories.QuantityTypeIndicatorBlueprintFactory(
                unit=IndicatorBlueprint.NUMBER,
                calculation_formula_across_locations=IndicatorBlueprint.SUM,
            )
        )

        self.llo_reportable.disaggregations.clear()
        self.partneractivity_reportable.disaggregations.clear()

        # Create the disaggregations and values in the db for all response plans
        # including one for no response plan as well
        for disagg_name, values in self.sample_disaggregation_value_map.items():
            disagg = factories.IPDisaggregationFactory(name=disagg_name)
            cluster_disagg = factories.DisaggregationFactory(name=disagg_name, response_plan=self.response_plan)

            self.llo_reportable.disaggregations.add(disagg)
            self.partneractivity_reportable.disaggregations.add(cluster_disagg)

            for value in values:
                factories.DisaggregationValueFactory(
                    disaggregation=cluster_disagg,
                    value=value
                )
                factories.DisaggregationValueFactory(
                    disaggregation=disagg,
                    value=value
                )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=self.llo_reportable,
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=self.llo_reportable,
        )

        for _ in range(2):
            with patch("django.db.models.signals.ModelSignal.send", Mock()):
                factories.ClusterIndicatorReportFactory(
                    reportable=self.partneractivity_reportable,
                    report_status=INDICATOR_REPORT_STATUS.submitted,
                )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(self.partneractivity_reportable, indicator_type="quantity")

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=self.partneractivity_reportable):
            QuantityIndicatorDisaggregator.post_process(loc_data)

        for pr in self.pd.progress_reports.all():
            factories.ProgressReportIndicatorReportFactory(
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

        # Grab project details from projectVersion array of dict
        current_project_data = None

        for project in external_project_data['projectVersions']:
            if external_project_data['currentPublishedVersionId'] == project['id']:
                current_project_data = project
                break

        if 'code' in external_project_data:
            current_project_data['code'] = external_project_data['code']

        current_project_data['partner'] = Partner.objects.first().pk
        current_project_data['additional_information'] = "www.example.com"
        current_project_data['cluster_ids'] = [self.cluster.id, ]
        serializer = V2PartnerProjectImportSerializer(data=current_project_data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        partner_project = serializer.save()
        self.assertEqual(partner_project.title, current_project_data['name'].strip())
        self.assertEqual(partner_project.code, current_project_data['code'].strip())

        with open(os.path.join(SAMPLES_DIR, 'V1_cash_flow.json')) as sample_file:
            current_project_data = json.load(sample_file)['data']
        current_project_data['partner'] = Partner.objects.first().pk
        serializer = V1FundingSourceImportSerializer(data=current_project_data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        funding_source = serializer.save()
        self.assertIsNotNone(funding_source)


class V1ResponsePlanImportSerializerTest(TestCase):

    def setUp(self):
        self.workspace = factories.WorkspaceFactory()
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.carto_table = factories.CartoDBTableFactory()
        self.loc1 = factories.LocationFactory()
        self.loc2 = factories.LocationFactory()
        self.loc1.workspaces.add(self.workspace)
        self.loc2.workspaces.add(self.workspace)
        self.unicef_officer = factories.PersonFactory()
        self.unicef_focal_point = factories.PersonFactory()
        self.partner_focal_point = factories.PersonFactory()
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
        self.user = factories.NonPartnerUserFactory()
        self.partner_user = factories.PartnerUserFactory(
            workspace=self.workspace,
            partner=self.partner,
            realms__data=[PRP_ROLE_TYPES.ip_authorized_officer, PRP_ROLE_TYPES.cluster_member]
        )
        factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
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

        blueprint = factories.QuantityTypeIndicatorBlueprintFactory(
            unit=IndicatorBlueprint.NUMBER,
            calculation_formula_across_locations=IndicatorBlueprint.SUM,
            calculation_formula_across_periods=IndicatorBlueprint.SUM,
        )
        self.partneractivity_reportable = factories.QuantityReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=blueprint
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=self.partneractivity_reportable,
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=self.partneractivity_reportable,
        )

        self.pd = factories.ProgrammeDocumentFactory(
            workspace=self.workspace,
            partner=self.partner,
            sections=[factories.SectionFactory(), ],
            unicef_officers=[self.unicef_officer, ],
            unicef_focal_point=[self.unicef_focal_point, ],
            partner_focal_point=[self.partner_focal_point, ]
        )

        for idx in range(2):
            qpr_period = factories.QPRReportingPeriodDatesFactory(programme_document=self.pd)
            factories.ProgressReportFactory(
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
            hr_period = factories.HRReportingPeriodDatesFactory(programme_document=self.pd)
            factories.ProgressReportFactory(
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

        self.cp_output = factories.PDResultLinkFactory(
            programme_document=self.pd,
        )
        self.llo = factories.LowerLevelOutputFactory(
            cp_output=self.cp_output,
        )
        self.llo_reportable = factories.QuantityReportableToLowerLevelOutputFactory(
            content_object=self.llo,
            blueprint=factories.QuantityTypeIndicatorBlueprintFactory(
                unit=IndicatorBlueprint.NUMBER,
                calculation_formula_across_locations=IndicatorBlueprint.SUM,
            )
        )

        self.llo_reportable.disaggregations.clear()
        self.partneractivity_reportable.disaggregations.clear()

        # Create the disaggregations and values in the db for all response plans
        # including one for no response plan as well
        for disagg_name, values in self.sample_disaggregation_value_map.items():
            disagg = factories.IPDisaggregationFactory(name=disagg_name)
            cluster_disagg = factories.DisaggregationFactory(name=disagg_name, response_plan=self.response_plan)

            self.llo_reportable.disaggregations.add(disagg)
            self.partneractivity_reportable.disaggregations.add(cluster_disagg)

            for value in values:
                factories.DisaggregationValueFactory(
                    disaggregation=cluster_disagg,
                    value=value
                )
                factories.DisaggregationValueFactory(
                    disaggregation=disagg,
                    value=value
                )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=self.llo_reportable,
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=self.llo_reportable,
        )

        for _ in range(2):
            with patch("django.db.models.signals.ModelSignal.send", Mock()):
                factories.ClusterIndicatorReportFactory(
                    reportable=self.partneractivity_reportable,
                    report_status=INDICATOR_REPORT_STATUS.submitted,
                )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(self.partneractivity_reportable, indicator_type="quantity")

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=self.partneractivity_reportable):
            QuantityIndicatorDisaggregator.post_process(loc_data)

        for pr in self.pd.progress_reports.all():
            factories.ProgressReportIndicatorReportFactory(
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

        response_plan_data['name'] = response_plan_data['planVersion']['name']
        response_plan_data['startDate'] = response_plan_data['planVersion']['startDate']
        response_plan_data['endDate'] = response_plan_data['planVersion']['endDate']
        serializer = V1ResponsePlanImportSerializer(data=response_plan_data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        response_plan = serializer.save()
        self.assertEqual(response_plan.title, 'Sahel Regional 2015')
        self.assertEqual(response_plan.workspace.title, 'Sahel 2014-2016')
        self.assertEqual(
            len(response_plan_data['governingEntities']),
            response_plan.clusters.count()
        )

    def test_single_country_emergency_data(self):
        with open(os.path.join(SAMPLES_DIR, 'V1_response_plan_single_country.json')) as sample_file:
            response_plan_data = json.load(sample_file)['data']

        response_plan_data['name'] = response_plan_data['planVersion']['name']
        response_plan_data['startDate'] = response_plan_data['planVersion']['startDate']
        response_plan_data['endDate'] = response_plan_data['planVersion']['endDate']
        serializer = V1ResponsePlanImportSerializer(data=response_plan_data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        response_plan = serializer.save()
        self.assertEqual(response_plan.title, 'Chad 2013')
        self.assertEqual(response_plan.workspace.title, 'Chad')
        self.assertEqual(
            len(response_plan_data['governingEntities']),
            response_plan.clusters.count()
        )
