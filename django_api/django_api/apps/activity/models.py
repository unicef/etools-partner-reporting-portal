from __future__ import unicode_literals

from django.db import models


# Create your models here.
class Activity(models.Model):
    title = models.CharField(max_length=255)
    standard = models.CharField(max_length=255)
    status = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tags = models.CharField(max_length=255)

    location = models.ForeignKey('core.Location', null=True, related_name="activities")
    cluster = models.ForeignKey('cluster.Cluster', null=True, related_name="activities")
    cluster_objective = models.ForeignKey('cluster.ClusterObjective', null=True, related_name="activities")
    project = models.ForeignKey('reporting.Project', related_name="activities")


class PartnerActivity(models.Model):
    name = models.CharField(max_length=255)
    activity = models.ForeignKey(Activity, related_name="partner_activites")
    project = models.ForeignKey('reporting.Project', null=True, related_name="partner_activities")
    partner = models.ForeignKey('core.Partner', related_name="partner_activities")
    cluster_activity = models.ForeignKey('cluster.ClusterActivity', related_name="partner_activities")
