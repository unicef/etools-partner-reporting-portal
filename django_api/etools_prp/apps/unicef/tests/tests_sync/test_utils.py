from copy import deepcopy
from unittest import mock

from etools_prp.apps.core.common import INDICATOR_REPORT_STATUS, OVERALL_STATUS
from etools_prp.apps.core.helpers import generate_data_combination_entries
from etools_prp.apps.core.tests import factories
from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.indicator.models import IndicatorBlueprint, IndicatorLocationData, IndicatorReport
from etools_prp.apps.unicef.sync.utils import handle_reporting_dates


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
                "id": 1,
                "start_date": "2023-11-01",
                "end_date": "2024-01-15",
                "due_date": "2024-02-14",
                "report_type": "QPR"
            },
            {
                "id": 2,
                "start_date": "2023-08-01",
                "end_date": "2023-10-31",
                "due_date": "2023-11-30",
                "report_type": "QPR"
            },
            {
                "id": 3,
                "start_date": "2023-05-01",
                "end_date": "2023-07-31",
                "due_date": "2023-08-30",
                "report_type": "QPR"
            },
            {
                "id": 4,
                "start_date": "2023-11-01",
                "end_date": "2024-01-15",
                "due_date": "2024-02-14",
                "report_type": "HR"
            },
            {
                "id": 5,
                "start_date": "2023-08-01",
                "end_date": "2023-10-31",
                "due_date": "2023-11-30",
                "report_type": "HR"
            },
            {
                "id": 6,
                "start_date": "2023-05-01",
                "end_date": "2023-07-31",
                "due_date": "2023-08-30",
                "report_type": "HR"
            },
            {
                "id": 7,
                "start_date": None,
                "end_date": None,
                "description": "test SR1",
                "due_date": "2023-11-30",
                "report_type": "SR"
            },
            {
                "id": 8,
                "start_date": None,
                "end_date": None,
                "description": "test SR2",
                "due_date": "2023-08-30",
                "report_type": "SR"
            }
        ]
        for index, reporting_reqs in enumerate(self.reporting_requirements, start=1):
            factories.QPRReportingPeriodDatesFactory(
                programme_document=self.pd, external_id=reporting_reqs['id'],
                external_business_area_code=self.workspace.business_area_code, **reporting_reqs)
            reporting_reqs.pop('description', None)
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
        self.assertEqual(self.pd.reporting_periods.count(), 8)
        self.assertEqual(self.pd.progress_reports.count(), 8)

        # no deletion occurs at this step as there are no misaligned dates
        handle_reporting_dates(self.workspace.business_area_code, self.pd, self.reporting_requirements)
        self.assertEqual(self.pd.reporting_periods.count(), 8)
        self.assertEqual(self.pd.progress_reports.count(), 8)
        self.assertEqual(IndicatorReport.objects.filter(progress_report__programme_document=self.pd).count(), 8)
        self.assertEqual(
            IndicatorLocationData.objects.filter(
                indicator_report__progress_report__programme_document=self.pd).count(), 8)

    def test_handle_reporting_dates_no_data_input(self):

        self.assertEqual(self.pd.reporting_periods.count(), 8)
        self.assertEqual(self.pd.progress_reports.count(), 8)
        # delete existing progress reports with user input data
        self.pd.progress_reports.all().delete()
        self.assertEqual(self.pd.progress_reports.count(), 0)

        # recreate progress reports without any user input data
        for index, reporting_reqs in enumerate(self.reporting_requirements, start=1):
            reporting_reqs.pop('description', None)
            factories.ProgressReportFactory(
                programme_document=self.pd, report_number=index, **reporting_reqs,
                narrative=None,
                review_overall_status=None,
                challenges_in_the_reporting_period=None,
                financial_contribution_to_date=None,
                proposed_way_forward=None,
                partner_contribution_to_date=None
            )
        self.assertEqual(self.pd.progress_reports.count(), 8)
        self.assertEqual(IndicatorReport.objects.filter(progress_report__programme_document=self.pd).count(), 0)
        self.assertEqual(
            IndicatorLocationData.objects.filter(
                indicator_report__progress_report__programme_document=self.pd).count(), 0)

        # alter end date for last QPR
        self.reporting_requirements[2]['end_date'] = '2023-07-15'
        handle_reporting_dates(self.workspace.business_area_code, self.pd, self.reporting_requirements)
        # check ReportingPeriodDates and progress report are deleted when no user data input
        self.assertEqual(self.pd.reporting_periods.count(), 7)
        self.assertEqual(self.pd.progress_reports.count(), 7)

    def test_handle_reporting_dates_remove_reporting_req(self):
        self.assertEqual(self.pd.reporting_periods.count(), 8)
        self.assertEqual(self.pd.progress_reports.count(), 8)
        # delete existing progress reports with user input data
        self.pd.progress_reports.all().delete()
        self.assertEqual(self.pd.progress_reports.count(), 0)

        # recreate progress reports without any user input data
        for index, reporting_reqs in enumerate(self.reporting_requirements, start=1):
            factories.ProgressReportFactory(
                programme_document=self.pd, report_number=index, **reporting_reqs,
                narrative=None,
                review_overall_status=None,
                challenges_in_the_reporting_period=None,
                financial_contribution_to_date=None,
                proposed_way_forward=None,
                partner_contribution_to_date=None
            )
        self.assertEqual(self.pd.progress_reports.count(), 8)
        self.assertEqual(IndicatorReport.objects.filter(progress_report__programme_document=self.pd).count(), 0)
        self.assertEqual(
            IndicatorLocationData.objects.filter(
                indicator_report__progress_report__programme_document=self.pd).count(), 0)

        # remove last 2 reporting requirement, only 1 remaining
        reporting_requirements = self.reporting_requirements[2:]
        handle_reporting_dates(self.workspace.business_area_code, self.pd, reporting_requirements)
        # check ReportingPeriodDates and progress report are deleted when no user data input
        self.assertEqual(self.pd.reporting_periods.count(), 8 - 2)
        self.assertEqual(self.pd.progress_reports.count(), 8 - 2)

    def test_handle_reporting_dates_remove_special_reports(self):
        self.assertEqual(self.pd.reporting_periods.count(), 8)
        self.assertEqual(self.pd.progress_reports.count(), 8)
        # delete existing progress reports with user input data
        self.pd.progress_reports.all().delete()
        self.assertEqual(self.pd.progress_reports.count(), 0)

        # recreate progress reports without any user input data
        for index, reporting_reqs in enumerate(self.reporting_requirements, start=1):
            factories.ProgressReportFactory(
                programme_document=self.pd, report_number=index, **reporting_reqs,
                narrative=None,
                review_overall_status=None,
                challenges_in_the_reporting_period=None,
                financial_contribution_to_date=None,
                proposed_way_forward=None,
                partner_contribution_to_date=None
            )
        self.assertEqual(self.pd.progress_reports.count(), 8)
        self.assertEqual(IndicatorReport.objects.filter(progress_report__programme_document=self.pd).count(), 0)
        self.assertEqual(
            IndicatorLocationData.objects.filter(
                indicator_report__progress_report__programme_document=self.pd).count(), 0)

        # remove first special report, only 1 remaining
        reporting_requirements = deepcopy(self.reporting_requirements)
        reporting_requirements.pop(6)

        handle_reporting_dates(self.workspace.business_area_code, self.pd, reporting_requirements)
        # check ReportingPeriodDates and progress report are deleted when no user data input
        self.assertEqual(self.pd.reporting_periods.count(), 8 - 1)
        self.assertEqual(self.pd.progress_reports.count(), 8 - 1)

        # remove all special report, none remaining
        reporting_requirements.pop(6)
        handle_reporting_dates(self.workspace.business_area_code, self.pd, reporting_requirements)
        # check ReportingPeriodDates and progress report are deleted when no user data input
        self.assertEqual(self.pd.reporting_periods.count(), 7 - 1)
        self.assertEqual(self.pd.progress_reports.count(), 7 - 1)

    @mock.patch("etools_prp.apps.unicef.sync.utils.logger.exception")
    def test_handle_reporting_dates_duplicate_special_reports(self, mock_logger_exc):
        self.assertEqual(self.pd.reporting_periods.count(), 8)
        self.assertEqual(self.pd.progress_reports.count(), 8)
        # delete existing progress reports with user input data
        self.pd.progress_reports.all().delete()
        self.assertEqual(self.pd.progress_reports.count(), 0)
        reporting_requirements = self.reporting_requirements
        dupe_sr = {
            "id": 9,
            "start_date": None,
            "end_date": None,
            "description": "test SR1",
            "due_date": "2023-11-30",
            "report_type": "SR"
        }
        reporting_requirements.append(dupe_sr)
        factories.QPRReportingPeriodDatesFactory(
            programme_document=self.pd, external_id=dupe_sr['id'],
            external_business_area_code=self.workspace.business_area_code, **dupe_sr)

        # recreate progress reports without any user input data
        for index, reporting_reqs in enumerate(self.reporting_requirements, start=1):
            reporting_reqs.pop('description', None)
            factories.ProgressReportFactory(
                programme_document=self.pd, report_number=index, **reporting_reqs,
                narrative=None,
                review_overall_status=None,
                challenges_in_the_reporting_period=None,
                financial_contribution_to_date=None,
                proposed_way_forward=None,
                partner_contribution_to_date=None
            )
        self.assertEqual(self.pd.progress_reports.count(), 9)
        self.assertEqual(IndicatorReport.objects.filter(progress_report__programme_document=self.pd).count(), 0)
        self.assertEqual(
            IndicatorLocationData.objects.filter(
                indicator_report__progress_report__programme_document=self.pd).count(), 0)

        # remove first dupe special report, 2 remaining
        reporting_requirements.pop(6)
        handle_reporting_dates(self.workspace.business_area_code, self.pd, reporting_requirements)
        self.assertTrue(mock_logger_exc.call_count, 1)

        # check ReportingPeriodDates and progress report are not deleted because of duplicated data
        self.assertEqual(self.pd.reporting_periods.count(), 9)
        self.assertEqual(self.pd.progress_reports.count(), 9)

    @mock.patch("etools_prp.apps.unicef.sync.utils.logger.exception")
    def test_handle_reporting_dates_with_report_data_input(self, mock_logger_exc):
        self.assertEqual(self.pd.reporting_periods.count(), 8)
        self.assertEqual(self.pd.progress_reports.count(), 8)

        # alter end date for last reporting requirement
        self.reporting_requirements[2]['end_date'] = '2023-07-16'
        # user input data at indicator report level
        indicator_report = IndicatorReport.objects.filter(progress_report__programme_document=self.pd).last()
        indicator_report.narrative_assessment = 'Some narrative_assessment'
        indicator_report.save()
        handle_reporting_dates(self.workspace.business_area_code, self.pd, self.reporting_requirements)
        # when there is user data input, an exception is logged, the record is skipped and nothing gets deleted
        self.assertTrue(mock_logger_exc.call_count, 1)
        self.assertEqual(self.pd.reporting_periods.count(), 8)
        self.assertEqual(self.pd.progress_reports.count(), 8)
        self.assertEqual(IndicatorReport.objects.filter(progress_report__programme_document=self.pd).count(), 8)
        self.assertEqual(
            IndicatorLocationData.objects.filter(
                indicator_report__progress_report__programme_document=self.pd).count(), 8)

    @mock.patch("etools_prp.apps.unicef.sync.utils.logger.exception")
    def test_handle_reporting_dates_with_indicator_location_data_input(self, mock_logger_exc):
        self.assertEqual(self.pd.reporting_periods.count(), 8)
        self.assertEqual(self.pd.progress_reports.count(), 8)

        # alter end date for last QPR requirement
        self.reporting_requirements[2]['end_date'] = '2023-07-16'
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
        self.assertEqual(self.pd.reporting_periods.count(), 8)
        self.assertEqual(self.pd.progress_reports.count(), 8)
        self.assertEqual(IndicatorReport.objects.filter(progress_report__programme_document=self.pd).count(), 8)
        self.assertEqual(
            IndicatorLocationData.objects.filter(
                indicator_report__progress_report__programme_document=self.pd).count(), 8)
