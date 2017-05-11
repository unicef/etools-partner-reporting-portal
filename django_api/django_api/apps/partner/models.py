from __future__ import unicode_literals

from django.db import models

from model_utils.models import TimeStampedModel


class PartnerActivity(TimeStampedModel):
    title = models.CharField(max_length=255)
    project = models.ForeignKey('reporting.Project', null=True, related_name="partner_activities")
    partner = models.ForeignKey('core.Partner', related_name="partner_activities")
    cluster_activity = models.ForeignKey('cluster.ClusterActivity', related_name="partner_activities")
