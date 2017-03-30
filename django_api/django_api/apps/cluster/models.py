from __future__ import unicode_literals

from django.db import models

from account.models import User

from core.models import Country


class Cluster(models.Model):
    name = models.CharField(max_length=255)
    country = models.ForeignKey(Country, null=True, related_name="clusters")
    user = models.ForeignKey(User, null=True, related_name="clusters")


class ClusterObjective(models.Model):
    name = models.CharField(max_length=255)
    cluster = models.ForeignKey(Cluster, null=True, related_name="objectives")
