from django_cron import CronJobBase, Schedule

from indicator.models import IndicatorReport
from core.common import INDICATOR_REPORT_STATUS

from datetime import datetime, timedelta

class IndicatorReportOverDueCronJob(CronJobBase):
    RUN_AT_TIMES = ['0:10']

    schedule = Schedule(run_at_times=RUN_AT_TIMES)
    code = 'indicator.IndicatorReportOverDueCronJob'    # a unique code

    def do(self):
        updates = list()
        # Get all open (without submission date) indicator reports
        reports = IndicatorReport.objects.filter(submission_date__isnull=True)
        # Iterate and set proper status
        for report in reports:
            due_date = report.due_date or report.end_date + timedelta(days=15)
            if due_date < datetime.now().date() and report.report_status != INDICATOR_REPORT_STATUS.overdue:
                report.report_status = INDICATOR_REPORT_STATUS.overdue
                report.save()
                updates.append(report)

        return "Updated %s Indicator Reports with Overdue status. IDs: %s" % (len(updates), ", ".join([str(r.id) for r in updates]) ) if updates else "---"