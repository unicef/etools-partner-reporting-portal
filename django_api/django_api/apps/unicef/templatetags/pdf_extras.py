from babel.numbers import format_currency as babel_currency_format
from django import template
from django.utils.translation import to_locale, get_language

register = template.Library()


@register.filter
def percentage(value):
    try:
        return "%.2f%%" % (float(value) * 100)
    except ValueError:
        return "N/A"


@register.simple_tag(takes_context=True)
def get_absolute_file_url(context, django_file, default='---'):
    request = context.get('request')
    if request and django_file:
        return request.build_absolute_uri(django_file.url)
    return default


@register.inclusion_tag('fragments/programme_information.html')
def render_base_programme_info_for_report(report):
    funds_received_to_date_percentage = "%.1f" % (
            report.programme_document.funds_received_to_date * 100 / report.programme_document.budget
        ) if report.programme_document and report.programme_document.budget > 0 else 0

    context = {
        'report': report,
        'pd': report.programme_document,
        'authorized_officer': report.programme_document.unicef_officers.first(),
        'focal_point': report.programme_document.unicef_focal_point.first(),
        'funds_received_to_date_percentage': funds_received_to_date_percentage
    }

    return context


@register.filter
def format_currency(amount, currency='USD'):
    locale = to_locale(get_language())
    if amount:
        return babel_currency_format(amount, currency, locale=locale)
    return '0'
