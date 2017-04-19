from __future__ import unicode_literals

from django.db import models


class IndicatorReport(models.Model):
    name = models.CharField(max_length=255)
    reportable = models.ForeignKey('reporting.Reportable', related_name="indicator_reports")
    location = models.OneToOneField('core.Location', related_name="indicator_report", null=True)
    time_period = models.DateTimeField(auto_now=True)


class ProgressReport(models.Model):
    narrative = models.CharField(max_length=255)
    progress_report = models.OneToOneField(IndicatorReport, related_name="progress_report")
