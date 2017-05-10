from __future__ import unicode_literals

from django.db import models


class Cluster(models.Model):
    name = models.CharField(max_length=255)
    country = models.ForeignKey('core.Country', related_name="clusters")
    user = models.ForeignKey('account.User', related_name="clusters")

    def __unicode__(self):
        return self.name


class ClusterObjective(models.Model):
    name = models.CharField(max_length=255)
    cluster = models.ForeignKey(Cluster, related_name="cluster_objectives")

    def __unicode__(self):
        return self.name


class ClusterActivity(models.Model):
    name = models.CharField(max_length=255)
    cluster = models.ForeignKey(Cluster, related_name="cluster_activities", null=True)
    cluster_objective = models.ForeignKey(ClusterObjective, related_name="cluster_activities", null=True)
    project = models.ForeignKey('reporting.Project', related_name="cluster_activities")

    def __unicode__(self):
        return self.name
