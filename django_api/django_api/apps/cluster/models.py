from __future__ import unicode_literals

from django.db import models
from django.contrib.contenttypes.fields import GenericRelation

from model_utils.models import TimeStampedModel

from core.common import FREQUENCY_LEVEL


class Cluster(TimeStampedModel):
    title = models.CharField(max_length=255)
    intervention = models.ForeignKey('core.Intervention', related_name="clusters")
    user = models.ForeignKey('account.User', related_name="clusters")

    def __str__(self):
        return "<pk: %s> %s" % (self.id, self.title)


class ClusterObjective(TimeStampedModel):
    title = models.CharField(max_length=255, verbose_name='Cluster Objective Title')
    reference_number = models.CharField(max_length=255, verbose_name='Reference Number')
    cluster = models.ForeignKey(Cluster, related_name="cluster_objectives")
    frequency = models.CharField(
        max_length=3,
        choices=FREQUENCY_LEVEL,
        default=FREQUENCY_LEVEL.monthly,
        verbose_name='Frequency of reporting'
    )
    reportables = GenericRelation('indicator.Reportable', related_query_name='cluster_objectives')

    def __str__(self):
        return "<pk: %s> %s" % (self.id, self.title)


class ClusterActivity(TimeStampedModel):
    title = models.CharField(max_length=255)
    cluster_objective = models.ForeignKey(ClusterObjective, related_name="cluster_activities")
    reportables = GenericRelation('indicator.Reportable', related_query_name='cluster_activities')

    def __str__(self):
        return "<pk: %s> %s" % (self.id, self.title)
