import datetime
from unittest.mock import Mock, patch

from django.conf import settings
from django.urls import reverse

from cluster.serializers import ClusterSimpleSerializer
from core.common import INDICATOR_REPORT_STATUS, OVERALL_STATUS, PRP_ROLE_TYPES
from core.management.commands._generate_disaggregation_fake_data import generate_3_num_disagg_data
from core.models import Location
from core.tests import factories
from core.tests.base import BaseAPITestCase
from indicator.disaggregators import QuantityIndicatorDisaggregator
from indicator.models import IndicatorBlueprint, IndicatorLocationData
from partner.models import PARTNER_PROJECT_STATUS, PartnerActivity, PartnerProject
from rest_framework import status

today = datetime.date.today()
beginning_of_this_year = datetime.date(today.year, 1, 1)
end_of_this_year = datetime.date(today.year, 12, 31)


class TestPartnerProjectListCreateAPIView(BaseAPITestCase):
    def setUp(self):
        self.country = factories.CountryFactory()
        self.workspace = factories.WorkspaceFactory(countries=[self.country, ])
        self.response_plan = factories.ResponsePlanFactory(
            workspace=self.workspace,
            start=beginning_of_this_year,
            end=end_of_this_year,
        )
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.loc_type = factories.GatewayTypeFactory(country=self.country)
        self.carto_table = factories.CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        self.loc1 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
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
        self.partner = factories.PartnerFactory(country_code=self.country.country_short_code)
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

        self.data = {
            'clusters': [{"id": self.cluster.id}],
            'locations': [{"id": self.loc1.id}, {"id": self.loc2.id}],
            'title': 'partner project title',
            'partner_id': self.partner.id,
            'start_date': datetime.date.today().strftime(settings.INPUT_DATA_FORMAT),
            'end_date': datetime.date.today().strftime(settings.INPUT_DATA_FORMAT),
            'status': 'Ong',
            'description': "description",
            'additional_information': "additional_information",
            'total_budget': 100000,
            'funding_source': "UNICEF",
        }

    def test_list_partner_project(self):
        """
        get list unit test for PartnerProjectListCreateAPIView
        """
        url = reverse(
            'partner-project-list',
            kwargs={
                'response_plan_id': self.cluster.response_plan_id})
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['count'], PartnerProject.objects.filter(
            clusters__response_plan_id=self.cluster.response_plan_id).count())

    def test_list_partner_project_by_cluster(self):
        """
        get list by given cluster id unit test for PartnerProjectListCreateAPIView
        """
        cluster_id = self.cluster.id
        url = reverse(
            'partner-project-list',
            kwargs={
                'response_plan_id': self.cluster.response_plan_id}) + "?cluster_id=" + str(cluster_id)
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(
            response.data['count'],
            PartnerProject.objects.filter(
                clusters__in=[cluster_id]).count())

    def test_create_partner_project(self):
        """
        create unit test for ClusterObjectiveAPIView
        """
        base_count = PartnerProject.objects.all().count()

        # test for creating object
        url = reverse(
            'partner-project-list',
            kwargs={
                'response_plan_id': self.cluster.response_plan_id})
        response = self.client.post(url, data=self.data, format='json')

        self.assertTrue(status.is_success(response.status_code))
        created_obj = PartnerProject.objects.get(id=response.data['id'])
        self.assertEquals(created_obj.title, self.data['title'])
        self.assertEquals(PartnerProject.objects.all().count(), base_count + 1)

    def test_create_partner_project_no_status(self):
        self.data.pop("status")
        url = reverse(
            'partner-project-list',
            kwargs={
                'response_plan_id': self.cluster.response_plan_id})
        response = self.client.post(url, data=self.data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEquals(
            response.data,
            {
                "status": ["This field is required."],
                "error_codes": {"status": ["required"]},
            },
        )

    def test_create_partner_project_duplicate_locations(self):
        """
        create unit test for ClusterObjectiveAPIView
        """
        self.data["locations"] = [{"id": self.loc1.pk}, {"id": self.loc1.pk}]

        url = reverse(
            'partner-project-list',
            kwargs={
                'response_plan_id': self.cluster.response_plan_id})
        response = self.client.post(url, data=self.data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEquals(
            response.data,
            {
                "locations": ["Duplicate locations are not allowed"],
                "error_codes": {"locations": ["invalid"]},
            },
        )

    def test_create_partner_project_without_total_budget(self):
        base_count = PartnerProject.objects.all().count()

        self.data.pop("total_budget")
        url = reverse(
            'partner-project-list',
            kwargs={'response_plan_id': self.cluster.response_plan_id},
        )
        response = self.client.post(url, data=self.data, format='json')
        self.assertTrue(status.is_success(response.status_code))
        created_obj = PartnerProject.objects.get(id=response.data['id'])
        self.assertEquals(created_obj.title, self.data['title'])
        self.assertEquals(PartnerProject.objects.all().count(), base_count + 1)
        self.assertIsNone(created_obj.total_budget)

    def test_create_partner_project_empty_funding(self):
        base_count = PartnerProject.objects.all().count()

        self.data["funding"] = {
            "bilateral_funding": "",
            "cbpf_funding": "",
            "cerf_funding": "",
            "funding_gap": "",
            "internal_funding": "",
            "required_funding": "",
            "unicef_funding": "",
            "wfp_funding": "",
        }
        url = reverse(
            'partner-project-list',
            kwargs={'response_plan_id': self.cluster.response_plan_id},
        )
        response = self.client.post(url, data=self.data, format='json')
        self.assertTrue(status.is_success(response.status_code))
        created_obj = PartnerProject.objects.get(id=response.data['id'])
        self.assertEquals(created_obj.title, self.data['title'])
        self.assertEquals(PartnerProject.objects.all().count(), base_count + 1)

    def test_list_filters_partner_project(self):
        """
        get list unit test for PartnerProjectListCreateAPIView
        """
        pp = self.cluster.partner_projects.first()
        location = Location.objects.first()
        pp.locations.add(location)
        url = reverse('partner-project-list', kwargs={'response_plan_id': self.cluster.response_plan_id})
        url += "?location=%d" % location.id
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['count'], 1)
        self.assertEquals(response.data['results'][0]['id'], str(pp.id))
        self.assertEquals(response.data['results'][0]['title'], pp.title)
        self.assertEquals(
            response.data['results'][0]['locations'][0]['id'],
            str(location.id)
        )

        url = reverse('partner-project-list', kwargs={'response_plan_id': self.cluster.response_plan_id})
        url += "?partner=%d" % self.partner.id
        response = self.client.get(url, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['count'], 1)
        self.assertEquals(response.data['results'][0]['partner'], self.partner.title)


class TestPartnerProjectAPIView(BaseAPITestCase):
    def setUp(self):
        self.country = factories.CountryFactory()
        self.workspace = factories.WorkspaceFactory(countries=[self.country, ])
        self.response_plan = factories.ResponsePlanFactory(workspace=self.workspace)
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.loc_type = factories.GatewayTypeFactory(country=self.country)
        self.carto_table = factories.CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        self.loc1 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
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
        self.partner = factories.PartnerFactory(country_code=self.country.country_short_code)
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

    def test_get_instance(self):
        first = PartnerProject.objects.first()
        url = reverse('partner-project-details', kwargs={"pk": first.id})
        response = self.client.get(url, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['id'], str(first.id))
        self.assertEquals(response.data['title'], first.title)

    def test_get_non_existent_instance(self):
        url = reverse('partner-project-details', kwargs={"pk": 9999999})
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_partner_project(self):
        """
        patch object unit test for PartnerProjectAPIView
        """
        base_count = PartnerProject.objects.all().count()
        last = PartnerProject.objects.last()

        data = dict(id=last.id, title='new updated title')
        url = reverse('partner-project-details', kwargs={"pk": last.id})
        response = self.client.patch(url, data=data, format='json')
        self.assertEquals(response.status_code, status.HTTP_200_OK, msg=response.content)
        self.assertEquals(PartnerProject.objects.all().count(), base_count)
        self.assertEquals(
            PartnerProject.objects.get(id=response.data['id']).title,
            data['title']
        )

    def test_update_patch_non_existent_partner_project(self):
        """
        patch object unit test for PartnerProjectAPIView
        """
        data = dict(id=9999999, title='new updated title')
        url = reverse('partner-project-details', kwargs={"pk": 9999999})
        response = self.client.patch(url, data=data, format='json')

        self.assertEquals(response.status_code, status.HTTP_404_NOT_FOUND)


class TestPartnerActivityAPIView(BaseAPITestCase):
    def setUp(self):
        self.country = factories.CountryFactory()
        self.workspace = factories.WorkspaceFactory(countries=[self.country, ])
        self.response_plan = factories.ResponsePlanFactory(
            workspace=self.workspace,
            start=beginning_of_this_year,
            end=end_of_this_year,
        )
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.loc_type = factories.GatewayTypeFactory(country=self.country)
        self.carto_table = factories.CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        self.loc1 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
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
        self.partner = factories.PartnerFactory(country_code=self.country.country_short_code, clusters=[self.cluster, ])
        self.user = factories.NonPartnerUserFactory()
        self.partner_user = factories.PartnerUserFactory(partner=self.partner)
        factories.ClusterPRPRoleFactory(user=self.user, workspace=self.workspace, cluster=self.cluster, role=PRP_ROLE_TYPES.cluster_imo)
        factories.IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, role=PRP_ROLE_TYPES.ip_authorized_officer)
        factories.IPPRPRoleFactory(user=self.partner_user, workspace=self.workspace, cluster=None, role=PRP_ROLE_TYPES.cluster_member)
        self.project = factories.PartnerProjectFactory(
            partner=self.partner,
            clusters=[self.cluster],
            locations=[self.loc1, self.loc2],
            start_date=datetime.date(today.year, 3, 1),
            end_date=datetime.date(today.year, 10, 25),
        )

        super().setUp()

        self.data = {
            "cluster": self.cluster.id,
            "partner": self.partner.id,
            "projects": [
                {
                    "project_id": self.project.id,
                    "start_date": self.project.start_date.strftime(settings.PRINT_DATA_FORMAT),
                    "end_date": self.project.end_date.strftime(settings.PRINT_DATA_FORMAT),
                    "status": "Ong"
                }
            ],
        }

    def test_create_activity_from_cluster_activity(self):
        base_count = PartnerActivity.objects.all().count()
        self.data['cluster_activity'] = self.activity.id

        # test for creating object
        url = reverse(
            'partner-activity-create',
            kwargs={
                'response_plan_id': self.cluster.response_plan_id,
                'create_mode': 'cluster',
            }
        )

        response = self.client.post(url, data=self.data, format='json')

        self.assertTrue(status.is_success(response.status_code), msg=response.content)
        created_obj = PartnerActivity.objects.get(id=response.data['id'])
        self.assertEquals(created_obj.title, self.activity.title)
        self.assertEquals(PartnerActivity.objects.all().count(), base_count + 1)

    def test_create_activity_from_custom_activity(self):
        base_count = PartnerActivity.objects.all().count()

        self.data['cluster_objective'] = self.objective.id

        self.data['title'] = 'TEST'

        # test for creating object
        url = reverse(
            'partner-activity-create',
            kwargs={
                'response_plan_id': self.cluster.response_plan_id,
                'create_mode': 'custom',
            }
        )

        response = self.client.post(url, data=self.data, format='json')

        self.assertTrue(status.is_success(response.status_code), msg=response.content)
        created_obj = PartnerActivity.objects.get(id=response.data['id'])
        self.assertEquals(created_obj.title, self.data['title'])
        self.assertEquals(
            PartnerActivity.objects.all().count(),
            base_count + 1
        )


class TestCustomPartnerProjectAPIView(BaseAPITestCase):
    def setUp(self):
        self.country = factories.CountryFactory()
        self.workspace = factories.WorkspaceFactory(countries=[self.country, ])
        self.response_plan = factories.ResponsePlanFactory(
            workspace=self.workspace,
            start=beginning_of_this_year,
            end=end_of_this_year,
        )
        self.cluster = factories.ClusterFactory(type='cccm', response_plan=self.response_plan)
        self.loc_type = factories.GatewayTypeFactory(country=self.country)
        self.carto_table = factories.CartoDBTableFactory(location_type=self.loc_type, country=self.country)
        self.loc1 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
        self.loc2 = factories.LocationFactory(gateway=self.loc_type, carto_db_table=self.carto_table)
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
        self.partner = factories.PartnerFactory(country_code=self.country.country_short_code, clusters=[self.cluster, ])
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

    def test_create_project(self):
        project_data = {
            'title': 'Test Partner Project',
            'start_date': str(beginning_of_this_year),
            'end_date': str(end_of_this_year),
            'partner_id': self.response_plan.clusters.first().partners.first().id,
            'status': PARTNER_PROJECT_STATUS.ongoing,
        }

        url = reverse("partner-project-list", kwargs={'response_plan_id': self.response_plan.pk})
        response = self.client.post(url, data=project_data, format='json')
        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST, msg=response.content)
        self.assertIn('clusters', response.data)

        project_data['clusters'] = ClusterSimpleSerializer(self.response_plan.clusters.all(), many=True).data
        response = self.client.post(url, data=project_data, format='json')
        self.assertEquals(response.status_code, status.HTTP_201_CREATED, msg=response.content)

    def test_end_lt_start(self):
        project_data = {
            'title': 'Test Partner Project',
            'start_date': '2018-01-01',
            'end_date': '2013-01-01',
            'partner_id': self.response_plan.clusters.first().partners.first().id,
            'clusters': ClusterSimpleSerializer(self.response_plan.clusters.all(), many=True).data,
            'status': PARTNER_PROJECT_STATUS.ongoing,
        }

        url = reverse("partner-project-list", kwargs={'response_plan_id': self.response_plan.pk})
        response = self.client.post(url, data=project_data, format='json')
        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST, msg=response.content)
        self.assertIn('end_date', response.data)

    def test_create_project_with_custom_fields(self):
        project_data = {
            'title': 'Test Partner Project',
            'start_date': str(beginning_of_this_year),
            'end_date': str(end_of_this_year),
            'partner_id': self.response_plan.clusters.first().partners.first().id,
            'status': PARTNER_PROJECT_STATUS.ongoing,
            'custom_fields': [{
                'name': 'Test Field 1',
                'value': '1',
            }, {
                'name': 'Test Field 2',
                'value': '2',
            }],
            'clusters': ClusterSimpleSerializer(self.response_plan.clusters.all(), many=True).data
        }

        url = reverse("partner-project-list", kwargs={'response_plan_id': self.response_plan.pk})
        response = self.client.post(url, data=project_data, format='json')
        self.assertEquals(response.status_code, status.HTTP_201_CREATED, msg=response.content)
        self.assertEquals(len(response.data['custom_fields']), 2)
