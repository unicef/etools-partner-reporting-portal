from __future__ import unicode_literals

from django.db import models

from account.models import User

from core.models import Country


class Cluster(models.Model):
    name = models.CharField(max_length=255)
    country = models.ForeignKey(Country, related_name="clusters")
    user = models.ForeignKey(User, related_name="clusters")


class ClusterObjective(models.Model):
    name = models.CharField(max_length=255)
    cluster = models.ForeignKey(Cluster, related_name="cluster_objectives")
