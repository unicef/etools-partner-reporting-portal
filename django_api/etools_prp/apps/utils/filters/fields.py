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
        return super().filter(qs, value).distinct()
