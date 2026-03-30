from datetime import date, timedelta
from unittest.mock import MagicMock, patch

from django.test import TestCase

from etools_prp.apps.core.common import INDICATOR_REPORT_STATUS, PROGRESS_REPORT_STATUS
from etools_prp.apps.indicator.tasks import _process_indicator_report, _process_progress_report, process_due_reports


def _make_indicator_report(
    report_status=INDICATOR_REPORT_STATUS.due, due_date=None, time_period_start=None, time_period_end=None
):
    r = MagicMock()
    r.id = 1
    r.report_status = report_status
    r.due_date = due_date
    r.time_period_start = time_period_start or date.today() - timedelta(days=10)
    r.time_period_end = time_period_end or date.today() - timedelta(days=1)
    return r


def _make_progress_report(status=PROGRESS_REPORT_STATUS.due, report_type="QPR", due_date=None, end_date=None):
    r = MagicMock()
    r.id = 2
    r.status = status
    r.report_type = report_type
    r.due_date = due_date
    r.end_date = end_date or date.today() - timedelta(days=1)
    return r


class TestProcessIndicatorReport(TestCase):
    def test_marks_overdue(self):
        today = date.today()
        report = _make_indicator_report(
            report_status=INDICATOR_REPORT_STATUS.due,
            due_date=today - timedelta(days=1),
        )
        result = _process_indicator_report(report, today)
        self.assertEqual(result, ('Overdue', report))
        self.assertEqual(report.report_status, INDICATOR_REPORT_STATUS.overdue)
        report.save.assert_called_once()

    def test_marks_due(self):
        today = date.today()
        report = _make_indicator_report(
            report_status=INDICATOR_REPORT_STATUS.submitted,
            due_date=today + timedelta(days=5),
            time_period_start=today - timedelta(days=1),
        )
        result = _process_indicator_report(report, today)
        self.assertEqual(result, ('Due', report))
        self.assertEqual(report.report_status, INDICATOR_REPORT_STATUS.due)

    def test_no_change_when_already_correct_status(self):
        today = date.today()
        report = _make_indicator_report(
            report_status=INDICATOR_REPORT_STATUS.overdue,
            due_date=today - timedelta(days=1),
        )
        result = _process_indicator_report(report, today)
        self.assertIsNone(result)
        report.save.assert_not_called()


class TestProcessProgressReport(TestCase):
    def test_marks_overdue(self):
        today = date.today()
        report = _make_progress_report(
            status=PROGRESS_REPORT_STATUS.due,
            due_date=today - timedelta(days=1),
            end_date=today - timedelta(days=5),
        )
        result = _process_progress_report(report, today)
        self.assertEqual(result, ('Overdue', report))
        self.assertEqual(report.status, PROGRESS_REPORT_STATUS.overdue)

    def test_marks_due(self):
        today = date.today()
        report = _make_progress_report(
            status=PROGRESS_REPORT_STATUS.not_yet_due,
            due_date=today + timedelta(days=5),
            end_date=today - timedelta(days=1),
        )
        result = _process_progress_report(report, today)
        self.assertEqual(result, ('Due', report))
        self.assertEqual(report.status, PROGRESS_REPORT_STATUS.due)

    def test_marks_not_yet_due(self):
        today = date.today()
        report = _make_progress_report(
            status=PROGRESS_REPORT_STATUS.due,
            due_date=today + timedelta(days=10),
            end_date=today + timedelta(days=5),
        )
        result = _process_progress_report(report, today)
        self.assertEqual(result, ('Not Yet Due', report))
        self.assertEqual(report.status, PROGRESS_REPORT_STATUS.not_yet_due)

    def test_marks_due_sr_report_type(self):
        today = date.today()
        report = _make_progress_report(
            status=PROGRESS_REPORT_STATUS.not_yet_due,
            report_type="SR",
            due_date=today + timedelta(days=5),
        )
        result = _process_progress_report(report, today)
        self.assertEqual(result, ('Due', report))
        self.assertEqual(report.status, PROGRESS_REPORT_STATUS.due)

    def test_no_change_when_already_correct_status(self):
        today = date.today()
        report = _make_progress_report(
            status=PROGRESS_REPORT_STATUS.overdue,
            due_date=today - timedelta(days=1),
            end_date=today - timedelta(days=5),
        )
        result = _process_progress_report(report, today)
        self.assertIsNone(result)
        report.save.assert_not_called()


class TestProcessDueReportsContinuesOnError(TestCase):
    @patch('etools_prp.apps.indicator.tasks.sentry_sdk.capture_exception')
    @patch('etools_prp.apps.indicator.tasks._process_indicator_report')
    @patch('etools_prp.apps.indicator.tasks.ProgressReport')
    @patch('etools_prp.apps.indicator.tasks.IndicatorReport')
    def test_indicator_report_error_continues_and_reports_to_sentry(
        self, mock_ir_cls, mock_pr_cls, mock_process_ir, mock_capture
    ):
        report1 = MagicMock(id=1)
        report2 = MagicMock(id=2)
        mock_ir_cls.objects.filter.return_value = [report1, report2]
        mock_pr_cls.objects.filter.return_value = []

        error = Exception("ir boom")

        def side_effect(report, today):
            if report.id == 1:
                raise error
            return None

        mock_process_ir.side_effect = side_effect

        process_due_reports()

        mock_capture.assert_called_once_with(error)
        # report2 was still processed
        self.assertEqual(mock_process_ir.call_count, 2)

    @patch('etools_prp.apps.indicator.tasks.sentry_sdk.capture_exception')
    @patch('etools_prp.apps.indicator.tasks._process_progress_report')
    @patch('etools_prp.apps.indicator.tasks.ProgressReport')
    @patch('etools_prp.apps.indicator.tasks.IndicatorReport')
    def test_progress_report_error_continues_and_reports_to_sentry(
        self, mock_ir_cls, mock_pr_cls, mock_process_pr, mock_capture
    ):
        report1 = MagicMock(id=1)
        report2 = MagicMock(id=2)
        mock_ir_cls.objects.filter.return_value = []
        mock_pr_cls.objects.filter.return_value = [report1, report2]

        error = Exception("pr boom")

        def side_effect(report, today):
            if report.id == 1:
                raise error
            return None

        mock_process_pr.side_effect = side_effect

        process_due_reports()

        mock_capture.assert_called_once_with(error)
        self.assertEqual(mock_process_pr.call_count, 2)
