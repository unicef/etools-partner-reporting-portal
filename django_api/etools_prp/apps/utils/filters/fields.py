from urllib import parse

from django_filters import CharFilter


class CommaSeparatedListFilter(CharFilter):
    separator = ','

    def __init__(self, lookup_expr='in', separator=None, *args, **kwargs):
        if separator:
            self.separator = separator
        super().__init__(*args, lookup_expr=lookup_expr, **kwargs)

    def filter(self, qs, value):
        value = parse.unquote(value).split(self.separator)
        value = list(filter(None, value))
        # Ensure consistent ordering for distinct() in Django 4.2
        result = super().filter(qs, value)
        # Preserve existing ordering or add default ordering before distinct
        if not result.query.order_by:
            result = result.order_by('id')
        return result.distinct()
