from django.db import transaction
from django.utils.translation import get_language, to_locale

from babel.numbers import format_decimal, format_percent

from etools_prp.apps.core.helpers import create_ir_and_ilds_for_pr
from etools_prp.apps.indicator.constants import ValueType


def convert_string_number_to_float(num):
    return float(num.replace(',', '')) if type(num) == str else float(num)


def format_total_value_to_string(total, is_percentage=False, percentage_display_type=None):
    value = total.get(ValueType.VALUE, 0)
    locale = to_locale(get_language())

    if is_percentage:
        denominator = total.get(ValueType.DENOMINATOR, 1)
        if percentage_display_type and percentage_display_type == 'ratio':
            return f"{value}/{denominator}"
        else:
            value = 0 if denominator == 0 else value / denominator
            formatter = format_percent
    else:
        formatter = format_decimal
    return formatter(value, locale=locale)


def reset_indicator_report_data(indicator_report):
    """Delete all IndicatorLocationData instances and generate blank IndicatorLoationData instances for given IndicatorReport instance.

    Arguments:
        indicator_report {IndicatorReport} -- IndicatorReport instance to delete its location data from
    """
    from etools_prp.apps.indicator.models import IndicatorLocationData

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

    # Delete all current indicator reports and their indicator location data will be deleted in cascade
    progress_report.indicator_reports.all().delete()

    pd = progress_report.programme_document

    # Get Active LLO indicators only
    reportable_queryset = pd.reportable_queryset.filter(active=True)

    with transaction.atomic():
        create_ir_and_ilds_for_pr(
            pd,
            reportable_queryset,
            progress_report,
            progress_report.start_date,
            progress_report.end_date,
            progress_report.due_date
        )
