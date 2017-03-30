from __future__ import unicode_literals

from django.db import models

from core.models import Location

from reporting.models import Indicator


# Create your models here.
class IndicatorReport(models.Model):
    name = models.CharField(max_length=255)
    indicator = models.ForeignKey(Indicator, related_name="indicator_reports")
    location = models.ForeignKey(Location, related_name="indicator_reports")
