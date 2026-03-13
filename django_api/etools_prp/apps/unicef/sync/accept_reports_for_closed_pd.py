import logging
from datetime import date

from etools_prp.apps.core.common import INDICATOR_REPORT_STATUS, PD_STATUS, PROGRESS_REPORT_STATUS
from etools_prp.apps.indicator.models import IndicatorReport
from etools_prp.apps.unicef.models import ProgrammeDocument

logger = logging.getLogger(__name__)


def accept_reports_for_closed_pd(pd: ProgrammeDocument):
    """
    When a PD is closed, automatically accept all non-accepted
    ProgressReports and IndicatorReports, and set their submission_date
    so they are excluded from the periodic process_due_reports() task.

    Uses QuerySet.update() to avoid triggering post_save signals
    (synchronize_ir_status_from_pr and send_notification_on_status_change),
    which would crash on null submitting_user for never-submitted reports.
    """
    if pd.status != PD_STATUS.closed:
        return

    today = date.today()

    non_accepted_statuses = [
        PROGRESS_REPORT_STATUS.due,
        PROGRESS_REPORT_STATUS.overdue,
        PROGRESS_REPORT_STATUS.not_yet_due,
        PROGRESS_REPORT_STATUS.submitted,
        PROGRESS_REPORT_STATUS.sent_back,
    ]
    outstanding_prs = pd.progress_reports.filter(status__in=non_accepted_statuses)

    if not outstanding_prs.exists():
        return

    pr_ids = list(outstanding_prs.values_list('id', flat=True))
    logger.info("PD %s (closed): Accepting %d outstanding progress reports: %s", pd.pk, len(pr_ids), pr_ids)

    # Update IndicatorReports first, then ProgressReports
    ir_non_accepted_statuses = [
        INDICATOR_REPORT_STATUS.due,
        INDICATOR_REPORT_STATUS.overdue,
        INDICATOR_REPORT_STATUS.submitted,
        INDICATOR_REPORT_STATUS.sent_back,
    ]
    ir_count = IndicatorReport.objects.filter(
        progress_report__in=outstanding_prs,
        report_status__in=ir_non_accepted_statuses,
    ).update(
        report_status=INDICATOR_REPORT_STATUS.accepted,
        submission_date=today,
    )
    logger.info("PD %s (closed): Accepted %d indicator reports.", pd.pk, ir_count)

    pr_count = outstanding_prs.update(
        status=PROGRESS_REPORT_STATUS.accepted,
        submission_date=today,
    )
    logger.info("PD %s (closed): Accepted %d progress reports.", pd.pk, pr_count)
