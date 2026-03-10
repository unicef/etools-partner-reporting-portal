from datetime import date

from etools_prp.apps.core.common import (
    INDICATOR_REPORT_STATUS,
    OVERALL_STATUS,
    PROGRESS_REPORT_STATUS,
)
from etools_prp.apps.core.tests import factories
from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.indicator.models import IndicatorBlueprint, IndicatorReport
from etools_prp.apps.unicef.models import ProgressReport
from etools_prp.apps.unicef.sync.accept_reports_for_closed_pd import accept_reports_for_closed_pd


class TestAcceptReportsForClosedPD(BaseAPITestCase):

    def setUp(self):
        self.workspace = factories.WorkspaceFactory()
        self.pd = factories.ProgrammeDocumentFactory(
            workspace=self.workspace,
            status='closed',
        )
        self.cp_output = factories.PDResultLinkFactory(programme_document=self.pd)
        self.llo = factories.LowerLevelOutputFactory(cp_output=self.cp_output)
        self.reportable = factories.QuantityReportableToLowerLevelOutputFactory(
            content_object=self.llo,
            blueprint=factories.QuantityTypeIndicatorBlueprintFactory(
                unit=IndicatorBlueprint.NUMBER,
                calculation_formula_across_locations=IndicatorBlueprint.SUM,
            ),
        )
        super().setUp()

    def _create_pr_with_ir(self, pr_status, ir_status, report_number, submission_date=None):
        pr = factories.ProgressReportFactory(
            programme_document=self.pd,
            report_number=report_number,
            report_type='QPR',
            status=pr_status,
            start_date='2024-01-01',
            end_date='2024-03-31',
            due_date='2024-04-15',
            submitted_by=None,
            submitting_user=None,
            submission_date=submission_date,
        )
        ir = factories.ProgressReportIndicatorReportFactory(
            progress_report=pr,
            reportable=self.reportable,
            report_status=ir_status,
            overall_status=OVERALL_STATUS.met,
            submission_date=submission_date,
        )
        return pr, ir

    def test_accepts_due_reports(self):
        pr, ir = self._create_pr_with_ir(
            PROGRESS_REPORT_STATUS.due,
            INDICATOR_REPORT_STATUS.due,
            report_number=1,
        )

        accept_reports_for_closed_pd(self.pd)

        pr.refresh_from_db()
        ir.refresh_from_db()
        self.assertEqual(pr.status, PROGRESS_REPORT_STATUS.accepted)
        self.assertEqual(pr.submission_date, date.today())
        self.assertEqual(ir.report_status, INDICATOR_REPORT_STATUS.accepted)
        self.assertEqual(ir.submission_date, date.today())

    def test_accepts_overdue_reports(self):
        pr, ir = self._create_pr_with_ir(
            PROGRESS_REPORT_STATUS.overdue,
            INDICATOR_REPORT_STATUS.overdue,
            report_number=1,
        )

        accept_reports_for_closed_pd(self.pd)

        pr.refresh_from_db()
        ir.refresh_from_db()
        self.assertEqual(pr.status, PROGRESS_REPORT_STATUS.accepted)
        self.assertEqual(ir.report_status, INDICATOR_REPORT_STATUS.accepted)

    def test_accepts_not_yet_due_reports(self):
        pr, ir = self._create_pr_with_ir(
            PROGRESS_REPORT_STATUS.not_yet_due,
            INDICATOR_REPORT_STATUS.due,
            report_number=1,
        )

        accept_reports_for_closed_pd(self.pd)

        pr.refresh_from_db()
        ir.refresh_from_db()
        self.assertEqual(pr.status, PROGRESS_REPORT_STATUS.accepted)
        self.assertEqual(ir.report_status, INDICATOR_REPORT_STATUS.accepted)

    def test_accepts_submitted_reports(self):
        pr, ir = self._create_pr_with_ir(
            PROGRESS_REPORT_STATUS.submitted,
            INDICATOR_REPORT_STATUS.submitted,
            report_number=1,
        )

        accept_reports_for_closed_pd(self.pd)

        pr.refresh_from_db()
        ir.refresh_from_db()
        self.assertEqual(pr.status, PROGRESS_REPORT_STATUS.accepted)
        self.assertEqual(ir.report_status, INDICATOR_REPORT_STATUS.accepted)

    def test_accepts_sent_back_reports(self):
        pr, ir = self._create_pr_with_ir(
            PROGRESS_REPORT_STATUS.sent_back,
            INDICATOR_REPORT_STATUS.sent_back,
            report_number=1,
        )

        accept_reports_for_closed_pd(self.pd)

        pr.refresh_from_db()
        ir.refresh_from_db()
        self.assertEqual(pr.status, PROGRESS_REPORT_STATUS.accepted)
        self.assertEqual(ir.report_status, INDICATOR_REPORT_STATUS.accepted)

    def test_does_not_touch_already_accepted_reports(self):
        original_date = date(2024, 1, 15)
        pr, ir = self._create_pr_with_ir(
            PROGRESS_REPORT_STATUS.accepted,
            INDICATOR_REPORT_STATUS.accepted,
            report_number=1,
            submission_date=original_date,
        )

        accept_reports_for_closed_pd(self.pd)

        pr.refresh_from_db()
        ir.refresh_from_db()
        self.assertEqual(pr.status, PROGRESS_REPORT_STATUS.accepted)
        self.assertEqual(pr.submission_date, original_date)
        self.assertEqual(ir.report_status, INDICATOR_REPORT_STATUS.accepted)
        self.assertEqual(ir.submission_date, original_date)

    def test_no_op_for_non_closed_pd(self):
        self.pd.status = 'active'
        self.pd.save()

        pr, ir = self._create_pr_with_ir(
            PROGRESS_REPORT_STATUS.overdue,
            INDICATOR_REPORT_STATUS.overdue,
            report_number=1,
        )

        accept_reports_for_closed_pd(self.pd)

        pr.refresh_from_db()
        ir.refresh_from_db()
        self.assertEqual(pr.status, PROGRESS_REPORT_STATUS.overdue)
        self.assertEqual(ir.report_status, INDICATOR_REPORT_STATUS.overdue)

    def test_no_op_when_no_outstanding_reports(self):
        original_date = date(2024, 1, 15)
        self._create_pr_with_ir(
            PROGRESS_REPORT_STATUS.accepted,
            INDICATOR_REPORT_STATUS.accepted,
            report_number=1,
            submission_date=original_date,
        )

        # Should not raise any exception
        accept_reports_for_closed_pd(self.pd)

        self.assertEqual(
            ProgressReport.objects.filter(
                programme_document=self.pd,
                status=PROGRESS_REPORT_STATUS.accepted,
            ).count(),
            1,
        )

    def test_mixed_statuses(self):
        pr_due, ir_due = self._create_pr_with_ir(
            PROGRESS_REPORT_STATUS.due,
            INDICATOR_REPORT_STATUS.due,
            report_number=1,
        )
        pr_overdue, ir_overdue = self._create_pr_with_ir(
            PROGRESS_REPORT_STATUS.overdue,
            INDICATOR_REPORT_STATUS.overdue,
            report_number=2,
        )
        original_date = date(2024, 1, 15)
        pr_accepted, ir_accepted = self._create_pr_with_ir(
            PROGRESS_REPORT_STATUS.accepted,
            INDICATOR_REPORT_STATUS.accepted,
            report_number=3,
            submission_date=original_date,
        )

        accept_reports_for_closed_pd(self.pd)

        # Due and overdue should now be accepted
        for pr, ir in [(pr_due, ir_due), (pr_overdue, ir_overdue)]:
            pr.refresh_from_db()
            ir.refresh_from_db()
            self.assertEqual(pr.status, PROGRESS_REPORT_STATUS.accepted)
            self.assertEqual(ir.report_status, INDICATOR_REPORT_STATUS.accepted)
            self.assertEqual(pr.submission_date, date.today())
            self.assertEqual(ir.submission_date, date.today())

        # Already accepted should be unchanged
        pr_accepted.refresh_from_db()
        ir_accepted.refresh_from_db()
        self.assertEqual(pr_accepted.status, PROGRESS_REPORT_STATUS.accepted)
        self.assertEqual(pr_accepted.submission_date, original_date)
        self.assertEqual(ir_accepted.submission_date, original_date)

    def test_sets_submission_date_for_process_due_reports_exclusion(self):
        pr, ir = self._create_pr_with_ir(
            PROGRESS_REPORT_STATUS.overdue,
            INDICATOR_REPORT_STATUS.overdue,
            report_number=1,
        )
        self.assertIsNone(pr.submission_date)

        accept_reports_for_closed_pd(self.pd)

        pr.refresh_from_db()
        ir.refresh_from_db()
        self.assertIsNotNone(pr.submission_date)
        self.assertIsNotNone(ir.submission_date)

        open_irs = IndicatorReport.objects.filter(submission_date__isnull=True)
        self.assertNotIn(ir, open_irs)
        open_prs = ProgressReport.objects.filter(submission_date__isnull=True)
        self.assertNotIn(pr, open_prs)
