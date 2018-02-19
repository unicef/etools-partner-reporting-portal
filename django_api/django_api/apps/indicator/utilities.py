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
