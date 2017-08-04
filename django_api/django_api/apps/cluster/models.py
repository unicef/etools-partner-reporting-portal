from __future__ import unicode_literals

from django.db import models
from django.db.models import Q
from django.utils.functional import cached_property
from django.contrib.contenttypes.fields import GenericRelation

from model_utils.models import TimeStampedModel

from core.common import FREQUENCY_LEVEL, INDICATOR_REPORT_STATUS

from indicator.models import Reportable, IndicatorReport
from partner.models import PartnerActivity


class Cluster(TimeStampedModel):
    """
    Cluster model it is a group of partners that cooperate to reach the same goal
    (Removal of the humanitarian crisis). We can divide clusters to few types for example
    Partners will belong to Education, that are working on this background.

    related models:
        core.Intervention (ForeignKey): "intervention"
        account.User (ForeignKey): "user"
    """
    title = models.CharField(max_length=255)
    # intervention = models.ForeignKey('core.Intervention', related_name="clusters")
    response_plan = models.ForeignKey('core.ResponsePlan', null=True, related_name="clusters")
    user = models.ForeignKey('account.User', related_name="clusters")

    def __str__(self):
        return "<pk: %s> %s" % (self.id, self.title)

    @property
    def num_of_partners(self):
        return self.partners.count()

    @property
    def num_of_met_indicators(self):
        fully_achieved_indicators = filter(lambda x: int(x.progress_percentage) == 100, self.reportable_queryset)

        return len(fully_achieved_indicators)

    @property
    def num_of_constrained_indicators(self):
        return len(self.constrained_indicators)

    @property
    def num_of_non_cluster_activities(self):
        return self.partner_activities.count()

    @cached_property
    def partner_activities(self):
        partner_activities = PartnerActivity.objects.filter(
            cluster_activity__in=self.cluster_activities
        )

        return partner_activities

    @cached_property
    def cluster_activities(self):
        cluster_activities = ClusterActivity.objects.filter(
            cluster_objective__cluster=self,
        )

        return cluster_activities

    @cached_property
    def reportable_queryset(self):
        cluster_reportables = Reportable.objects.filter(
            Q(cluster_objectives__cluster=self)
            | Q(cluster_activities__cluster_objective__cluster=self)
        )

        return cluster_reportables

    @cached_property
    def indicator_report_queryset(self):
        indicator_reports = IndicatorReport.objects.filter(
            reportable__in=self.reportable_queryset,
        )

        return indicator_reports

    @cached_property
    def new_indicator_reports(self):
        return self.indicator_report_queryset.filter(
            report_status=INDICATOR_REPORT_STATUS.due
        )

    @cached_property
    def overdue_indicator_reports(self):
        return self.indicator_report_queryset.filter(
            report_status=INDICATOR_REPORT_STATUS.overdue
        )

    @cached_property
    def constrained_indicators(self):
        return filter(lambda x: int(x.progress_percentage) != 100, self.reportable_queryset)

    def num_of_due_overdue_indicator_reports_partner(self, partner=None):
        overdue = self.overdue_indicator_reports.filter(
            reportable__partner_activities__partner=partner)

        due = self.new_indicator_reports.filter(
            reportable__partner_activities__partner=partner)

        return overdue.count() + due.count()

    def num_of_indicator_targets_met_partner(self, partner=None):
        return len(filter(lambda x: int(x.progress_percentage) == 100, self.reportable_queryset.filter(
            partner_activities__partner=partner
        )))

    def num_of_projects_in_my_organization_partner(self, partner=None):
        return partner.partner_projects.filter(clusters=self).count()

    def num_of_constrained_indicators_partner(self, partner=None):
        return len(self.constrained_indicators_partner(partner))

    def num_of_non_cluster_activities_partner(self, partner=None):
        return self.num_of_non_cluster_activities

    def overdue_indicator_reports_partner(self, partner=None):
        return self.overdue_indicator_reports.filter(
            reportable__partner_activities__partner=partner)

    def my_project_activities_partner(self, partner=None):
        return partner.partner_activities.filter(
            cluster_activity__cluster_objective__cluster=self)

    def constrained_indicators_partner(self, partner=None):
        return filter(lambda x: int(x.progress_percentage) != 100, self.reportable_queryset.filter(
            partner_activities__partner=partner
        ))


class ClusterObjective(TimeStampedModel):
    """
    ClusterObjective model is goal of cluster. This goal should be reached via whole cluster aspect.
    For example - to build 3'000 schools at some country.

    related models:
        cluster.Cluster (ForeignKey): "cluster"
        indicator.Reportable (GenericRelation): "reportables"
    """
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

    class Meta:
        ordering = ['id']

    def __str__(self):
        return "<pk: %s> %s" % (self.id, self.title)


class ClusterActivity(TimeStampedModel):
    """
    ClusterActivity models is an action, which one to take, to reach the goal (that is defined in ClusterObjective).

    related models:
        cluster.ClusterObjective (ForeignKey): "cluster_objective"
        indicator.Reportable (GenericRelation): "reportables"
    """
    title = models.CharField(max_length=255)
    standard = models.CharField(max_length=255)
    frequency = models.CharField(
        max_length=3,
        choices=FREQUENCY_LEVEL,
        default=FREQUENCY_LEVEL.monthly,
        verbose_name='Frequency of reporting'
    )
    cluster_objective = models.ForeignKey(ClusterObjective, related_name="cluster_activities")
    reportables = GenericRelation('indicator.Reportable', related_query_name='cluster_activities')

    class Meta:
        ordering = ['id']

    def __str__(self):
        return "<pk: %s> %s" % (self.id, self.title)
