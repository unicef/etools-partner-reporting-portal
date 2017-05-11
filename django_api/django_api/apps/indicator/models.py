from __future__ import unicode_literals

from django.contrib.postgres.fields import JSONField
from django.db import models

from model_utils.models import TimeStampedModel

from core.common import INDICATOR_REPORT_STATUS


class IndicatorReport(TimeStampedModel):
    name = models.CharField(max_length=255)
    reportable = models.ForeignKey('reporting.Reportable', related_name="indicator_reports")
    location = models.OneToOneField('core.Location', related_name="indicator_report", null=True)
    time_period = models.DateTimeField(auto_now=True)

    total = models.PositiveIntegerField(blank=True, null=True)
    is_disaggregated_report = models.BooleanField(default=False)
    disaggregation = JSONField(default=dict)
    remarks = models.TextField(blank=True, null=True)
    report_status = models.CharField(
        choices=INDICATOR_REPORT_STATUS,
        default=INDICATOR_REPORT_STATUS.ontrack,
        max_length=3
    )
