import logging
from datetime import datetime, timedelta

from celery import shared_task
from core.common import INDICATOR_REPORT_STATUS, PROGRESS_REPORT_STATUS
from indicator.models import IndicatorReport
from unicef.models import ProgressReport
from utils.emails import send_due_progress_report_email, send_overdue_progress_report_email

logger = logging.getLogger(__name__)
OVERDUE_DAYS = 15


@shared_task
def process_due_reports():
    updates = list()
    today = datetime.now().date()
    logger.info("Create due/overdue indicator reports")
    # Get all open (without submission date) indicator reports
    reports = IndicatorReport.objects.filter(submission_date__isnull=True)
    # Iterate and set proper status
    for report in reports:
        logger.info("Indicator Report: %s" % report.id)
        due_date = report.due_date or report.time_period_end + timedelta(days=OVERDUE_DAYS)
        if due_date < today and report.report_status != INDICATOR_REPORT_STATUS.overdue:
            report.report_status = INDICATOR_REPORT_STATUS.overdue
            report.save()
            updates.append(['Overdue', report])
        elif due_date > today > report.time_period_start and report.report_status != INDICATOR_REPORT_STATUS.due:
            report.report_status = INDICATOR_REPORT_STATUS.due
            report.save()
            updates.append(['Due', report])

    reports = ProgressReport.objects.filter(submission_date__isnull=True)
    # Iterate and set proper status
    for report in reports:
        logger.info("Progress Report: %s" % report.id)
        due_date = report.due_date or report.end_date + timedelta(days=OVERDUE_DAYS)
        if due_date < today and report.status != PROGRESS_REPORT_STATUS.overdue:
            report.status = PROGRESS_REPORT_STATUS.overdue
            report.save()
            updates.append(['Overdue', report])
        elif (report.report_type != "SR" and due_date > today > report.start_date) \
                or (report.report_type == "SR" and due_date > today) \
                and report.status != PROGRESS_REPORT_STATUS.due:
            report.status = PROGRESS_REPORT_STATUS.due
            report.save()
            updates.append(['Due', report])

    return "Updated %s Reports: %s" % (len(updates), ", ".join(["(%s for ID %d)" % (
        status, report.id) for status, report in updates])) if updates else "---"


@shared_task
def notify_ip_due_reports():
    return send_due_progress_report_email()


@shared_task
def notify_ip_overdue_reports():
    return send_overdue_progress_report_email()
