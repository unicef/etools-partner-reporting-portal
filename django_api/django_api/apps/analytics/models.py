from __future__ import unicode_literals

from django.db import models


# Create your models here.
class IndicatorReport(models.Model):
    name = models.CharField(max_length=255)
    indicator = models.ForeignKey('reporting.Indicator', related_name="indicator_reports")
    location = models.ForeignKey('core.Location', related_name="indicator_reports")
