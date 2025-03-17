from unittest import mock

from rest_framework.exceptions import ValidationError

from etools_prp.apps.core.common import INDICATOR_REPORT_STATUS, OVERALL_STATUS
from etools_prp.apps.core.helpers import generate_data_combination_entries
from etools_prp.apps.core.models import Location
from etools_prp.apps.core.serializers import PMPLocationSerializer
from etools_prp.apps.core.tests import factories
from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.indicator.models import IndicatorBlueprint, IndicatorLocationData, IndicatorReport, Reportable
from etools_prp.apps.indicator.serializers import PMPIndicatorBlueprintSerializer, PMPReportableSerializer
from etools_prp.apps.partner.models import Partner
from etools_prp.apps.partner.serializers import PMPPartnerSerializer
from etools_prp.apps.unicef.models import Person, ProgrammeDocument, Section
from etools_prp.apps.unicef.serializers import (
    PMPPDPersonSerializer,
    PMPProgrammeDocumentSerializer,
    PMPSectionSerializer,
)
from etools_prp.apps.unicef.tasks import handle_reporting_dates, process_model


class TestProcessModel(BaseAPITestCase):
    def test_partner(self):
        filter_dict = {'vendor_number': '2500241256'}
        partner_qs = Partner.objects.filter(**filter_dict)
        data = {
            'address': 'BROADLANDS ROAD',
            'alternate_name': None,
            'basis_for_risk_rating': '',
            'city': 'HARARE',
            'core_values_assessment_date': '2017-08-08',
            'country': '626',
            'cso_type': 'International',
            'email': 'someone@example.com',
            'external_id': 379,
            'id': 379,
            'last_assessment_date': '2019-12-16',
            'name': 'CAFOD',
            'partner_type': 'Civil Society Organization',
            'phone_number': '263 773637079',
            'postal_code': '',
            'rating': 'High',
            'short_name': 'CAFOD',
            'street_address': None,
            'total_ct_cp': '108855.00',
            'total_ct_cy': '108855.00',
            'type_of_assessment': 'High Risk Assumed',
            'unicef_vendor_number': '2500241256',
        }
        self.assertFalse(partner_qs.exists())
        process_model(
            Partner,
            PMPPartnerSerializer,
            data=data,
            filter_dict=filter_dict,
        )
        self.assertTrue(partner_qs.exists())

    def test_person_and_user(self):
        email = "wrongone@example.com"
        filter_dict = {'email': email}
        person_qs = Person.objects.filter(**filter_dict)
        data = {
            "name": "New",
            "email": email,
        }
        self.assertFalse(person_qs.exists())
        process_model(
            Person,
            PMPPDPersonSerializer,
            data=data,
            filter_dict=filter_dict,
        )
        self.assertTrue(person_qs.exists())

    def test_person_and_user_invalid_email(self):
        email = "WrongOne@example.com"
        filter_dict = {'email': email}
        person_qs = Person.objects.filter(**filter_dict)
        data = {
            "name": "New",
            "email": email,
        }
        self.assertFalse(person_qs.exists())
        self.assertRaises(
            ValidationError,
            process_model,
            Person,
            PMPPDPersonSerializer,
            data=data,
            filter_dict=filter_dict,
        )
        self.assertFalse(person_qs.exists())

    def test_programme_document(self):
        workspace = factories.WorkspaceFactory()
        partner = factories.PartnerFactory()
        data = {
            "id": 101,
            'status': 'active',
            'agreement': 'BGD/PCA20182',
            'title': 'Executive Director',
            'offices': "Cox's Bazar",
            'number': 'BGD/PCA20182/PD2018101-1',
            'partner': partner.pk,
            'cso_budget': '6403972.00',
            'cso_budget_currency': 'BDT',
            'unicef_budget': '70634975.00',
            'unicef_budget_currency': 'BDT',
            'unicef_budget_cash':
            '60143475.00',
            'unicef_budget_supplies': '10491500.00',
            'workspace': workspace.pk,
            'external_business_area_code': workspace.business_area_code,
            'start_date': '2018-05-07',
            'end_date': '2020-12-31',
            'amendments': [
                {
                    'types': ['budget_gt_20'],
                    'other_description': None,
                    'signed_date': '24-Jul-2019',
                    'amendment_number': '1',
                },
                {
                    'types': ['budget_gt_20'],
                    'other_description': None,
                    'signed_date': None,
                    'amendment_number': '2',
                }
            ]
        }
        filter_dict = {
            'external_id': data['id'],
            'workspace': workspace,
            'external_business_area_code': workspace.business_area_code,
        }
        pd_qs = ProgrammeDocument.objects.filter(**filter_dict)
        self.assertFalse(pd_qs.exists())
        process_model(
            ProgrammeDocument,
            PMPProgrammeDocumentSerializer,
            data=data,
            filter_dict=filter_dict,
        )
        self.assertTrue(pd_qs.exists())

    def test_section(self):
        workspace = factories.WorkspaceFactory()
        data = {
            'address': 'SEBRATHA',
            'alternate_name': None,
            'basis_for_risk_rating': '',
            'city': 'SEBRATHA',
            'core_values_assessment_date': '2017-10-30',
            'country': '258',
            'cso_type': 'National',
            'email': 'test@example.com',
            'external_id': 80,
            'external_business_area_code': workspace.business_area_code,
            'id': 80,
            'last_assessment_date': '2020-02-21',
            'name': 'AFAQ FOUNDATION FOR RIGHTS AND DEVELOPMENT',
            'partner_type': 'Civil Society Organization',
            'phone_number': '918528496',
            'postal_code': '',
            'rating': 'Medium',
            'short_name': 'AFAQ FOUND',
            'street_address': None,
            'total_ct_cp': '118250.00',
            'total_ct_cy': '72200.00',
            'type_of_assessment': 'Micro Assessment',
            'unicef_vendor_number': '2500238136',
        }
        filter_dict = {
            'external_id': data['id'],
            'external_business_area_code': workspace.business_area_code,
        }
        section_qs = Section.objects.filter(**filter_dict)
        self.assertFalse(section_qs.exists())
        process_model(
            Section,
            PMPSectionSerializer,
            data=data,
            filter_dict=filter_dict,
        )
        self.assertTrue(section_qs.exists())

    def test_blueprint(self):
        pd = factories.ProgrammeDocumentFactory()
        data = {
            'id': 34,
            'blueprint_id': 34,
            'title': '# of children reached',
        }
        filter_dict = {
            'external_id': data['blueprint_id'],
            'reportables__lower_level_outputs__cp_output__programme_document': pd.pk
        }
        blueprint_qs = IndicatorBlueprint.objects.filter(**filter_dict)
        self.assertFalse(blueprint_qs.exists())
        process_model(
            IndicatorBlueprint,
            PMPIndicatorBlueprintSerializer,
            data=data,
            filter_dict=filter_dict,
        )
        # self.assertTrue(blueprint_qs.exists())

    def test_reportable(self):
        blueprint = factories.QuantityTypeIndicatorBlueprintFactory()
        pd = factories.ProgrammeDocumentFactory()
        data = {
            'id': 34,
            'blueprint_id': blueprint.pk,
            'disaggregation_ids': [],
            'content_type': 47,
            'object_id': 1,
        }
        filter_dict = {
            'external_id': data['blueprint_id'],
            'lower_level_outputs__cp_output__programme_document': pd.pk
        }
        reportable_qs = Reportable.objects.filter(**filter_dict)
        self.assertFalse(reportable_qs.exists())
        process_model(
            Reportable,
            PMPReportableSerializer,
            data=data,
            filter_dict=filter_dict,
        )
        # self.assertTrue(reportable_qs.exists())

    def test_location(self):
        data = {
            'id': 8136,
            'name': 'Abaipur',
            'p_code': '40448010',
            'admin_level_name': 'BGD-Admin Level 4',
            'admin_level': 4,
        }
        filter_dict = {
            'p_code': data['p_code'],
        }
        location_qs = Location.objects.filter(**filter_dict)
        self.assertFalse(location_qs.exists())
        process_model(
            Location,
            PMPLocationSerializer,
            data=data,
            filter_dict=filter_dict,
        )
        self.assertTrue(location_qs.exists())


class TestHandleReportingDates(BaseAPITestCase):
    def setUp(self):
        self.workspace = factories.WorkspaceFactory(business_area_code=1234)
        self.pd = factories.ProgrammeDocumentFactory(workspace=self.workspace)

        self.location_1 = factories.LocationFactory()
        self.location_1.workspaces.add(self.workspace)

        self.location_2 = factories.LocationFactory()
        self.location_2.workspaces.add(self.workspace)

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
        factories.LocationWithReportableLocationGoalFactory(
            location=self.location_1,
            reportable=self.llo_reportable,
        )

        factories.LocationWithReportableLocationGoalFactory(
            location=self.location_2,
            reportable=self.llo_reportable,
        )
        self.reporting_requirements = [
            {
                "id": 13,
                "start_date": "2023-11-01",
                "end_date": "2024-01-15",
                "due_date": "2024-02-14",
                "report_type": "QPR"
            },
            {
                "id": 12,
                "start_date": "2023-08-01",
                "end_date": "2023-10-31",
                "due_date": "2023-11-30",
                "report_type": "QPR"
            },
            {
                "id": 11,
                "start_date": "2023-05-01",
                "end_date": "2023-07-31",
                "due_date": "2023-08-30",
                "report_type": "QPR"
            }
        ]
        for index, reporting_reqs in enumerate(self.reporting_requirements, start=1):
            factories.QPRReportingPeriodDatesFactory(
                programme_document=self.pd, external_id=reporting_reqs['id'],
                external_business_area_code=self.workspace.business_area_code, **reporting_reqs)
            progress_report = factories.ProgressReportFactory(
                programme_document=self.pd, report_number=index, **reporting_reqs)
            indicator_report = factories.ProgressReportIndicatorReportFactory(
                progress_report=progress_report,
                reportable=self.llo_reportable,
                report_status=INDICATOR_REPORT_STATUS.due,
                overall_status=OVERALL_STATUS.met,
            )
            factories.IndicatorLocationDataFactory(
                indicator_report=indicator_report,
                location=self.location_1,
                num_disaggregation=3,
                level_reported=3,
                disaggregation_reported_on=list(
                    indicator_report.disaggregations.values_list(
                        'id', flat=True)),
                disaggregation=generate_data_combination_entries(
                    indicator_report.disaggregation_values(
                        id_only=True), indicator_type='quantity', r=3
                )
            )

        super().setUp()

    def test_handle_reporting_dates_no_misaligned(self):
        self.assertEqual(self.pd.reporting_periods.count(), 3)
        self.assertEqual(self.pd.progress_reports.count(), 3)

        # no deletion occurs at this step as there are no misaligned dates
        handle_reporting_dates(self.workspace.business_area_code, self.pd, self.reporting_requirements)
        self.assertEqual(self.pd.reporting_periods.count(), 3)
        self.assertEqual(self.pd.progress_reports.count(), 3)
        self.assertEqual(IndicatorReport.objects.filter(progress_report__programme_document=self.pd).count(), 3)
        self.assertEqual(
            IndicatorLocationData.objects.filter(
                indicator_report__progress_report__programme_document=self.pd).count(), 3)

    def test_handle_reporting_dates_no_data_input(self):

        self.assertEqual(self.pd.reporting_periods.count(), 3)
        self.assertEqual(self.pd.progress_reports.count(), 3)
        # delete existing progress reports with user input data
        self.pd.progress_reports.all().delete()
        self.assertEqual(self.pd.progress_reports.count(), 0)

        # recreate progress reports without any user input data
        for index, reporting_reqs in enumerate(self.reporting_requirements, start=1):
            factories.ProgressReportFactory(
                programme_document=self.pd, report_number=index, **reporting_reqs)
        self.assertEqual(self.pd.progress_reports.count(), 3)
        self.assertEqual(IndicatorReport.objects.filter(progress_report__programme_document=self.pd).count(), 0)
        self.assertEqual(
            IndicatorLocationData.objects.filter(
                indicator_report__progress_report__programme_document=self.pd).count(), 0)

        # alter end date for last reporting requirement
        self.reporting_requirements[-1]['end_date'] = '2023-07-15'
        handle_reporting_dates(self.workspace.business_area_code, self.pd, self.reporting_requirements)
        # check ReportingPeriodDates and progress report are deleted when no user data input
        self.assertEqual(self.pd.reporting_periods.count(), 2)
        self.assertEqual(self.pd.progress_reports.count(), 2)

    @mock.patch("etools_prp.apps.unicef.tasks.logger.exception")
    def test_handle_reporting_dates_with_indicator_report_data_input(self, mock_logger_exc):
        self.assertEqual(self.pd.reporting_periods.count(), 3)
        self.assertEqual(self.pd.progress_reports.count(), 3)

        # alter end date for last reporting requirement
        self.reporting_requirements[2]['end_date'] = '2023-07-16'
        # user input data at indicator report level
        indicator_report = IndicatorReport.objects.filter(progress_report__programme_document=self.pd).last()
        indicator_report.narrative_assessment = 'Some narrative_assessment'
        indicator_report.save()

        handle_reporting_dates(self.workspace.business_area_code, self.pd, self.reporting_requirements)
        # when there is user data input, an exception is logged, the record is skipped and nothing gets deleted
        self.assertTrue(mock_logger_exc.call_count, 1)
        self.assertEqual(self.pd.reporting_periods.count(), 3)
        self.assertEqual(self.pd.progress_reports.count(), 3)
        self.assertEqual(IndicatorReport.objects.filter(progress_report__programme_document=self.pd).count(), 3)
        self.assertEqual(
            IndicatorLocationData.objects.filter(
                indicator_report__progress_report__programme_document=self.pd).count(), 3)

    @mock.patch("etools_prp.apps.unicef.tasks.logger.exception")
    def test_handle_reporting_dates_with_indicator_location_data_input(self, mock_logger_exc):
        self.assertEqual(self.pd.reporting_periods.count(), 3)
        self.assertEqual(self.pd.progress_reports.count(), 3)

        # alter end date for last reporting requirement
        self.reporting_requirements[-1]['end_date'] = '2023-07-16'
        # user input data at indicator location data level
        indicator_location = IndicatorLocationData.objects.filter(
            indicator_report__progress_report__programme_document=self.pd).last()
        self.assertIsNotNone(indicator_location.disaggregation['()'])
        indicator_location.disaggregation = {
            '()': {
                'v': 1234,
                'd': 1,
                'c': 0
            }
        }
        indicator_location.save()

        handle_reporting_dates(self.workspace.business_area_code, self.pd, self.reporting_requirements)
        # when there is user data input, an exception is logged, the record is skipped and nothing gets deleted
        self.assertTrue(mock_logger_exc.call_count, 1)
        self.assertEqual(self.pd.reporting_periods.count(), 3)
        self.assertEqual(self.pd.progress_reports.count(), 3)
        self.assertEqual(IndicatorReport.objects.filter(progress_report__programme_document=self.pd).count(), 3)
        self.assertEqual(
            IndicatorLocationData.objects.filter(
                indicator_report__progress_report__programme_document=self.pd).count(), 3)
