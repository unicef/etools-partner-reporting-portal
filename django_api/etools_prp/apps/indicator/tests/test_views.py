import copy
import datetime
from ast import literal_eval as make_tuple
from unittest.mock import patch

from django.conf import settings
from django.urls import reverse

from rest_framework import status
from unicef_notification.models import Notification

from etools_prp.apps.cluster.models import ClusterActivity, ClusterObjective
from etools_prp.apps.core.common import (
    INDICATOR_REPORT_STATUS,
    OVERALL_STATUS,
    PRP_ROLE_TYPES,
    REPORTABLE_FREQUENCY_LEVEL,
)
from etools_prp.apps.core.helpers import get_cast_dictionary_keys_as_tuple
from etools_prp.apps.core.management.commands._generate_disaggregation_fake_data import (
    add_disaggregations_to_reportable,
    generate_3_num_disagg_data,
)
from etools_prp.apps.core.models import Location
from etools_prp.apps.core.tests import factories
from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.core.tests.factories import faker
from etools_prp.apps.indicator.disaggregators import QuantityIndicatorDisaggregator
from etools_prp.apps.indicator.models import (
    Disaggregation,
    DisaggregationValue,
    IndicatorBlueprint,
    IndicatorLocationData,
    IndicatorReport,
    Reportable,
)
from etools_prp.apps.indicator.serializers import (
    IdDisaggregationSerializer,
    IndicatorLocationDataUpdateSerializer,
    ReportableLocationGoalSerializer,
)
from etools_prp.apps.partner.models import PartnerActivity, PartnerProject
from etools_prp.apps.unicef.models import ProgrammeDocument

today = datetime.date.today()
beginning_of_this_year = datetime.date(today.year, 1, 1)
end_of_this_year = datetime.date(today.year, 12, 31)


class TestPDReportsAPIView(BaseAPITestCase):

    def setUp(self):
        self.workspace = factories.WorkspaceFactory()
        self.carto_table = factories.CartoDBTableFactory()
        self.partner = factories.PartnerFactory()
        self.user = factories.PartnerUserFactory(partner=self.partner)
        self.prp_role = factories.IPPRPRoleFactory(user=self.user, workspace=self.workspace, role=PRP_ROLE_TYPES.ip_authorized_officer)
        self.loc1 = factories.LocationFactory()
        self.loc2 = factories.LocationFactory()
        self.loc1.workspaces.add(self.workspace)
        self.loc2.workspaces.add(self.workspace)

        self.unicef_officer = factories.PersonFactory()
        self.unicef_focal_point = factories.PersonFactory()
        self.partner_focal_point = factories.PersonFactory()

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
                    disaggregation=factories.IPDisaggregationFactory(name=disagg_name),
                    value=value
                )

        self.llo_reportable = factories.QuantityReportableToLowerLevelOutputFactory(
            content_object=self.llo,
            blueprint=factories.QuantityTypeIndicatorBlueprintFactory(
                unit=IndicatorBlueprint.NUMBER,
                calculation_formula_across_locations=IndicatorBlueprint.SUM,
            )
        )

        self.llo_reportable.disaggregations.clear()

        add_disaggregations_to_reportable(
            self.llo_reportable,
            disaggregation_targets=["age", "gender", "height"]
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=self.llo_reportable,
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=self.llo_reportable,
        )

        for pr in self.pd.progress_reports.all():
            factories.ProgressReportIndicatorReportFactory(
                progress_report=pr,
                reportable=self.llo_reportable,
                report_status=INDICATOR_REPORT_STATUS.due,
                overall_status=OVERALL_STATUS.met,
            )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(self.llo_reportable, indicator_type="quantity")

        loc_total = 0

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=self.llo_reportable):
            QuantityIndicatorDisaggregator.post_process(loc_data)
            loc_total += loc_data.disaggregation['()']['c']

        super().setUp()

    def test_list_api(self):
        pd = ProgrammeDocument.objects.first()
        url = reverse('programme-document-reports', kwargs={'pd_id': pd.pk})
        response = self.client.get(url, format='json')

        report_ids = pd.reportable_queryset.values_list(
            'indicator_reports__pk', flat=True)
        reports = IndicatorReport.objects.filter(id__in=report_ids)

        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(len(reports), len(response.data['results']))

        first_ir = reports.first()
        filter_url = "%s?status=%s" % (
            url,
            first_ir.progress_report.get_status_display()
        )
        response = self.client.get(filter_url, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(1, len(response.data['results']))

    def test_get_indicator_report(self):
        report_ids = self.pd.reportable_queryset.values_list(
            'indicator_reports__pk', flat=True)
        reports = IndicatorReport.objects.filter(id__in=report_ids)
        first_ir = reports.first()

        url = reverse('programme-document-reports-detail',
                      kwargs={'pd_id': self.pd.pk, 'report_id': first_ir.id})
        response = self.client.get(url, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['id'], str(first_ir.id))


class TestIndicatorDataAPIView(BaseAPITestCase):

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

        blueprint = factories.QuantityTypeIndicatorBlueprintFactory(
            unit=IndicatorBlueprint.NUMBER,
            calculation_formula_across_locations=IndicatorBlueprint.SUM,
            calculation_formula_across_periods=IndicatorBlueprint.SUM,
        )
        self.partneractivity_reportable = factories.QuantityReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=blueprint
        )

        self.partneractivity_reportable.disaggregations.clear()

        add_disaggregations_to_reportable(
            self.partneractivity_reportable,
            disaggregation_targets=["age", "gender", "height"]
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=self.partneractivity_reportable,
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=self.partneractivity_reportable,
        )

        for _ in range(2):
            factories.ClusterIndicatorReportFactory(
                reportable=self.partneractivity_reportable,
                report_status=INDICATOR_REPORT_STATUS.due,
            )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(self.partneractivity_reportable, indicator_type="quantity")

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=self.partneractivity_reportable):
            QuantityIndicatorDisaggregator.post_process(loc_data)

        super().setUp()

    @patch("etools_prp.apps.utils.emails.EmailTemplate.objects.update_or_create")
    @patch.object(Notification, "full_clean", return_value=None)
    @patch.object(Notification, "send_notification", return_value=None)
    def test_submit_indicator(self, mock_create, mock_clean, mock_send):
        ir = IndicatorReport.objects.first()
        ir.report_status = INDICATOR_REPORT_STATUS.sent_back
        ir.overall_status = OVERALL_STATUS.met
        ir.save()

        # Submitting a valid indicator report will return as accepted
        url = reverse('indicator-data', kwargs={'ir_id': ir.id})
        response = self.client.post(url, format='json')
        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            response.data['submission_date'],
            today.strftime(settings.PRINT_DATA_FORMAT),
        )
        self.assertEquals(
            response.data['report_status'],
            INDICATOR_REPORT_STATUS.accepted)


class TestIndicatorListAPIView(BaseAPITestCase):

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

        blueprint = factories.QuantityTypeIndicatorBlueprintFactory(
            unit=IndicatorBlueprint.NUMBER,
            calculation_formula_across_locations=IndicatorBlueprint.SUM,
            calculation_formula_across_periods=IndicatorBlueprint.SUM,
        )
        self.partneractivity_reportable = factories.QuantityReportableToPartnerActivityProjectContextFactory(
            content_object=self.project_context, blueprint=blueprint
        )

        self.partneractivity_reportable.disaggregations.clear()

        add_disaggregations_to_reportable(
            self.partneractivity_reportable,
            disaggregation_targets=["age", "gender", "height"]
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=self.partneractivity_reportable,
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=self.partneractivity_reportable,
        )

        for _ in range(2):
            factories.ClusterIndicatorReportFactory(
                reportable=self.partneractivity_reportable,
                report_status=INDICATOR_REPORT_STATUS.due,
            )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(self.partneractivity_reportable, indicator_type="quantity")

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=self.partneractivity_reportable):
            QuantityIndicatorDisaggregator.post_process(loc_data)

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

        # Create the disaggregations and values in the db for all response plans
        # including one for no response plan as well
        for disagg_name, values in self.sample_disaggregation_value_map.items():
            for value in values:
                disagg = factories.IPDisaggregationFactory(name=disagg_name)

                self.llo_reportable.disaggregations.add(disagg)
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

        for pr in self.pd.progress_reports.all():
            factories.ProgressReportIndicatorReportFactory(
                progress_report=pr,
                reportable=self.llo_reportable,
                report_status=INDICATOR_REPORT_STATUS.due,
                overall_status=OVERALL_STATUS.met,
            )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(self.llo_reportable, indicator_type="quantity")

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=self.llo_reportable):
            QuantityIndicatorDisaggregator.post_process(loc_data)

        super().setUp()

    def test_list_api_filter_by_locations(self):
        self.reports = Reportable.objects.filter(
            partner_activity_project_contexts__reportables__isnull=False,
            locations__isnull=False
        ).distinct()

        location_ids = list(map(lambda item: str(
            item), self.reports.values_list('locations__id', flat=True)))
        location_id_list_string = ','.join(location_ids)

        url = reverse('indicator-list-api', kwargs={'content_object': 'llo'})
        url += '?locations=' + location_id_list_string
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(self.reports), len(response.data['results']))

    def test_list_api_filter_by_pd_ids(self):
        self.reports = Reportable.objects.filter(
            lower_level_outputs__reportables__isnull=False,
            locations__isnull=False).distinct()

        pd_ids = map(
            lambda item: str(item),
            self.reports.values_list(
                'lower_level_outputs__cp_output__programme_document__id', flat=True)
        )
        pd_id_list_string = ','.join(pd_ids)

        url = reverse('indicator-list-api', kwargs={'content_object': 'llo'})
        url += '?pds=' + pd_id_list_string
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(self.reports), len(response.data['results']))


class TestIndicatorDataReportableAPIView(BaseAPITestCase):

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
        self.partner_user = factories.PartnerUserFactory(partner=self.partner)
        factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
        factories.IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, role=PRP_ROLE_TYPES.ip_authorized_officer)
        factories.IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, cluster=None, role=PRP_ROLE_TYPES.cluster_member)
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

        for _ in range(2):
            factories.ClusterIndicatorReportFactory(
                reportable=self.partneractivity_reportable,
                report_status=INDICATOR_REPORT_STATUS.due,
            )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(self.partneractivity_reportable, indicator_type="quantity")

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=self.partneractivity_reportable):
            QuantityIndicatorDisaggregator.post_process(loc_data)

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
            for value in values:
                factories.DisaggregationValueFactory(
                    disaggregation=factories.DisaggregationFactory(name=disagg_name, response_plan=self.response_plan),
                    value=value
                )

                disagg = factories.IPDisaggregationFactory(name=disagg_name)

                self.llo_reportable.disaggregations.add(disagg)
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

        for pr in self.pd.progress_reports.all():
            factories.ProgressReportIndicatorReportFactory(
                progress_report=pr,
                reportable=self.llo_reportable,
                report_status=INDICATOR_REPORT_STATUS.due,
                overall_status=OVERALL_STATUS.met,
            )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(self.llo_reportable, indicator_type="quantity")

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=self.llo_reportable):
            QuantityIndicatorDisaggregator.post_process(loc_data)

        super().setUp()

        self.client.force_authenticate(self.partner_user)

    def test_overall_narrative(self):
        pr = self.partner_user.partner.programmedocument_set.first() \
            .progress_reports.first()
        ir = pr.indicator_reports.first()

        url = reverse(
            'indicator-data-reportable',
            kwargs={
                'pd_progress_report_id': pr.id,
                'llo_id': ir.reportable.content_object.id})

        new_overall_status = OVERALL_STATUS.met
        data = dict(overall_status=new_overall_status)
        response = self.client.patch(url, data=data, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(response.data['overall_status'], new_overall_status)

        updated_ir = IndicatorReport.objects.get(id=ir.id)
        self.assertEquals(updated_ir.overall_status, new_overall_status)

        new_narrative_assessment = "new narrative_assessment"
        data = dict(narrative_assessment=new_narrative_assessment)
        response = self.client.patch(url, data=data, format='json')
        self.assertEquals(response.status_code, status.HTTP_200_OK)
        updated_ir = IndicatorReport.objects.get(id=ir.id)
        self.assertEquals(
            updated_ir.narrative_assessment,
            new_narrative_assessment)


class TestIndicatorReportListAPIView(BaseAPITestCase):

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
        self.partner_user = factories.PartnerUserFactory(partner=self.partner)
        factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
        factories.IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, role=PRP_ROLE_TYPES.ip_authorized_officer)
        factories.IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, cluster=None, role=PRP_ROLE_TYPES.cluster_member)
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

        for _ in range(2):
            factories.ClusterIndicatorReportFactory(
                reportable=self.partneractivity_reportable,
                report_status=INDICATOR_REPORT_STATUS.submitted,
            )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(self.partneractivity_reportable, indicator_type="quantity")

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=self.partneractivity_reportable):
            QuantityIndicatorDisaggregator.post_process(loc_data)

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
            for value in values:
                factories.DisaggregationValueFactory(
                    disaggregation=factories.DisaggregationFactory(name=disagg_name, response_plan=self.response_plan),
                    value=value
                )

                disagg = factories.IPDisaggregationFactory(name=disagg_name)

                self.llo_reportable.disaggregations.add(disagg)
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

        self.client.force_authenticate(self.partner_user)

    def test_list_api_with_reportable_id(self):
        indicator_report = IndicatorReport.objects.last()

        url = reverse('indicator-report-list-api',
                      kwargs={'reportable_id': indicator_report.reportable.id})
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data),
                          indicator_report.reportable.indicator_reports.count())
        self.assertNotEquals(response.data[0]['indicator_location_data'][
                             0]['disaggregation'], {})

    def test_list_api_with_limit(self):
        indicator_report = IndicatorReport.objects.last()

        url = reverse('indicator-report-list-api',
                      kwargs={'reportable_id': indicator_report.reportable.id})
        url += '?limit=2'
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), 2)


class TestClusterIndicatorAPIView(BaseAPITestCase):

    def setUp(self):

        self.workspace = factories.WorkspaceFactory()
        self.response_plan = factories.ResponsePlanFactory(
            workspace=self.workspace,
            start=beginning_of_this_year,
            end=end_of_this_year,
        )
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.carto_table = factories.CartoDBTableFactory()
        self.admin_level = 3
        self.loc1 = factories.LocationFactory(admin_level=self.admin_level)
        self.loc2 = factories.LocationFactory(admin_level=self.admin_level)
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
        self.partner_user = factories.PartnerUserFactory(partner=self.partner)
        factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
        factories.IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, role=PRP_ROLE_TYPES.ip_authorized_officer)
        factories.IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, cluster=None, role=PRP_ROLE_TYPES.cluster_member)
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
            start_date=datetime.date(today.year, 3, 1),
            end_date=datetime.date(today.year, 10, 25),
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

        for _ in range(2):
            factories.ClusterIndicatorReportFactory(
                reportable=self.partneractivity_reportable,
                report_status=INDICATOR_REPORT_STATUS.submitted,
            )

        # Creating Level-3 disaggregation location data for all locations
        generate_3_num_disagg_data(self.partneractivity_reportable, indicator_type="quantity")

        for loc_data in IndicatorLocationData.objects.filter(indicator_report__reportable=self.partneractivity_reportable):
            QuantityIndicatorDisaggregator.post_process(loc_data)

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
            for value in values:
                factories.DisaggregationValueFactory(
                    disaggregation=factories.DisaggregationFactory(name=disagg_name, response_plan=self.response_plan),
                    value=value
                )

                disagg = factories.IPDisaggregationFactory(name=disagg_name)

                self.llo_reportable.disaggregations.add(disagg)
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

        self.reportable_count = Reportable.objects.count()
        self.blueprint_count = IndicatorBlueprint.objects.count()
        self.first_disaggregation = Disaggregation.objects.first()
        self.last_disaggregation = Disaggregation.objects.last()

        self.co = ClusterObjective.objects.first()
        self.url = reverse('cluster-indicator')
        self.data = {
            'object_id': self.co.id,
            'object_type': 'cluster.clusterobjective',
            'means_of_verification': 'IMO/CC calculation',
            'frequency': REPORTABLE_FREQUENCY_LEVEL.weekly,
            'start_date_of_reporting_period': today.strftime(settings.INPUT_DATA_FORMAT),
            'locations': [
                {'target': {'d': 1, 'v': 300}, 'baseline': {'d': 1, 'v': 50}, 'location': Location.objects.filter(admin_level=self.admin_level)[0].id},
                {'target': {'d': 1, 'v': 300}, 'baseline': {'d': 1, 'v': 50}, 'location': Location.objects.filter(admin_level=self.admin_level)[1].id},
            ],
            'blueprint': {
                'title': 'of temporary classrooms',
                'calculation_formula_across_periods': IndicatorBlueprint.MAX,
                'calculation_formula_across_locations': IndicatorBlueprint.AVG,
                'display_type': IndicatorBlueprint.NUMBER,
            },
            'disaggregations': IdDisaggregationSerializer(
                [self.first_disaggregation, self.last_disaggregation],
                many=True).data,
            'target': {'d': 1, 'v': 3000},
            'baseline': {'d': 1, 'v': 2000},
            'in_need': {'d': 1, 'v': 20000},
        }

    def test_create_indicator_cluster_objective_reporting(self):
        response = self.client.post(self.url, data=self.data, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.status_code, status.HTTP_201_CREATED)
        self.assertEquals(
            Reportable.objects.count(),
            self.reportable_count + 1)
        self.assertEquals(
            IndicatorBlueprint.objects.count(),
            self.blueprint_count + 1)

        reportable = Reportable.objects.get(id=response.data['id'])
        self.assertEquals(
            reportable.frequency,
            REPORTABLE_FREQUENCY_LEVEL.weekly)

        rep_dis = Disaggregation.objects.filter(reportable=response.data['id'])
        self.assertTrue(rep_dis.first().name in [self.first_disaggregation.name, self.last_disaggregation.name])
        self.assertTrue(rep_dis.last().name in [self.first_disaggregation.name, self.last_disaggregation.name])

        self.data['locations'].append(dict(failkey=1))
        response = self.client.post(self.url, data=self.data, format='json')
        self.assertFalse(status.is_success(response.status_code))
        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_percentage_indicator_reporting(self):
        self.data['blueprint']['calculation_formula_across_periods'] = IndicatorBlueprint.SUM
        self.data['blueprint']['calculation_formula_across_locations'] = IndicatorBlueprint.SUM
        self.data['blueprint']['display_type'] = IndicatorBlueprint.PERCENTAGE
        response = self.client.post(self.url, data=self.data, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.status_code, status.HTTP_201_CREATED)
        self.assertEquals(
            Reportable.objects.count(),
            self.reportable_count + 1)
        self.assertEquals(
            IndicatorBlueprint.objects.count(),
            self.blueprint_count + 1)

        reportable = Reportable.objects.get(id=response.data['id'])
        self.assertEquals(
            reportable.blueprint.display_type,
            IndicatorBlueprint.PERCENTAGE)

    def test_create_csdates_indicator_cluster_activities_reporting(self):
        date = datetime.date(2020, 4, 9)
        cs_dates = [
            (date + datetime.timedelta(days=3)).strftime(settings.INPUT_DATA_FORMAT),
            (date + datetime.timedelta(days=6)).strftime(settings.INPUT_DATA_FORMAT),
            (date + datetime.timedelta(days=12)).strftime(settings.INPUT_DATA_FORMAT),
            (date + datetime.timedelta(days=9)).strftime(settings.INPUT_DATA_FORMAT),
        ]
        ca = ClusterActivity.objects.first()
        self.data['object_id'] = ca.id
        self.data['object_type'] = 'cluster.clusteractivity'
        self.data['start_date_of_reporting_period'] = today.strftime(settings.INPUT_DATA_FORMAT)
        self.data['cs_dates'] = cs_dates
        self.data['frequency'] = REPORTABLE_FREQUENCY_LEVEL.custom_specific_dates
        response = self.client.post(self.url, data=self.data, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.status_code, status.HTTP_201_CREATED)

        reportable = Reportable.objects.get(id=response.data['id'])
        self.assertEquals(reportable.frequency,
                          REPORTABLE_FREQUENCY_LEVEL.custom_specific_dates)
        self.assertEquals(len(reportable.cs_dates), len(cs_dates))
        self.assertEquals(
            Reportable.objects.count(),
            self.reportable_count + 2)
        self.assertEquals(
            IndicatorBlueprint.objects.count(),
            self.blueprint_count + 1)

        # check that cs_dates are ordered correctly
        self.assertEquals(
            response.data["cs_dates"],
            ['12-Apr-2020', '15-Apr-2020', '18-Apr-2020', '21-Apr-2020'],
        )

    def test_create_indicator_partner_project_reporting(self):
        pp = PartnerProject.objects.first()
        self.data['object_id'] = pp.id
        self.data['object_type'] = 'partner.partnerproject'
        response = self.client.post(self.url, data=self.data, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.status_code, status.HTTP_201_CREATED)
        self.assertEquals(
            Reportable.objects.count(),
            self.reportable_count + 1)
        self.assertEquals(
            IndicatorBlueprint.objects.count(),
            self.blueprint_count + 1)

    def test_create_indicator_partner_activities_reporting(self):
        pa = PartnerActivity.objects.filter(projects__isnull=False).first()
        self.data['object_id'] = pa.id
        self.data['object_type'] = 'partner.partneractivity'
        self.data['start_date_of_reporting_period'] = str(datetime.date(today.year, 4, 1))
        self.data['project_context_id'] = pa.partneractivityprojectcontext_set.first().id
        response = self.client.post(self.url, data=self.data, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.status_code, status.HTTP_201_CREATED)
        self.assertEquals(
            Reportable.objects.count(),
            self.reportable_count + 1)
        self.assertEquals(
            IndicatorBlueprint.objects.count(),
            self.blueprint_count + 1)

    def test_create_indicator_fake_object_type_reporting(self):
        self.data['object_id'] = 1
        self.data['object_type'] = 'cluster.cluster'
        response = self.client.post(self.url, data=self.data, format='json')
        self.assertFalse(status.is_success(response.status_code))
        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEquals(Reportable.objects.count(), self.reportable_count)
        self.assertEquals(
            IndicatorBlueprint.objects.count(),
            self.blueprint_count)

    def test_update_indicator_cluster_reporting(self):
        response = self.client.post(self.url, data=self.data, format='json')
        self.assertTrue(status.is_success(response.status_code))

        self.data.update({"id": response.data.get("id")})
        new_means_of_verification = 'IMO/CC calculation - updated'
        self.data['means_of_verification'] = new_means_of_verification
        new_title = 'of temporary classrooms - updated'
        self.data['blueprint']['title'] = new_title
        self.data['blueprint']['calculation_formula_across_locations'] = IndicatorBlueprint.MAX

        reportable = Reportable.objects.get(id=response.data['id'])
        self.data['locations'] = ReportableLocationGoalSerializer(
            reportable.reportablelocationgoal_set.all(), many=True
        ).data

        date = datetime.date(2020, 4, 9)
        cs_dates = [
            (date + datetime.timedelta(days=6)).strftime(settings.INPUT_DATA_FORMAT),
            (date + datetime.timedelta(days=3)).strftime(settings.INPUT_DATA_FORMAT),
            (date + datetime.timedelta(days=12)).strftime(settings.INPUT_DATA_FORMAT),
            (date + datetime.timedelta(days=9)).strftime(settings.INPUT_DATA_FORMAT),
        ]
        self.data['cs_dates'] = cs_dates

        response = self.client.put(self.url, data=self.data, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(
            response.data['means_of_verification'],
            new_means_of_verification)
        self.assertEquals(response.data['blueprint']['title'], new_title)
        self.assertEquals(
            response.data['blueprint']['calculation_formula_across_locations'],
            IndicatorBlueprint.AVG)
        self.assertEquals(reportable.locations.count(), 2)

        # check that cs_dates are ordered correctly
        self.assertEquals(
            response.data["cs_dates"],
            ['12-Apr-2020', '15-Apr-2020', '18-Apr-2020', '21-Apr-2020'],
        )


class TestIndicatorLocationDataUpdateAPIView(BaseAPITestCase):
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
        self.partner_user = factories.PartnerUserFactory(partner=self.partner)
        factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
        factories.IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, role=PRP_ROLE_TYPES.ip_authorized_officer)
        factories.IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, cluster=None, role=PRP_ROLE_TYPES.cluster_member)
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

    def test_update_level_reported_3(self):
        indicator_location_data = self.partneractivity_reportable.indicator_reports.first().indicator_location_data.first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        level_reported_3_key = None
        tuple_disaggregation = get_cast_dictionary_keys_as_tuple(
            update_data['disaggregation'])

        for key in tuple_disaggregation:
            if len(key) == 3:
                level_reported_3_key = key
                break

        correct_total = update_data['disaggregation']['()']['v'] \
            - update_data['disaggregation'][str(level_reported_3_key)]['v']
        update_data['disaggregation'][str(level_reported_3_key)]['v'] = 0

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            response.data['disaggregation']['()']['v'],
            correct_total)

    def test_update_illegal_level_reported_validation(self):
        indicator_location_data = self.partneractivity_reportable.indicator_reports.first().indicator_location_data.first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data
        update_data['level_reported'] += 2

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            'level_reported cannot be higher than its num_disaggregation',
            response.data['non_field_errors'][0]
        )

    def test_update_nonnumeric_data_entry_validation(self):
        indicator_location_data = self.partneractivity_reportable.indicator_reports.first().indicator_location_data.first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        level_reported_3_key = None
        tuple_disaggregation = get_cast_dictionary_keys_as_tuple(
            update_data['disaggregation'])

        for key in tuple_disaggregation:
            if len(key) == 3:
                level_reported_3_key = key
                break

        validated_data = copy.deepcopy(update_data['disaggregation'][str(level_reported_3_key)])

        url = reverse('indicator-location-data-entries-put-api')

        update_data['disaggregation'][str(level_reported_3_key)]['c'] = 'aaaa'
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "c value is not number",
            response.data['non_field_errors'][0]
        )

        update_data['disaggregation'][str(level_reported_3_key)] = copy.deepcopy(validated_data)
        update_data['disaggregation'][str(level_reported_3_key)]['d'] = 'aaaa'
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "d value is not number",
            response.data['non_field_errors'][0]
        )

        update_data['disaggregation'][str(level_reported_3_key)] = copy.deepcopy(validated_data)
        update_data['disaggregation'][str(level_reported_3_key)]['v'] = 'aaaa'
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "v value is not number",
            response.data['non_field_errors'][0]
        )

    def test_update_zero_division_data_entry_validation_not_on_quantity(self):
        indicator_location_data = self.partneractivity_reportable.indicator_reports.first().indicator_location_data.first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        level_reported_3_key = None
        tuple_disaggregation = get_cast_dictionary_keys_as_tuple(
            update_data['disaggregation'])

        for key in tuple_disaggregation:
            if len(key) == 3:
                level_reported_3_key = key
                break

        url = reverse('indicator-location-data-entries-put-api')

        update_data['disaggregation'][str(level_reported_3_key)]['d'] = 0
        update_data['disaggregation'][str(level_reported_3_key)]['v'] = 100
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)

    def test_update_wrong_disaggregation_reported_on_count_validation(self):
        indicator_location_data = self.partneractivity_reportable.indicator_reports.first().indicator_location_data.first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        update_data['level_reported'] -= 1

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            'disaggregation_reported_on list must have '
            + 'level_reported # of elements',
            response.data['non_field_errors'][0]
        )

    def test_update_wrong_num_disaggregation_count_validation(self):
        indicator_location_data = self.partneractivity_reportable.indicator_reports.first().indicator_location_data.first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        update_data['num_disaggregation'] += 1

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            u"num_disaggregation is not matched with "
            + "its IndicatorReport's Reportable disaggregation counts",
            response.data['non_field_errors'][0]
        )

    def test_update_wrong_disaggregation_reported_on_values_validation(self):
        indicator_location_data = self.partneractivity_reportable.indicator_reports.first().indicator_location_data.first()

        next_disaggregation_id = Disaggregation.objects.count() + 1

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        update_data['disaggregation_reported_on'].pop(0)
        update_data['disaggregation_reported_on'].append(
            next_disaggregation_id)

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            'disaggregation_reported_on list must have all '
            + 'its elements mapped to disaggregation ids',
            response.data['non_field_errors'][0]
        )

    def test_update_wrong_indicator_report_membership_validation(self):
        indicator_location_data = self.partneractivity_reportable.indicator_reports.first().indicator_location_data.first()
        different_indicator_report = IndicatorLocationData.objects \
            .exclude(
                indicator_report=indicator_location_data.indicator_report
            ).first().indicator_report

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        update_data['indicator_report'] = different_indicator_report.id

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "IndicatorLocationData does not belong to ",
            response.data['non_field_errors'][0]
        )

    def test_update_not_all_level_reported_disaggregation_entry_count(self):
        indicator_location_data = self.partneractivity_reportable.indicator_reports.first().indicator_location_data.first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        level_reported_key = list(filter(
            lambda item: len(make_tuple(item)) ==
            indicator_location_data.level_reported,
            update_data['disaggregation'].keys()))[0]
        update_data['disaggregation'].pop(level_reported_key)

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEquals(
            "Submitted disaggregation data entries do not contain "
            + "all level %d combination pair keys" % (indicator_location_data.level_reported),
            str(response.data['non_field_errors'][0])
        )

    def test_update_extra_disaggregation_entry_count(self):
        indicator_location_data = self.partneractivity_reportable.indicator_reports.first().indicator_location_data.first()

        disaggregation_value_count = DisaggregationValue.objects.count()
        bad_key = tuple(
            [
                disaggregation_value_count,
                disaggregation_value_count + 1,
                disaggregation_value_count + 2
            ]
        )

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        update_data['disaggregation'][str(bad_key)] = {
            'c': 0,
            'd': 0,
            'v': 100
        }

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "Submitted disaggregation data entries contains "
            + "extra combination pair keys",
            str(response.data['non_field_errors'][0])
        )

    def test_update_higher_coordinate_space_key_validation(self):
        indicator_location_data = self.partneractivity_reportable.indicator_reports.first().indicator_location_data.first()

        next_disaggregation_value_id = DisaggregationValue.objects.count() + 1

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        level_reported_3_key = None
        tuple_disaggregation = get_cast_dictionary_keys_as_tuple(
            update_data['disaggregation'])

        for key in tuple_disaggregation:
            if len(key) == 3:
                level_reported_3_key = key
                break

        del update_data['disaggregation'][str(level_reported_3_key)]
        level_reported_3_key = list(level_reported_3_key)
        level_reported_3_key.append(next_disaggregation_value_id)
        update_data['disaggregation'][str(tuple(level_reported_3_key))] = {}

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "Disaggregation data coordinate "
            + "space cannot be higher than "
            + "specified level_reported",
            response.data['non_field_errors'][0]
        )

    def test_update_invalid_coordinate_space_key_validation(self):
        indicator_location_data = self.partneractivity_reportable.indicator_reports.first().indicator_location_data.first()

        next_disaggregation_value_id = DisaggregationValue.objects.count() + 1

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        level_reported_3_key = None
        tuple_disaggregation = get_cast_dictionary_keys_as_tuple(
            update_data['disaggregation'])

        for key in tuple_disaggregation:
            if len(key) == 3:
                level_reported_3_key = key
                break

        del update_data['disaggregation'][str(level_reported_3_key)]

        level_reported_3_key = list(level_reported_3_key[:-1])
        level_reported_3_key.append(next_disaggregation_value_id)
        update_data['disaggregation'][str(tuple(level_reported_3_key))] = {}

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "coordinate space does not "
            + "belong to disaggregation value id list",
            response.data['non_field_errors'][0]
        )

    def test_update_invalid_coordinate_space_key_format_validation(self):
        indicator_location_data = self.partneractivity_reportable.indicator_reports.first().indicator_location_data.first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        level_reported_3_key = None
        tuple_disaggregation = get_cast_dictionary_keys_as_tuple(
            update_data['disaggregation'])

        for key in tuple_disaggregation:
            if len(key) == 3:
                level_reported_3_key = key
                break

        value = update_data['disaggregation'][str(level_reported_3_key)]
        del update_data['disaggregation'][str(level_reported_3_key)]
        update_data['disaggregation']['bad key'] = value

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "key is not in tuple format",
            response.data['non_field_errors'][0]
        )

    def test_update_invalid_coordinate_space_value_format_validation(self):
        indicator_location_data = self.partneractivity_reportable.indicator_reports.first().indicator_location_data.first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        level_reported_3_key = None
        tuple_disaggregation = get_cast_dictionary_keys_as_tuple(
            update_data['disaggregation'])

        for key in tuple_disaggregation:
            if len(key) == 3:
                level_reported_3_key = key
                break

        update_data['disaggregation'][str(level_reported_3_key)] = {}

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "coordinate space value does not "
            + "have correct value key structure: c, d, v",
            response.data['non_field_errors'][0]
        )


class TestReportRefreshAPIView(BaseAPITestCase):

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
        self.partner_user = factories.PartnerUserFactory(partner=self.partner)
        factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
        factories.IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, role=PRP_ROLE_TYPES.ip_authorized_officer)
        factories.IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, cluster=None, role=PRP_ROLE_TYPES.cluster_member)
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

        # Logging in as Partner AO
        self.client.force_authenticate(self.partner_user)

        self.progress_report = self.pd.progress_reports.first()

    def test_invalid_serializer_values(self):
        url = reverse('report-refresh-api')
        data = {"report_type": "PR", "report_id": -100}

        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_client_error(response.status_code))

        data['report_id'] = self.progress_report.id
        data['report_type'] = 'AAAA'
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_client_error(response.status_code))

        data['report_id'] = self.progress_report.indicator_reports.first().id
        data['report_type'] = 'IR'
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_client_error(response.status_code))
        self.assertEquals(
            "This indicator report is linked to a progress report. Use the progress report ID instead.",
            response.data['non_field_errors'][0]
        )

    def test_progress_report_reset(self):
        url = reverse('report-refresh-api')
        data = {"report_type": "PR", "report_id": self.progress_report.id}

        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['response'], "OK")

        # All indicator reports should be blank state
        for ir in self.progress_report.indicator_reports.all():
            self.assertEquals(ir.total['c'], 0)
            self.assertEquals(ir.overall_status, "NoS")
            self.assertEquals(ir.report_status, "Due")
            self.assertEquals(ir.submission_date, None)

    def test_cluster_indicator_report_reset(self):
        ir = self.partneractivity_reportable.indicator_reports.first()
        url = reverse('report-refresh-api')
        data = {"report_type": "IR", "report_id": ir.id}

        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['response'], "OK")

        ir = IndicatorReport.objects.get(id=ir.id)

        # All indicator report information should be initial state
        self.assertEquals(ir.submission_date, None)
        self.assertEquals(ir.overall_status, "NoS")
        self.assertEquals(ir.report_status, "Due")
        self.assertEquals(ir.total['c'], 0)

        for ild in ir.indicator_location_data.all():
            self.assertEquals(ild.disaggregation['()']['c'], 0)
            self.assertEquals(ild.disaggregation['()']['d'], 0)
            self.assertEquals(ild.disaggregation['()']['v'], 0)

    def test_refresh_future_reports(self):
        report = self.partneractivity_reportable.indicator_reports.first()
        progress_report = factories.ProgressReportIndicatorReportFactory(
            progress_report=report.progress_report,
            reportable=self.llo_reportable,
            due_date=report.due_date + datetime.timedelta(days=1),
        )
        self.assertTrue(IndicatorReport.objects.exclude(
            pk=report.pk).filter(
                progress_report=report.progress_report,
                due_date__gt=report.due_date,
            ).exists()
        )

        # test with no data
        response = self.client.post(
            reverse('report-refresh-api'),
            data={
                "report_type": "IR",
                "report_id": report.pk,
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # test with data
        factories.IndicatorLocationDataFactory(
            indicator_report=progress_report,
            disaggregation={"()": {"c": 10, "d": 10, "v": 10}},
            location=self.loc1,
        )
        response = self.client.post(
            reverse('report-refresh-api'),
            data={
                "report_type": "IR",
                "report_id": report.pk,
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TestClusterObjectiveIndicatorAdoptAPIViewAPIView(BaseAPITestCase):

    def setUp(self):

        self.workspace = factories.WorkspaceFactory()
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.cluster2 = factories.ClusterFactory(type='education', response_plan=self.response_plan)
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
        self.objective2 = factories.ClusterObjectiveFactory(
            cluster=self.cluster2,
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
        self.partner2 = factories.PartnerFactory(country_code=faker.country_code())
        self.user = factories.NonPartnerUserFactory()
        self.partner_user = factories.PartnerUserFactory(partner=self.partner)
        factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
        factories.IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, role=PRP_ROLE_TYPES.ip_authorized_officer)
        factories.IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, cluster=None, role=PRP_ROLE_TYPES.cluster_member)
        self.project = factories.PartnerProjectFactory(
            partner=self.partner,
            clusters=[self.cluster],
            locations=[self.loc1, self.loc2],
        )
        self.project2 = factories.PartnerProjectFactory(
            partner=self.partner2,
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

        self.clusterobjective_reportable = factories.QuantityReportableToClusterObjectiveFactory(
            content_object=self.objective, blueprint=blueprint
        )

        self.reportable_loc_1 = factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=self.clusterobjective_reportable,
        )

        self.reportable_loc_2 = factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=self.clusterobjective_reportable,
        )

        self.clusterobjective_reportable2 = factories.QuantityReportableToClusterObjectiveFactory(
            content_object=self.objective2, blueprint=blueprint
        )

        self.reportable_2_loc_1 = factories.LocationWithReportableLocationGoalFactory(
            location=self.loc1,
            reportable=self.clusterobjective_reportable2,
        )

        self.reportable_2_loc_2 = factories.LocationWithReportableLocationGoalFactory(
            location=self.loc2,
            reportable=self.clusterobjective_reportable2,
        )

        self.clusterobjective_reportable.disaggregations.clear()
        self.clusterobjective_reportable2.disaggregations.clear()
        self.partneractivity_reportable.disaggregations.clear()

        # Create the disaggregations and values in the db for all response plans
        # including one for no response plan as well
        for disagg_name, values in self.sample_disaggregation_value_map.items():
            cluster_disagg = factories.DisaggregationFactory(name=disagg_name, response_plan=self.response_plan)

            self.clusterobjective_reportable.disaggregations.add(cluster_disagg)
            self.clusterobjective_reportable2.disaggregations.add(cluster_disagg)
            self.partneractivity_reportable.disaggregations.add(cluster_disagg)

            for value in values:
                factories.DisaggregationValueFactory(
                    disaggregation=cluster_disagg,
                    value=value
                )

        super().setUp()

        # Logging in as Partner AO
        self.client.force_authenticate(self.partner_user)

    def test_invalid_serializer_values(self):
        url = reverse('partner-project-indicator-adopt')

        # Start with valid data payload
        data = {
            'partner_id': self.partner.id,
            'partner_project_id': self.project.id,
            'cluster_id': self.cluster.id,
            'cluster_objective_id': self.objective.id,
            'reportable_id': self.clusterobjective_reportable.id,
            'locations': [
                {
                    'id': self.reportable_loc_1.id,
                    'baseline': {'d': 1, 'v': 1, 'c': 1},
                    'in_need': {'d': 1, 'v': 1, 'c': 1},
                    'target': {'d': 1, 'v': 1, 'c': 1},
                    'location': self.loc1.id,
                },
                {
                    'id': self.reportable_loc_2.id,
                    'baseline': {'d': 1, 'v': 1, 'c': 1},
                    'in_need': {'d': 1, 'v': 1, 'c': 1},
                    'target': {'d': 1, 'v': 1, 'c': 1},
                    'location': self.loc2.id,
                }
            ],
            'target': {'d': 1, 'v': 1, 'c': 1},
            'baseline': {'d': 1, 'v': 1, 'c': 1},
        }

        # Target value type check
        data['target'] = list()
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_client_error(response.status_code))

        # Baseline value type check
        data['target'] = {'d': 1, 'v': 1, 'c': 1}
        data['baseline'] = list()
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_client_error(response.status_code))

        # zero d value in target
        data['baseline'] = {'d': 1, 'v': 1, 'c': 1}
        data['target'] = {'d': 0, 'v': 1, 'c': 1}
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_client_error(response.status_code))

        # missing v value in target
        data['target'] = {'d': 1, 'c': 1}
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_client_error(response.status_code))

        # zero d value in baseline
        data['target'] = {'d': 1, 'v': 1, 'c': 1}
        data['baseline'] = {'d': 0, 'v': 1, 'c': 1}
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_client_error(response.status_code))

        # missing v value in baseline
        data['baseline'] = {'d': 1, 'c': 1}
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_client_error(response.status_code))

        # Reset
        data['target'] = {'d': 1, 'v': 1, 'c': 1}
        data['baseline'] = {'d': 1, 'v': 1, 'c': 1}

        # Non-exist partner check
        data['partner_id'] = 999999
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_client_error(response.status_code))

        # Non-exist partner project check
        data['partner_id'] = self.partner.id
        data['partner_project_id'] = 999999
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_client_error(response.status_code))

        # Invalid partner project membership check
        data['partner_id'] = self.partner.id
        data['partner_project_id'] = self.project2.id
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_client_error(response.status_code))

        # Non-exist cluster check
        data['partner_project_id'] = self.project.id
        data['cluster_id'] = 999999
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_client_error(response.status_code))

        # Non-exist cluster objective check
        data['cluster_id'] = self.cluster.id
        data['cluster_objective_id'] = 999999
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_client_error(response.status_code))

        # Invalid cluster objective membership check
        data['cluster_id'] = self.cluster.id
        data['cluster_objective_id'] = self.objective2.id
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_client_error(response.status_code))

        # Non-exist reportable_id check
        data['cluster_objective_id'] = self.objective.id
        data['reportable_id'] = 9999999
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_client_error(response.status_code))

        # Invalid reportable type check
        data['reportable_id'] = self.partneractivity_reportable.id
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_client_error(response.status_code))

        # Invalid reportable membership check
        data['reportable_id'] = self.clusterobjective_reportable2.id
        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_client_error(response.status_code))

    def test_valid_serializer_values(self):
        url = reverse('partner-project-indicator-adopt')

        # Start with valid data payload
        data = {
            'partner_id': self.partner.id,
            'partner_project_id': self.project.id,
            'cluster_id': self.cluster.id,
            'cluster_objective_id': self.objective.id,
            'reportable_id': self.clusterobjective_reportable.id,
            'locations': [
                {
                    'id': self.reportable_loc_1.id,
                    'baseline': {'d': 1, 'v': 1, 'c': 1},
                    'in_need': {'d': 1, 'v': 1, 'c': 1},
                    'target': {'d': 1, 'v': 1, 'c': 1},
                    'location': self.loc1.id,
                },
                {
                    'id': self.reportable_loc_2.id,
                    'baseline': {'d': 1, 'v': 1, 'c': 1},
                    'in_need': {'d': 1, 'v': 1, 'c': 1},
                    'target': {'d': 1, 'v': 1, 'c': 1},
                    'location': self.loc2.id,
                }
            ],
            'target': {'d': 1, 'v': 1, 'c': 1},
            'baseline': {'d': 1, 'v': 1, 'c': 1},
        }

        response = self.client.post(url, data=data, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertTrue(Reportable.objects.filter(id=response.data['id']).exists())
