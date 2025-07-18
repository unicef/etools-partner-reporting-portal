from unittest.mock import patch

from rest_framework.exceptions import ValidationError

from etools_prp.apps.core.common import REPORTING_TYPES
from etools_prp.apps.core.tests.factories import (
    IndicatorLocationDataFactory,
    ProgressReportFactory,
    ProgressReportIndicatorReportFactory,
)
from etools_prp.apps.unicef.models import ProgressReport
from etools_prp.apps.unicef.services import ProgressReportHFDataService
from etools_prp.apps.unicef.tests.test_views import BaseProgressReportAPITestCase


class ProgressReportHFDataServiceTest(BaseProgressReportAPITestCase):
    def setUp(self):
        super().setUp()
        self.progress_report = self.pd.progress_reports.filter(
            is_final=False, report_type=REPORTING_TYPES.QPR).first()
        self.indicator_report = self.progress_report.indicator_reports.first()
        self.pr_service = ProgressReportHFDataService(self.workspace.id, self.progress_report.id)

    def test_get_progress_report_success(self):

        result = self.pr_service.get_progress_report()
        self.assertEqual(result, self.progress_report)

    @patch("etools_prp.apps.unicef.services.logger.exception")
    def test_get_progress_report_not_found(self, mock_logger_exception):

        ProgressReportHFDataService(self.workspace.id, 99999)
        self.assertEqual(mock_logger_exception.call_count, 1)
        self.assertIn('ProgressReport not found', mock_logger_exception.call_args[0])

    def test_validate_and_get_hf_reports_success(self):
        hf_report = ProgressReportFactory(
            programme_document=self.pd,
            report_type="HR",
            report_number=self.progress_report.id + 1,
            start_date=self.progress_report.start_date,
            end_date=self.progress_report.end_date
        )
        ProgressReportIndicatorReportFactory(
            progress_report=hf_report,
            reportable=self.indicator_report.reportable,
            time_period_start=self.progress_report.start_date,
            time_period_end=self.progress_report.end_date
        )
        result_ir, result_hf_reports = self.pr_service.validate_and_get_hf_reports(self.indicator_report.id)

        self.assertEqual(result_ir, self.indicator_report)
        self.assertIn(hf_report, result_hf_reports)

    def test_validate_and_get_hf_reports_invalid_report_type(self):
        hr_report = ProgressReportFactory(
            programme_document=self.pd,
            report_type="HR",
            report_number=self.pd.progress_reports.count() + 1,
        )
        pr_service = ProgressReportHFDataService(self.workspace.id, hr_report.id)

        with self.assertRaises(ValidationError) as err:
            pr_service.validate_and_get_hf_reports(self.indicator_report.id)

        self.assertIn('This Progress Report is not QPR type.', err.exception.args)

    def test_validate_and_get_hf_reports_no_hf_reports(self):

        with self.assertRaises(ValidationError) as err:
            self.pr_service.validate_and_get_hf_reports(self.indicator_report.id)

        self.assertIn('This HR indicator does not have any High frequency reports within this QPR period.', err.exception.args)

    def test_calculate_location_totals(self):
        hf_report = ProgressReportFactory(
            programme_document=self.pd,
            report_type="HR",
            report_number=self.progress_report.id + 1,
            start_date=self.progress_report.start_date,
            end_date=self.progress_report.end_date
        )
        hf_indicator_report = ProgressReportIndicatorReportFactory(
            progress_report=hf_report,
            reportable=self.indicator_report.reportable,
            time_period_start=self.progress_report.start_date,
            time_period_end=self.progress_report.end_date
        )
        IndicatorLocationDataFactory(
            indicator_report=hf_indicator_report,
            disaggregation={"()": {"c": 100, "d": 0, "v": 100}},
            disaggregation_reported_on=list(hf_indicator_report.disaggregations.values_list(
                'id', flat=True)),
            location=self.loc1
        )
        hr_reports_qs = ProgressReport.objects.filter(
            programme_document=self.progress_report.programme_document,
            report_type="HR",
            start_date__gte=self.progress_report.start_date,
            end_date__lte=self.progress_report.end_date,
        ).prefetch_related('indicator_reports')

        result = self.pr_service.calculate_location_totals(
            hf_indicator_report,
            hr_reports_qs,
            [self.loc1.id],
        )
        self.assertEqual(result[self.loc1.id]['data']['()']['v'], 100)
        self.assertEqual(result[self.loc1.id]['data']['()']['d'], 1)  # For NUMBER type, d should be 1
        self.assertEqual(result[self.loc1.id]['data']['()']['c'], 100.0)

    def test_update_indicator_data_success(self):
        ild = self.indicator_report.indicator_location_data.filter(location=self.loc1).first()
        ild.disaggregation = {'()': {'c': 2.0, 'd': 1, 'v': 2}}
        ild.save(update_fields=['disaggregation'])

        consolidated_data = {
            self.loc1.id: {
                'total': {'c': 100, 'd': 1, 'v': 100},
                'data': {'()': {'c': 200.0, 'd': 1, 'v': 200}}
            }
        }
        total = ProgressReportHFDataService.update_indicator_data(
            self.indicator_report,
            consolidated_data
        )
        ild.refresh_from_db()
        self.assertEqual(ild.disaggregation['()']['v'], 200)
        self.assertEqual(ild.disaggregation['()']['d'], 1)
        self.assertEqual(ild.disaggregation['()']['c'], 200.0)
        self.assertIsNotNone(total)

    def test_update_indicator_no_data_fail(self):
        consolidated_data = {
            self.loc1.id: {
                'total': {'c': 0, 'd': 0, 'v': 0},
                'data': {}
            }
        }
        with self.assertRaises(ValidationError) as err:
            ProgressReportHFDataService.update_indicator_data(
                self.indicator_report,
                consolidated_data
            )
        self.assertIn(
            "This indicator does not have available data to pull. Enter data for HR report on this indicator first.", err.exception.args)

    def test_calculate_simple_totals(self):
        ild1 = IndicatorLocationDataFactory(
            indicator_report=self.indicator_report,
            location=self.loc1,
            disaggregation={"()": {"c": 5, "d": 1, "v": 5}},
            disaggregation_reported_on=[]
        )
        ild2 = IndicatorLocationDataFactory(
            indicator_report=self.indicator_report,
            location=self.loc1,
            disaggregation={"()": {"c": 10, "d": 1, "v": 10}},
            disaggregation_reported_on=[]
        )

        result = {
            'total': {'c': 0, 'd': 0, 'v': 0},
            'data': {}
        }
        updated_result = ProgressReportHFDataService._calculate_simple_totals(
            [ild1, ild2],
            self.indicator_report,
            result
        )
        self.assertEqual(updated_result['total']['v'], 15)
        self.assertEqual(updated_result['total']['d'], 1)
        self.assertEqual(updated_result['total']['c'], 15.0)

    def test_calculate_disaggregated_totals(self):
        hr_progress_report = ProgressReportFactory(
            start_date=self.progress_report.start_date,
            end_date=self.progress_report.end_date,
            due_date=self.progress_report.due_date,
            report_type=REPORTING_TYPES.HR,
            report_number=self.pd.progress_reports.filter(report_type=REPORTING_TYPES.HR).count() + 1,
            is_final=False,
            programme_document=self.pd,
        )
        new_hf_indicator_report = ProgressReportIndicatorReportFactory(
            time_period_start=hr_progress_report.start_date,
            time_period_end=hr_progress_report.end_date,
            reportable=self.indicator_report.reportable,
            progress_report=hr_progress_report
        )

        ild1 = IndicatorLocationDataFactory(
            indicator_report=new_hf_indicator_report,
            location=self.loc1,
            disaggregation={
                "()": {"c": 5, "d": 0, "v": 5},
            },
            disaggregation_reported_on=list(new_hf_indicator_report.disaggregations.values_list(
                'id', flat=True)),
        )
        ild2 = IndicatorLocationDataFactory(
            indicator_report=new_hf_indicator_report,
            location=self.loc1,
            disaggregation={
                "()": {"c": 4, "d": 0, "v": 4},
            },
            disaggregation_reported_on=list(new_hf_indicator_report.disaggregations.values_list(
                'id', flat=True)),
        )

        result = {
            self.loc1.id: {
                'total': {'c': 0, 'd': 0, 'v': 0},
                'data': {}
            }
        }

        updated_result = ProgressReportHFDataService._calculate_disaggregated_totals(
            [ild1, ild2],
            new_hf_indicator_report,
            ["()"],
            result[self.loc1.id]
        )
        self.assertEqual(updated_result['data']['()']['v'], 9)
        self.assertEqual(updated_result['data']['()']['d'], 1)
        self.assertAlmostEqual(updated_result['data']['()']['c'], 9)
