from __future__ import unicode_literals

from django.db import models
from django.contrib.postgres.fields import FloatRangeField

from account.models import User

from activity.models import Activity

from core.models import Partner

from cluster.models import Cluster, ClusterObjective


# Create your models here.
class Project(models.Model):
    title = models.CharField(max_length=255)
    code = models.CharField(max_length=255)
    in_ops = models.BooleanField(default=False)
    geograph = models.CharField(max_length=255)
    time_period = models.DateTimeField(auto_now=True)
    budget = models.FloatField()
    status = models.CharField(max_length=255)

    cluster = models.ForeignKey(Cluster, related_name="projects")
    partner = models.ForeignKey(Partner, null=True, related_name="projects")


class ProjectParticipant(models.Model):
    owner = models.ForeignKey(User, related_name="project_participant_owners")
    donor = models.ForeignKey(User, related_name="project_participant_donors")
    implementing_partner = models.ForeignKey(Partner, related_name="project_participant_implementing_partners")
    report_agency = models.ForeignKey(Partner, related_name="project_participant_report_agencies")


class Outcome(models.Model):
    name = models.CharField(max_length=255)
    project = models.ForeignKey(Project, related_name="outcomes")


class Output(models.Model):
    name = models.CharField(max_length=255)
    project = models.ForeignKey(Project, related_name="outputs")
    

class IndicatorBlueprint(models.Model):
    name = models.CharField(max_length=255)
    activity = models.ForeignKey(Activity, related_name="indicator_blueprints")


class Indicator(models.Model):
    title = models.CharField(max_length=255)
    baseline = models.FloatField()
    target = models.FloatField()
    in_need = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    report_description = models.CharField(max_length=255)

    project = models.ForeignKey(Project, null=True, related_name="indicators")
    blueprint = models.ForeignKey(IndicatorBlueprint, null=True, related_name="indicators")
    objective = models.ForeignKey(ClusterObjective, null=True, related_name="indicators")


class IndicatorDisaggregation(models.Model):
    name = models.CharField(max_length=255)
    range = FloatRangeField()

    indicator = models.ForeignKey(Indicator, related_name="indicator_disaggregations")


class IndicatorDataSpecification(models.Model):
    name = models.CharField(max_length=255)
    calculation_method = models.CharField(max_length=255)
    frequency = models.IntegerField()
    unit = models.CharField(max_length=255)

    indicator = models.ForeignKey(Indicator, related_name="indicator_data_specifications")
