from __future__ import unicode_literals

from django.db import models

from activity.models import Activity

from core.models import Partner

from cluster.models import Cluster, ClusterObjective


# Create your models here.
class Project(models.Model):
    name = models.CharField(max_length=255)
    cluster = models.ForeignKey(Cluster, null=True, related_name="projects")
    partner = models.ForeignKey(Partner, null=True, related_name="projects")


class IndicatorBlueprint(models.Model):
    name = models.CharField(max_length=255)
    activity = models.ForeignKey(Activity, null=True, related_name="indicator_blueprints")


class Indicator(models.Model):
    name = models.CharField(max_length=255)
    project = models.ForeignKey(Project, null=True, related_name="indicators")
    blueprint = models.ForeignKey(IndicatorBlueprint, null=True, related_name="indicators")
    objective = models.ForeignKey(ClusterObjective, null=True, related_name="indicators")
