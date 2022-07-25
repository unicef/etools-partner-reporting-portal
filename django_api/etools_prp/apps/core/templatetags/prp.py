from django import template
from django.conf import settings
from django.utils.safestring import mark_safe

register = template.Library()


@register.simple_tag
def matomo_settings(name):
    _settings = ("MATOMO_HOST_URL", "MATOMO_TRACKER_URL", "MATOMO_SITE_ID")
    if name in _settings:
        return mark_safe(getattr(settings, name, ''))
    return ''
