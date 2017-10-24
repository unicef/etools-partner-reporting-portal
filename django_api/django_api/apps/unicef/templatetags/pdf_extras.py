from django import template

register = template.Library()


@register.filter
def percentage(value):
    try:
        return "%.2f%%" % (float(value) * 100)
    except ValueError:
        return "N/A"
