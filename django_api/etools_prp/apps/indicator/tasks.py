import logging
from datetime import datetime, timedelta

import sentry_sdk
from celery import shared_task

from etools_prp.apps.core.common import INDICATOR_REPORT_STATUS, PROGRESS_REPORT_STATUS
from etools_prp.apps.indicator.models import IndicatorReport
from etools_prp.apps.unicef.models import ProgressReport
from etools_prp.apps.utils.emails import send_due_progress_report_email, send_overdue_progress_report_email

logger = logging.getLogger(__name__)
OVERDUE_DAYS = 15


def _process_indicator_report(report, today):
    """
    Update the status of a single IndicatorReport based on its due date.

    Sets status to 'overdue' if the due date has passed, or 'due' if today falls
    within the reporting period. Returns a (label, report) tuple if a change was
    made, or None if no update was needed.
    """
    due_date = report.due_date or report.time_period_end + timedelta(days=OVERDUE_DAYS)
    if due_date < today and report.report_status != INDICATOR_REPORT_STATUS.overdue:
        report.report_status = INDICATOR_REPORT_STATUS.overdue
        report.save()
        return ('Overdue', report)
    elif due_date > today > report.time_period_start and report.report_status != INDICATOR_REPORT_STATUS.due:
        report.report_status = INDICATOR_REPORT_STATUS.due
        report.save()
        return ('Due', report)
    return None


def _process_progress_report(report, today):
    """
    Update the status of a single ProgressReport based on its due date and report type.

    Sets status to 'overdue', 'due', or 'not yet due' depending on where today falls
    relative to the report's end date and due date. SR reports follow slightly different
    date rules than QPR/HR reports. Returns a (label, report) tuple if a change was
    made, or None if no update was needed.
    """
    due_date = report.due_date or report.end_date + timedelta(days=OVERDUE_DAYS)
    if due_date < today and report.status != PROGRESS_REPORT_STATUS.overdue:
        report.status = PROGRESS_REPORT_STATUS.overdue
        report.save(update_fields=['status'])
        return ('Overdue', report)
    elif (report.report_type != "SR" and report.end_date and report.end_date <= today < due_date) \
            or (report.report_type == "SR" and due_date > today) \
            and report.status != PROGRESS_REPORT_STATUS.due:
        report.status = PROGRESS_REPORT_STATUS.due
        report.save(update_fields=['status'])
        return ('Due', report)
    elif (report.report_type != "SR" and report.end_date and report.end_date > today) \
            and report.status != PROGRESS_REPORT_STATUS.not_yet_due:
        report.status = PROGRESS_REPORT_STATUS.not_yet_due
        report.save(update_fields=['status'])
        return ('Not Yet Due', report)
    return None


@shared_task
def process_due_reports():
    updates = list()
    today = datetime.now().date()
    logger.info("Create due/overdue indicator reports")

    for report in IndicatorReport.objects.filter(submission_date__isnull=True):
        logger.info("Indicator Report: %s" % report.id)
        try:
            result = _process_indicator_report(report, today)
            if result:
                updates.append(result)
        except Exception as e:
            logger.exception("Error processing IndicatorReport %s: %s" % (report.id, e))
            sentry_sdk.capture_exception(e)

    for report in ProgressReport.objects.filter(submission_date__isnull=True):
        logger.info("Progress Report: %s" % report.id)
        try:
            result = _process_progress_report(report, today)
            if result:
                updates.append(result)
        except Exception as e:
            logger.exception("Error processing ProgressReport %s: %s" % (report.id, e))
            sentry_sdk.capture_exception(e)

    return "Updated %s Reports: %s" % (len(updates), ", ".join(["(%s for ID %d)" % (
        status, report.id) for status, report in updates])) if updates else "---"


@shared_task
def notify_ip_due_reports():
    return send_due_progress_report_email()


@shared_task
def notify_ip_overdue_reports():
    return send_overdue_progress_report_email()
