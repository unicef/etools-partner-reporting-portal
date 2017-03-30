from __future__ import unicode_literals

from django.db import models

from account.models import User

from cluster.models import Cluster


class Intervention(models.Model):
    name = models.CharField(max_length=255)


class Country(models.Model):
    name = models.CharField(max_length=255)
    intervention = models.ForeignKey(
        Intervention, null=True, related_name="countries")


class Partner(models.Model):
    name = models.CharField(max_length=255)
    cluster = models.ForeignKey(Cluster, null=True, related_name="partners")
