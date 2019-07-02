import datetime
import tempfile
import os
from unittest.mock import Mock, patch

from django.conf import settings
from django.core.files import File
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db.models import Q
from django.urls import reverse
from rest_framework import status

from core.common import (INDICATOR_REPORT_STATUS, OVERALL_STATUS,
                         PROGRESS_REPORT_STATUS, PRP_ROLE_TYPES, PR_ATTACHMENT_TYPES)
from core.factories import (CartoDBTableFactory, ClusterActivityFactory,
                            ClusterActivityPartnerActivityFactory,
                            ClusterFactory, ClusterIndicatorReportFactory,
                            ClusterObjectiveFactory, ClusterPRPRoleFactory,
                            CountryFactory, DisaggregationFactory,
                            DisaggregationValueFactory, GatewayTypeFactory,
                            HRReportingPeriodDatesFactory,
                            IPDisaggregationFactory, IPPRPRoleFactory,
                            LocationFactory,
                            LocationWithReportableLocationGoalFactory,
                            LowerLevelOutputFactory, NonPartnerUserFactory,
                            PartnerFactory, PartnerProjectFactory,
                            PartnerActivityProjectContextFactory,
                            PartnerUserFactory, PDResultLinkFactory,
                            PersonFactory, ProgrammeDocumentFactory,
                            ProgressReportAttachmentFactory,
                            ProgressReportFactory,
                            ProgressReportIndicatorReportFactory,
                            QPRReportingPeriodDatesFactory,
                            QuantityReportableToLowerLevelOutputFactory,
                            QuantityReportableToPartnerActivityFactory,
                            QuantityTypeIndicatorBlueprintFactory,
                            ResponsePlanFactory, SectionFactory,
                            WorkspaceFactory, faker)
from core.management.commands._generate_disaggregation_fake_data import \
    generate_3_num_disagg_data
from core.models import Location
from core.tests.base import BaseAPITestCase
from indicator.disaggregators import QuantityIndicatorDisaggregator
from indicator.models import (IndicatorBlueprint, IndicatorLocationData,
                              IndicatorReport)
from unicef.models import ProgressReport, ProgressReportAttachment


class TestProgrammeDocumentListAPIView(BaseAPITestCase):

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
            partner=self.partner,
            cluster_activity=self.activity,
        )
        self.project_context = PartnerActivityProjectContextFactory(
            project=self.project,
            activity=self.p_activity,
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
            pr = ProgressReportFactory(
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

            ProgressReportAttachmentFactory(
                progress_report=pr,
                type=PR_ATTACHMENT_TYPES.face,
            )

        for idx in range(6):
            hr_period = HRReportingPeriodDatesFactory(programme_document=self.pd)
            pr = ProgressReportFactory(
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

            ProgressReportAttachmentFactory(
                progress_report=pr,
                type=PR_ATTACHMENT_TYPES.face,
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
            with patch("django.db.models.signals.ModelSignal.send", Mock()):
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

        # Logging in as Partner AO
        self.client.force_authenticate(self.partner_user)

    def tearDown(self):
        for attachment in ProgressReportAttachment.objects.all():
            attachment.file.delete()
            attachment.delete()

    def test_list_api(self):
        url = reverse(
            'programme-document',
            kwargs={'workspace_id': self.workspace.id})
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(len(response.data['results']), 1)

    def test_list_filter_api(self):
        url = reverse(
            'programme-document',
            kwargs={'workspace_id': self.workspace.id})
        response = self.client.get(
            url + "?ref_title=&status=&location=",
            format='json'
        )
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(len(response.data['results']), 1)

        document = response.data['results'][0]
        response = self.client.get(
            url + "?ref_title=%s&status=&location=" % document['title'][8:],
            format='json'
        )
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(len(response.data['results']), 1)
        self.assertEquals(
            response.data['results'][0]['title'],
            document['title'])

        response = self.client.get(
            url + "?ref_title=&status=%s&location=" % document['status'][:3],
            format='json'
        )
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(
            response.data['results'][0]['status'],
            document['status'])
        self.assertEquals(
            response.data['results'][0]['title'],
            document['title'])
        self.assertEquals(
            response.data['results'][0]['reference_number'],
            document['reference_number'])

        # location filtering
        loc = Location.objects.filter(parent__isnull=True).first()
        response = self.client.get(
            url + "?ref_title=&status=&location=%s" % loc.id,
            format='json'
        )

        self.assertTrue(status.is_success(response.status_code))
        for result in response.data['results']:
            self.assertEquals(result['title'], document['title'])


class TestProgrammeDocumentDetailAPIView(BaseAPITestCase):

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
            partner=self.partner,
            cluster_activity=self.activity,
        )
        self.project_context = PartnerActivityProjectContextFactory(
            project=self.project,
            activity=self.p_activity,
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
            pr = ProgressReportFactory(
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

            ProgressReportAttachmentFactory(
                progress_report=pr,
                type=PR_ATTACHMENT_TYPES.face,
            )

        for idx in range(6):
            hr_period = HRReportingPeriodDatesFactory(programme_document=self.pd)
            pr = ProgressReportFactory(
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

            ProgressReportAttachmentFactory(
                progress_report=pr,
                type=PR_ATTACHMENT_TYPES.face,
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
            with patch("django.db.models.signals.ModelSignal.send", Mock()):
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

        # Logging in as Partner AO
        self.client.force_authenticate(self.partner_user)

    def tearDown(self):
        for attachment in ProgressReportAttachment.objects.all():
            attachment.file.delete()
            attachment.delete()

    def test_detail_api(self):
        url = reverse(
            'programme-document-details',
            kwargs={'pd_id': self.pd.id, 'workspace_id': self.workspace.id})
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(self.pd.agreement, response.data['agreement'])
        self.assertEquals(
            self.pd.reference_number,
            response.data['reference_number'])


class TestProgressReportAPIView(BaseAPITestCase):

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
            partner=self.partner,
            cluster_activity=self.activity,
        )
        self.project_context = PartnerActivityProjectContextFactory(
            project=self.project,
            activity=self.p_activity,
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
            pr = ProgressReportFactory(
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

            ProgressReportAttachmentFactory(
                progress_report=pr,
                type=PR_ATTACHMENT_TYPES.face,
            )

        for idx in range(6):
            hr_period = HRReportingPeriodDatesFactory(programme_document=self.pd)
            pr = ProgressReportFactory(
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

            ProgressReportAttachmentFactory(
                progress_report=pr,
                type=PR_ATTACHMENT_TYPES.face,
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
            with patch("django.db.models.signals.ModelSignal.send", Mock()):
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

        # Logging in as Partner AO
        self.client.force_authenticate(self.partner_user)

        self.location_id = self.loc1.id
        self.queryset = self.get_queryset()

    def tearDown(self):
        for attachment in ProgressReportAttachment.objects.all():
            attachment.file.delete()
            attachment.delete()

    def get_queryset(self):
        pd_ids = Location.objects.filter(
            Q(id=self.location_id) |
            Q(parent_id=self.location_id) |
            Q(parent__parent_id=self.location_id) |
            Q(parent__parent__parent_id=self.location_id) |
            Q(parent__parent__parent__parent_id=self.location_id)
        ).values_list(
            'reportables__lower_level_outputs__cp_output__programme_document__id',
            flat=True
        )
        return ProgressReport.objects.filter(programme_document_id__in=pd_ids)

    def test_list_api(self):
        url = reverse(
            'progress-reports',
            kwargs={'workspace_id': self.workspace.id})
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), self.queryset.count())

    def test_list_api_filter_by_status(self):
        self.reports = self.queryset.filter(
            status=PROGRESS_REPORT_STATUS.due
        )

        url = reverse(
            'progress-reports',
            kwargs={'workspace_id': self.workspace.id})
        url += '?status=' + PROGRESS_REPORT_STATUS.due
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), len(self.reports))

    def test_list_api_filter_by_due_status(self):
        self.reports = self.queryset.filter(
            status__in=[
                PROGRESS_REPORT_STATUS.due,
                PROGRESS_REPORT_STATUS.overdue]
        )

        url = reverse(
            'progress-reports',
            kwargs={'workspace_id': self.workspace.id})
        url += '?due=1'
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), len(self.reports))

    def test_list_api_filter_by_pd_title(self):
        filter_string = 'reference'
        self.reports = self.queryset.filter(
            Q(programme_document__reference_number__icontains=filter_string) |
            Q(programme_document__title__icontains=filter_string)
        )

        url = reverse(
            'progress-reports',
            kwargs={'workspace_id': self.workspace.id})
        url += '?pd_ref_title=' + filter_string
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), len(self.reports))

    def test_list_api_filter_by_due_date(self):
        today = datetime.datetime.today()
        date_format = settings.PRINT_DATA_FORMAT
        pr_ids = ProgressReport.objects.all().values_list('id', flat=True)

        ir_ids = IndicatorReport.objects \
            .filter(progress_report_id__in=pr_ids) \
            .filter(due_date=today) \
            .values_list('progress_report_id') \
            .distinct()
        pr_queryset = self.queryset.filter(id__in=ir_ids)

        url = reverse(
            'progress-reports',
            kwargs={'workspace_id': self.workspace.id})
        url += '?due_date=' + today.strftime(date_format)
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), len(pr_queryset))


class TestProgressReportAttachmentListCreateAPIView(BaseAPITestCase):

    def setUp(self):
        self.country = CountryFactory()
        self.workspace = WorkspaceFactory(countries=[self.country, ])
        self.loc_type = GatewayTypeFactory(country=self.country)
        self.carto_table = CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        self.loc1 = LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.unicef_officer = PersonFactory()
        self.unicef_focal_point = PersonFactory()
        self.partner_focal_point = PersonFactory()
        self.partner = PartnerFactory(country_code=self.country.country_short_code)
        self.partner_user = PartnerUserFactory(partner=self.partner)
        IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, role=PRP_ROLE_TYPES.ip_authorized_officer)
        self.sample_disaggregation_value_map = {
            "height": ["tall", "medium", "short", "extrashort"],
            "age": ["1-2m", "3-4m", "5-6m", '7-10m', '11-13m', '14-16m'],
            "gender": ["male", "female", "other"],
        }

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
            pr = ProgressReportFactory(
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

            ProgressReportAttachmentFactory(
                progress_report=pr,
                type=PR_ATTACHMENT_TYPES.face,
            )

        for idx in range(6):
            hr_period = HRReportingPeriodDatesFactory(programme_document=self.pd)
            pr = ProgressReportFactory(
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

            ProgressReportAttachmentFactory(
                progress_report=pr,
                type=PR_ATTACHMENT_TYPES.face,
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

        for disagg_name, values in self.sample_disaggregation_value_map.items():
            disagg = IPDisaggregationFactory(name=disagg_name)

            self.llo_reportable.disaggregations.add(disagg)

            for value in values:
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

        # Logging in as Partner AO
        self.client.force_authenticate(self.partner_user)

        self.location_id = self.loc1.id
        self.pr = self.pd.progress_reports.first()

        settings.MEDIA_ROOT = tempfile.mkdtemp()

    def tearDown(self):
        for attachment in ProgressReportAttachment.objects.all():
            attachment.file.delete()
            attachment.delete()

    def test_list_api(self):
        url = reverse(
            'progress-reports-attachment-list',
            kwargs={'workspace_id': self.workspace.id, 'progress_report_id': self.pr.id})
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data), self.pr.attachments.count())

    def test_create_api(self):
        url = reverse(
            'progress-reports-attachment-list',
            kwargs={'workspace_id': self.workspace.id, 'progress_report_id': self.pr.id})

        f = open('test.txt', 'w')
        f.write(faker.text())
        f.close()

        file = File(open('test.txt', 'rb'))
        upload_file = SimpleUploadedFile('test', file.read(), content_type="multipart/form-data")

        data = {'type': 'Other', 'path': upload_file}
        response = self.client.post(url, data, format="multipart")

        self.assertEquals(response.status_code, status.HTTP_201_CREATED)
        self.assertEquals(response.data['size'], data['path'].size)

        os.remove('test.txt')


class TestProgressReportAttachmentAPIView(BaseAPITestCase):

    def setUp(self):
        self.country = CountryFactory()
        self.workspace = WorkspaceFactory(countries=[self.country, ])
        self.loc_type = GatewayTypeFactory(country=self.country)
        self.carto_table = CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        self.loc1 = LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.unicef_officer = PersonFactory()
        self.unicef_focal_point = PersonFactory()
        self.partner_focal_point = PersonFactory()
        self.partner = PartnerFactory(country_code=self.country.country_short_code)
        self.partner_user = PartnerUserFactory(partner=self.partner)
        IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, role=PRP_ROLE_TYPES.ip_authorized_officer)
        self.sample_disaggregation_value_map = {
            "height": ["tall", "medium", "short", "extrashort"],
            "age": ["1-2m", "3-4m", "5-6m", '7-10m', '11-13m', '14-16m'],
            "gender": ["male", "female", "other"],
        }

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
            pr = ProgressReportFactory(
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

            ProgressReportAttachmentFactory(
                progress_report=pr,
                type=PR_ATTACHMENT_TYPES.face,
            )

        for idx in range(6):
            hr_period = HRReportingPeriodDatesFactory(programme_document=self.pd)
            pr = ProgressReportFactory(
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

            ProgressReportAttachmentFactory(
                progress_report=pr,
                type=PR_ATTACHMENT_TYPES.face,
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

        for disagg_name, values in self.sample_disaggregation_value_map.items():
            disagg = IPDisaggregationFactory(name=disagg_name)

            self.llo_reportable.disaggregations.add(disagg)

            for value in values:
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

        # Logging in as Partner AO
        self.client.force_authenticate(self.partner_user)

        self.location_id = self.loc1.id
        self.pr = self.pd.progress_reports.first()
        self.attachment = self.pr.attachments.first()

        settings.MEDIA_ROOT = tempfile.mkdtemp()

    def tearDown(self):
        for attachment in ProgressReportAttachment.objects.all():
            attachment.file.delete()
            attachment.delete()

    def test_detail_api(self):
        url = reverse(
            'progress-reports-attachment',
            kwargs={'workspace_id': self.workspace.id, 'progress_report_id': self.pr.id, 'pk': self.attachment.id})
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(response.data['id'], self.attachment.id)

    def test_update_api(self):
        f = open('test.txt', 'w')
        f.write(faker.text() + faker.text() + faker.text())
        f.close()

        file = File(open('test.txt', 'rb'))
        upload_file = SimpleUploadedFile('test', file.read(), content_type="multipart/form-data")

        data = {'type': 'Other', 'path': upload_file}
        url = reverse(
            'progress-reports-attachment',
            kwargs={'workspace_id': self.workspace.id, 'progress_report_id': self.pr.id, 'pk': self.attachment.id})
        response = self.client.put(url, data, format="multipart")

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(response.data['size'], data['path'].size)

        os.remove('test.txt')

    def test_delete_api(self):
        url = reverse(
            'progress-reports-attachment',
            kwargs={'workspace_id': self.workspace.id, 'progress_report_id': self.pr.id, 'pk': self.attachment.id})
        response = self.client.delete(url, format='multipart')

        self.assertEquals(response.status_code, status.HTTP_204_NO_CONTENT)
