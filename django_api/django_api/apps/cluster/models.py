from __future__ import unicode_literals

from django.db import models
from django.contrib.contenttypes.fields import GenericRelation

from model_utils.models import TimeStampedModel


class Cluster(TimeStampedModel):
    title = models.CharField(max_length=255)
    intervention = models.ForeignKey('core.Intervention', related_name="clusters")
    user = models.ForeignKey('account.User', related_name="clusters")

    def __str__(self):
        return self.title


class ClusterObjective(TimeStampedModel):
    title = models.CharField(max_length=255)
    cluster = models.ForeignKey(Cluster, related_name="cluster_objectives")
    reportables = GenericRelation('indicator.Reportable', related_query_name='cluster_objectives')


class ClusterActivity(TimeStampedModel):
    title = models.CharField(max_length=255)
    cluster_objective = models.ForeignKey(ClusterObjective, related_name="cluster_activities")
    reportables = GenericRelation('indicator.Reportable', related_query_name='cluster_activities')
