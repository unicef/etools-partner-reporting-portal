import datetime

from django.conf import settings
from rest_framework import serializers


class SortedDateArrayField(serializers.ListField):
    def to_representation(self, value):
        dates = []
        for v in value:
            if isinstance(v, str):
                v = datetime.datetime.strptime(
                    v,
                    settings.INPUT_DATA_FORMAT,
                ).date()
            dates.append(v.strftime(settings.DATE_FORMAT))
        return dates

    def to_internal_value(self, value):
        return sorted(super().to_internal_value(value))
