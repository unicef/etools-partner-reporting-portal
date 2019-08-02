import os
from babel.numbers import format_currency as babel_currency_format
from django import template
from django.conf import settings
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
    elif django_file:
        return django_file.url
    return default


@register.inclusion_tag('fragments/programme_information.html')
def render_base_programme_info_for_report(report):
    context = {
        'report': report,
        'pd': report.programme_document,
        'authorized_officer': report.programme_document.unicef_officers.filter(active=True).first(),
        'focal_point': report.programme_document.partner_focal_point.filter(active=True).first(),
    }

    return context


@register.filter
def format_currency(amount, currency='USD'):
    locale = to_locale(get_language())
    if amount:
        return babel_currency_format(amount, currency, locale=locale)
    return '0'


@register.simple_tag
def filesystem_static_path(filename):
    return os.path.join(
        settings.BASE_DIR,
        'static',
        filename
    )
