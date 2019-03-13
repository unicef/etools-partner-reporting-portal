from babel.numbers import format_number, format_percent
from django.utils.translation import to_locale, get_language

from indicator.constants import ValueType
from indicator.models import IndicatorLocationData, IndicatorReport


def format_total_value_to_string(total, is_percentage=False):
    if is_percentage:
        value = total.get(ValueType.CALCULATED, 0)
        formatter = format_percent
    else:
        value = total.get(ValueType.VALUE, 0)
        formatter = format_number

    locale = to_locale(get_language())
    return formatter(value, locale=locale)


def reset_indicator_report_data(indicator_report):
    """Delete all IndicatorLocationData instances and generate blank IndicatorLoationData instances for given IndicatorReport instance.

    Arguments:
        indicator_report {IndicatorReport} -- IndicatorReport instance to delete its location data from
    """

    # Reset submission and status attributes
    indicator_report.total = {'c': 0, 'd': 0, 'v': 0}
    indicator_report.overall_status = "NoS"
    indicator_report.report_status = "Due"
    indicator_report.submission_date = None
    indicator_report.save()

    indicator_report.indicator_location_data.all().delete()
    reportable = indicator_report.reportable

    for location_goal in reportable.reportablelocationgoal_set.filter(is_active=True):
        IndicatorLocationData.objects.create(
            indicator_report=indicator_report,
            location=location_goal.location,
            num_disaggregation=indicator_report.disaggregations.count(),
            level_reported=indicator_report.disaggregations.count(),
            disaggregation_reported_on=list(indicator_report.disaggregations.values_list(
                'id', flat=True)),
            disaggregation={
                '()': {'c': 0, 'd': 0, 'v': 0}
            },
        )


def reset_progress_report_data(progress_report):
    """Reset all IndicatorReport instances for given ProgressReport instance by deletion and regenerating instances.

    Arguments:
        progress_report {ProgressReport} -- ProgressReport instance to delete its indicator reports from
    """

    for ir in progress_report.indicator_reports.all():
        reportable = ir.reportable
        time_period_start = ir.time_period_start
        time_period_end = ir.time_period_end
        due_date = ir.due_date
        title = ir.title
        total = {'c': 0, 'd': 0, 'v': 0}
        overall_status = "NoS"
        report_status = "Due"
        submission_date = None
        reporting_entity = ir.reporting_entity

        # Delete current indicator report and its indicator location data will be deleted in cascade
        ir.delete()

        indicator_report = IndicatorReport.objects.create(
            reportable=reportable,
            time_period_start=time_period_start,
            time_period_end=time_period_end,
            due_date=due_date,
            title=title,
            total=total,
            overall_status=overall_status,
            report_status=report_status,
            submission_date=submission_date,
            reporting_entity=reporting_entity,
        )

        reset_indicator_report_data(indicator_report)
