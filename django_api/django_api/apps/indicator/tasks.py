import logging
from datetime import datetime, date, timedelta
from dateutil.relativedelta import relativedelta

from celery import shared_task

from indicator.models import IndicatorReport
from unicef.models import ProgressReport
from core.common import INDICATOR_REPORT_STATUS, PROGRESS_REPORT_STATUS
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
    logger.info("Notifying IP due progress reports")
    notified = list()

    today = date.today()
    unsubmitted_due_reports = ProgressReport.objects.filter(
        submission_date__isnull=True,
        status=PROGRESS_REPORT_STATUS.due,
        due_date=today + relativedelta(days=7),
    )

    for report in unsubmitted_due_reports:
        send_due_progress_report_email(report)
        notified.append(report.id)

    return "Sent emails for %s Due Report IDs: %s" % (len(notified), ", ".join(notified)) if notified else "---"


@shared_task
def notify_ip_overdue_reports():
    logger.info("Notifying IP overdue progress reports")
    notified = list()

    unsubmitted_overdue_reports = ProgressReport.objects.filter(
        submission_date__isnull=True,
        status=PROGRESS_REPORT_STATUS.overdue,
    )

    for report in unsubmitted_overdue_reports:
        send_overdue_progress_report_email(report)
        notified.append(report.id)

    return "Sent emails for %s Overdue Report IDs: %s" % (len(notified), ", ".join(notified)) if notified else "---"
