from celery import shared_task

from indicator.models import IndicatorReport
from unicef.models import ProgressReport
from core.common import INDICATOR_REPORT_STATUS, PROGRESS_REPORT_STATUS

from datetime import datetime, timedelta

OVERDUE_DAYS = 15


@shared_task
def process_due_reports():
    updates = list()
    today = datetime.now().date()
    print("Create due/overdue indicator reports")
    # Get all open (without submission date) indicator reports
    reports = IndicatorReport.objects.filter(submission_date__isnull=True)
    # Iterate and set proper status
    for report in reports:
        print("Indicator Report: %s" % report.id)
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
        print("Progress Report: %s" % report.id)
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
