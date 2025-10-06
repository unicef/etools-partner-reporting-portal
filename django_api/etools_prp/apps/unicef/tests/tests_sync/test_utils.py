from unittest import mock

from etools_prp.apps.core.common import INDICATOR_REPORT_STATUS, OVERALL_STATUS
from etools_prp.apps.core.helpers import generate_data_combination_entries
from etools_prp.apps.core.tests import factories
from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.indicator.models import IndicatorBlueprint, IndicatorLocationData, IndicatorReport
from etools_prp.apps.unicef.sync.utils import handle_qpr_hr_reporting_dates, handle_sr_reporting_dates


class TestHandleReportingDatesQPRnHR(BaseAPITestCase):
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
                "start_date": "2023-11-02",
                "end_date": "2024-01-15",
                "due_date": "2024-02-14",
                "report_type": "HR"
            },
            {
                "id": 5,
                "start_date": "2023-08-02",
                "end_date": "2023-10-31",
                "due_date": "2023-11-30",
                "report_type": "HR"
            },
            {
                "id": 6,
                "start_date": "2023-05-02",
                "end_date": "2023-07-31",
                "due_date": "2023-08-30",
                "report_type": "HR"
            }
        ]
        for index, reporting_reqs in enumerate(self.reporting_requirements, start=1):
            if reporting_reqs['report_type'] == 'QPR':
                factories.QPRReportingPeriodDatesFactory(
                programme_document=self.pd, external_id=reporting_reqs['id'],
                external_business_area_code=self.workspace.business_area_code, **reporting_reqs
            )
            elif reporting_reqs['report_type'] == 'HR':
                factories.HRReportingPeriodDatesFactory(
                programme_document=self.pd, external_id=reporting_reqs['id'],
                external_business_area_code=self.workspace.business_area_code, **reporting_reqs
            )
            progress_report = factories.ProgressReportFactory(
                programme_document=self.pd, report_number=index, **reporting_reqs,
                submitted_by=None, submitting_user=None
            )
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
        self.assertEqual(self.pd.reporting_periods.count(), 6)
        self.assertEqual(self.pd.progress_reports.count(), 6)

        # no deletion occurs at this step as there are no misaligned dates
        handle_qpr_hr_reporting_dates(self.workspace.business_area_code, self.pd, self.reporting_requirements)
        self.assertEqual(self.pd.reporting_periods.count(), 6)
        self.assertEqual(self.pd.progress_reports.count(), 6)
        self.assertEqual(IndicatorReport.objects.filter(progress_report__programme_document=self.pd).count(), 6)
        self.assertEqual(
            IndicatorLocationData.objects.filter(
                indicator_report__progress_report__programme_document=self.pd).count(), 6)

    def test_handle_reporting_dates_no_data_input(self):

        self.assertEqual(self.pd.reporting_periods.count(), 6)
        self.assertEqual(self.pd.progress_reports.count(), 6)
        # delete existing progress reports with user input data
        self.pd.progress_reports.all().delete()
        self.assertEqual(self.pd.progress_reports.count(), 0)

        # recreate progress reports without any user input data
        for index, reporting_reqs in enumerate(self.reporting_requirements, start=1):
            reporting_reqs.pop('description', None)
            factories.ProgressReportFactory(
                programme_document=self.pd, report_number=index, **reporting_reqs,
                narrative=None, submitted_by=None, submitting_user=None,
                challenges_in_the_reporting_period=None,
                financial_contribution_to_date=None,
                proposed_way_forward=None,
                partner_contribution_to_date=None
            )
        self.assertEqual(self.pd.progress_reports.count(), 6)
        self.assertEqual(IndicatorReport.objects.filter(progress_report__programme_document=self.pd).count(), 0)
        self.assertEqual(
            IndicatorLocationData.objects.filter(
                indicator_report__progress_report__programme_document=self.pd).count(), 0)

        # alter end date for last QPR
        self.reporting_requirements[2]['end_date'] = '2023-07-15'
        handle_qpr_hr_reporting_dates(self.workspace.business_area_code, self.pd, self.reporting_requirements)
        # check ReportingPeriodDates and progress report are deleted when no user data input
        self.assertEqual(self.pd.reporting_periods.count(), 5)
        self.assertEqual(self.pd.progress_reports.count(), 5)

    def test_handle_reporting_dates_HR_remove_last(self):
        self.reporting_requirements = {
        "reporting_requirements": [
            {
                "id": 3346,
                "start_date": "2025-09-02",
                "end_date": "2025-09-23",
                "due_date": "2025-09-24"
            },
            {
                "id": 3345,
                "start_date": "2025-08-21",
                "end_date": "2025-09-01",
                "due_date": "2025-09-02"
            },
            {
                "id": 3344,
                "start_date": "2025-08-01",
                "end_date": "2025-08-20",
                "due_date": "2025-08-21"
            },
            {
                "id": 3343,
                "start_date": "2025-07-08",
                "end_date": "2025-07-31",
                "due_date": "2025-08-01"
            },
            {
                "id": 3342,
                "start_date": "2025-03-02",
                "end_date": "2025-07-07",
                "due_date": "2025-07-08"
            },
            {
                "id": 3341,
                "start_date": "2025-12-11",
                "end_date": "2025-12-31",
                "due_date": "2026-01-01"
            }
        ]
    }

    def test_handle_reporting_dates_remove_reporting_req(self):
        self.assertEqual(self.pd.reporting_periods.count(), 6)
        self.assertEqual(self.pd.reporting_periods.filter(report_type='QPR').count(), 3)
        self.assertEqual(self.pd.reporting_periods.filter(report_type='HR').count(), 3)
        self.assertEqual(self.pd.progress_reports.count(), 6)
        self.assertEqual(self.pd.progress_reports.filter(report_type='QPR').count(), 3)
        self.assertEqual(self.pd.progress_reports.filter(report_type='HR').count(), 3)
        # delete existing progress reports with user input data
        self.pd.progress_reports.all().delete()
        self.assertEqual(self.pd.progress_reports.count(), 0)

        # recreate progress reports without any user input data
        for index, reporting_reqs in enumerate(self.reporting_requirements, start=1):
            factories.ProgressReportFactory(
                programme_document=self.pd, report_number=index, **reporting_reqs,
                narrative=None, submitted_by=None, submitting_user=None,
                challenges_in_the_reporting_period=None,
                financial_contribution_to_date=None,
                proposed_way_forward=None,
                partner_contribution_to_date=None
            )
        self.assertEqual(self.pd.progress_reports.count(), 6)
        self.assertEqual(IndicatorReport.objects.filter(progress_report__programme_document=self.pd).count(), 0)
        self.assertEqual(
            IndicatorLocationData.objects.filter(
                indicator_report__progress_report__programme_document=self.pd).count(), 0)

        # remove first 2 QPR reporting requirement, only 1 QPR remaining
        reporting_requirements = self.reporting_requirements[2:]
        handle_qpr_hr_reporting_dates(self.workspace.business_area_code, self.pd, reporting_requirements)
        # check ReportingPeriodDates and progress report are deleted when no user data input
        self.assertEqual(self.pd.reporting_periods.count(), 6 - 2)
        self.assertEqual(self.pd.progress_reports.count(), 6 - 2)
        self.assertEqual(self.pd.reporting_periods.filter(report_type='QPR').count(), 1)
        self.assertEqual(self.pd.progress_reports.filter(report_type='QPR').count(), 1)
        self.assertEqual(self.pd.reporting_periods.filter(report_type='HR').count(), 3)
        self.assertEqual(self.pd.progress_reports.filter(report_type='HR').count(), 3)

        # remove last HR report from chronological orger, 1 QPR, 2HRs reports remaining
        reporting_requirements.pop(1)
        handle_qpr_hr_reporting_dates(self.workspace.business_area_code, self.pd, reporting_requirements)
        # check ReportingPeriodDates and progress report are deleted when no user data input
        self.assertEqual(self.pd.reporting_periods.count(), 3)
        self.assertEqual(self.pd.progress_reports.count(), 3)
        self.assertEqual(self.pd.reporting_periods.filter(report_type='HR').count(), 2)
        self.assertEqual(self.pd.progress_reports.filter(report_type='QPR').count(), 1)

        # remove all HR reports, 1 QPR, none HR remaining as all following deleted
        reporting_requirements = reporting_requirements[:-2]
        handle_qpr_hr_reporting_dates(self.workspace.business_area_code, self.pd, reporting_requirements)
        # check ReportingPeriodDates and progress report are deleted when no user data input
        self.assertEqual(self.pd.reporting_periods.count(), 1)
        self.assertEqual(self.pd.progress_reports.count(), 1)
        self.assertEqual(self.pd.reporting_periods.filter(report_type='HR').count(), 0)
        self.assertEqual(self.pd.progress_reports.filter(report_type='HR').count(), 0)
        self.assertEqual(self.pd.reporting_periods.filter(report_type='QPR').count(), 1)
        self.assertEqual(self.pd.progress_reports.filter(report_type='QPR').count(), 1)


    @mock.patch("etools_prp.apps.unicef.sync.utils.logger.exception")
    def test_handle_reporting_dates_with_report_data_input(self, mock_logger_exc):
        self.assertEqual(self.pd.reporting_periods.count(), 6)
        self.assertEqual(self.pd.progress_reports.count(), 6)

        # alter end date for last reporting requirement
        self.reporting_requirements[2]['end_date'] = '2023-07-16'
        # user input data at indicator report level
        indicator_report = IndicatorReport.objects.filter(progress_report__programme_document=self.pd).last()
        indicator_report.narrative_assessment = 'Some narrative_assessment'
        indicator_report.save()
        handle_qpr_hr_reporting_dates(self.workspace.business_area_code, self.pd, self.reporting_requirements)
        # when there is user data input, an exception is logged, the record is skipped and nothing gets deleted
        self.assertTrue(mock_logger_exc.call_count, 1)
        self.assertEqual(self.pd.reporting_periods.count(), 6)
        self.assertEqual(self.pd.progress_reports.count(), 6)
        self.assertEqual(IndicatorReport.objects.filter(progress_report__programme_document=self.pd).count(), 6)
        self.assertEqual(
            IndicatorLocationData.objects.filter(
                indicator_report__progress_report__programme_document=self.pd).count(), 6)

    @mock.patch("etools_prp.apps.unicef.sync.utils.logger.exception")
    def test_handle_reporting_dates_with_indicator_location_data_input(self, mock_logger_exc):
        self.assertEqual(self.pd.reporting_periods.count(), 6)
        self.assertEqual(self.pd.progress_reports.count(), 6)

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

        handle_qpr_hr_reporting_dates(self.workspace.business_area_code, self.pd, self.reporting_requirements)
        # when there is user data input, an exception is logged, the record is skipped and nothing gets deleted
        self.assertTrue(mock_logger_exc.call_count, 1)
        self.assertEqual(self.pd.reporting_periods.count(), 6)
        self.assertEqual(self.pd.progress_reports.count(), 6)
        self.assertEqual(IndicatorReport.objects.filter(progress_report__programme_document=self.pd).count(), 6)
        self.assertEqual(
            IndicatorLocationData.objects.filter(
                indicator_report__progress_report__programme_document=self.pd).count(), 6)


class TestHandleReportingDatesSR(BaseAPITestCase):
    def setUp(self):
        self.workspace = factories.WorkspaceFactory(business_area_code=4321)
        self.pd = factories.ProgrammeDocumentFactory(workspace=self.workspace)

        self.special_reports = [
            {
                "id": 182,
                "due_date": "2023-12-15",
                "description": "8"
            },
            {
                "id": 181,
                "due_date": "2023-11-30",
                "description": "7"
            },
            {
                "id": 180,
                "due_date": "2023-11-11",
                "description": "6"
            },
            {
                "id": 179,
                "due_date": "2023-10-23",
                "description": "5"
            }
        ]
        for index, reporting_reqs in enumerate(self.special_reports, start=1):
            external_id = reporting_reqs.pop('id', None)
            factories.SRReportingPeriodDatesFactory(
                programme_document=self.pd, external_id=external_id,
                external_business_area_code=self.workspace.business_area_code, **reporting_reqs)
            reporting_reqs.pop('description', None)
            factories.ProgressReportFactory(
                programme_document=self.pd, report_number=index, report_type='SR', **reporting_reqs,
                narrative=None, submitted_by=None, submitting_user=None,
                challenges_in_the_reporting_period=None,
                financial_contribution_to_date=None,
                proposed_way_forward=None,
                partner_contribution_to_date=None
            )
            reporting_reqs['id'] = external_id

    def test_handle_reporting_dates_remove_special_reports(self):
        self.assertEqual(self.pd.reporting_periods.count(), 4)
        self.assertEqual(self.pd.progress_reports.count(), 4)

        # remove first special report
        self.special_reports.pop(0)

        handle_sr_reporting_dates(self.workspace.business_area_code, self.pd, self.special_reports)
        # check ReportingPeriodDates and progress report are deleted when no user data input
        self.assertEqual(self.pd.reporting_periods.count(), 4 - 1)
        self.assertEqual(self.pd.progress_reports.count(), 4 - 1)

        # remove all special reports, none remaining
        self.special_reports = []
        handle_sr_reporting_dates(self.workspace.business_area_code, self.pd, self.special_reports)
        # check ReportingPeriodDates and progress report are deleted when no user data input
        self.assertEqual(self.pd.reporting_periods.count(), 0)
        self.assertEqual(self.pd.progress_reports.count(), 0)

    def test_handle_reporting_dates_change_due_date(self):
        self.assertEqual(self.pd.reporting_periods.count(), 4)
        self.assertEqual(self.pd.progress_reports.count(), 4)

        # change due_date on first special report from 2023-12-15
        self.special_reports[0]['due_date'] = '2023-12-31'

        handle_sr_reporting_dates(self.workspace.business_area_code, self.pd, self.special_reports)
        # check ReportingPeriodDates and progress report are deleted when no user data input
        self.assertEqual(self.pd.reporting_periods.count(), 4 - 1)
        self.assertEqual(self.pd.progress_reports.count(), 4 - 1)

        # remove all special reports, none remaining
        self.special_reports = []
        handle_sr_reporting_dates(self.workspace.business_area_code, self.pd, self.special_reports)
        # check ReportingPeriodDates and progress report are deleted when no user data input
        self.assertEqual(self.pd.reporting_periods.count(), 0)
        self.assertEqual(self.pd.progress_reports.count(), 0)

    @mock.patch("etools_prp.apps.unicef.sync.utils.logger.exception")
    def test_handle_reporting_dates_duplicate_special_reports(self, mock_logger_exc):
        self.assertEqual(self.pd.reporting_periods.count(), 4)
        self.assertEqual(self.pd.progress_reports.count(), 4)

        dupe_sr = {
            "id": 178,
            "due_date": "2023-10-23",
            "description": "5"
        }
        self.special_reports.append(dupe_sr)
        factories.SRReportingPeriodDatesFactory(
            programme_document=self.pd, external_id=dupe_sr['id'],
            external_business_area_code=self.workspace.business_area_code, due_date=dupe_sr['due_date'])

        # add progress reports without any user input data
        factories.ProgressReportFactory(
            programme_document=self.pd, report_number=self.pd.progress_reports.count() + 1,
            report_type='SR', due_date=dupe_sr['due_date'], submitted_by=None, submitting_user=None,
            narrative=None, challenges_in_the_reporting_period=None, financial_contribution_to_date=None,
            proposed_way_forward=None, partner_contribution_to_date=None
        )
        self.assertEqual(self.pd.progress_reports.count(), 5)

        # remove first dupe special report, 1 remaining
        self.special_reports.pop(3)
        handle_sr_reporting_dates(self.workspace.business_area_code, self.pd, self.special_reports)
        self.assertTrue(mock_logger_exc.call_count, 1)

        # check ReportingPeriodDates and progress report are not deleted because of duplicated data
        self.assertEqual(self.pd.reporting_periods.count(), 5)
        self.assertEqual(self.pd.progress_reports.count(), 5)
