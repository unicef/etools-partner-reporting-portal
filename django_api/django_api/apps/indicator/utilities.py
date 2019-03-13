from babel.numbers import format_number, format_percent
from django.utils.translation import to_locale, get_language

from indicator.constants import ValueType


def format_total_value_to_string(total, is_percentage=False):
    if is_percentage:
        value = total.get(ValueType.CALCULATED, 0)
        formatter = format_percent
    else:
        value = total.get(ValueType.VALUE, 0)
        formatter = format_number

    locale = to_locale(get_language())
    return formatter(value, locale=locale)


def delete_all_ilds_for_ir(indicator_report):
    """Delete all IndicatorLocationData instances for given IndicatorReport instance.

    Arguments:
        indicator_report {IndicatorReport} -- IndicatorReport instance to delete its location data from
    """

    indicator_report.indicator_location_data.all().delete()


def delete_all_irs_for_pr(progress_report):
    """Delete all IndicatorReport instances for given ProgressReport instance.

    Arguments:
        progress_report {ProgressReport} -- ProgressReport instance to delete its indicator reports from
    """

    for ir in progress_report.indicator_reports.all():
        delete_all_ilds_for_ir(ir)
        ir.delete()
