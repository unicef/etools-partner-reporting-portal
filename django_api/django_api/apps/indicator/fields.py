import datetime

from rest_framework import serializers


class SortedDateArrayField(serializers.Field):
    def to_representation(self, value):
        dates = []
        for v in value:
            if isinstance(v, str):
                v = datetime.datetime.strptime(v, "%Y-%m-%d").date()
            dates.append(v.strftime("%d-%b-%Y"))
        return sorted(dates)

    def to_internal_value(self, data):
        return data
