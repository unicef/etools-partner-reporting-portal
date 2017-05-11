from __future__ import unicode_literals

from django.db import models

from model_utils.models import TimeStampedModel


class ProgressReport(TimeStampedModel):
    narrative = models.CharField(max_length=255)
    progress_report = models.OneToOneField('indicator.IndicatorReport', related_name="progress_report")
