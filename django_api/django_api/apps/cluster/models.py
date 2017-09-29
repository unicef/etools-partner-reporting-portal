from __future__ import unicode_literals
import datetime

from django.db import models
from django.db.models import Q
from django.utils.functional import cached_property
from django.contrib.contenttypes.fields import GenericRelation

from model_utils.models import TimeStampedModel

from core.common import (
    FREQUENCY_LEVEL,
    INDICATOR_REPORT_STATUS,
    OVERALL_STATUS,
    CLUSTER_TYPES,
)

from indicator.models import Reportable, IndicatorReport
from partner.models import PartnerActivity


class Cluster(TimeStampedModel):
    """
    Cluster model it is a group of partners that cooperate to reach the same
    goal (Removal of the humanitarian crisis). We can divide clusters to few
    types for example Partners will belong to Education, that are working on
    this background.

    related models:
        core.Workspace (ForeignKey): "intervention"

    """
    type = models.CharField(max_length=32, choices=CLUSTER_TYPES)
    response_plan = models.ForeignKey('core.ResponsePlan', null=True,
                                      related_name="clusters")

    class Meta:
        """One response plan can only have a cluster of one type."""

        unique_together = ('type', 'response_plan')

    def __str__(self):
        return "<pk: %s> %s" % (self.id, self.type)

    @property
    def num_of_partners(self):
        return self.partners.count()

    @property
    def num_of_met_indicator_reports(self):
        return self.met_indicator_reports.count()

    @property
    def num_of_constrained_indicator_reports(self):
        return self.constrained_indicator_reports.count()

    @property
    def num_of_on_track_indicator_reports(self):
        return self.on_track_indicator_reports.count()

    @property
    def num_of_no_progress_indicator_reports(self):
        return self.no_progress_indicator_reports.count()

    @property
    def num_of_no_status_indicator_reports(self):
        return self.no_status_indicator_reports.count()

    @property
    def num_of_non_cluster_activities(self):
        return self.partner_activities.filter(
            cluster_activity__isnull=True).count()

    @cached_property
    def partner_activities(self):
        id_list = self.partners.values_list('partner_activities', flat=True).distinct()

        return PartnerActivity.objects.filter(
            id__in=id_list
        )

    @cached_property
    def cluster_activities(self):
        cluster_activities = ClusterActivity.objects.filter(
            cluster_objective__cluster=self,
        )

        return cluster_activities

    @cached_property
    def reportable_queryset(self):
        cluster_reportables = Reportable.objects.filter(
            Q(partner_activities__partner__clusters=self)
        ).distinct()

        return cluster_reportables

    @cached_property
    def latest_indicator_reports(self):
        reportables = list(self.reportable_queryset)
        id_list = []

        for r in reportables:
            latest = r.indicator_reports.latest('id')
            id_list.append(latest.id)

        return IndicatorReport.objects.filter(id__in=id_list)

    @cached_property
    def overdue_indicator_reports(self):
        return self.latest_indicator_reports.filter(
            report_status=INDICATOR_REPORT_STATUS.overdue)

    @cached_property
    def due_indicator_reports(self):
        return self.latest_indicator_reports.filter(
            report_status=INDICATOR_REPORT_STATUS.due)

    @cached_property
    def submitted_indicator_reports(self):
        return self.latest_indicator_reports.filter(
            report_status=INDICATOR_REPORT_STATUS.submitted)

    @cached_property
    def new_indicator_reports(self):
        today = datetime.date.today()
        return filter(
            lambda item: (today - item.submission_date).days <= 15,
            self.submitted_indicator_reports)

    @cached_property
    def met_indicator_reports(self):
        return self.submitted_indicator_reports.filter(
            overall_status=OVERALL_STATUS.met
        )

    @cached_property
    def constrained_indicator_reports(self):
        return self.submitted_indicator_reports.filter(
            overall_status=OVERALL_STATUS.constrained
        )

    @cached_property
    def on_track_indicator_reports(self):
        return self.submitted_indicator_reports.filter(
            overall_status=OVERALL_STATUS.on_track,
        )

    @cached_property
    def no_progress_indicator_reports(self):
        return self.submitted_indicator_reports.filter(
            overall_status=OVERALL_STATUS.no_progress,
        )

    @cached_property
    def no_status_indicator_reports(self):
        return self.submitted_indicator_reports.filter(
            overall_status=OVERALL_STATUS.no_status,
        )

    @cached_property
    def num_of_due_overdue_indicator_reports(self):
        overdue = self.overdue_indicator_reports
        due = self.due_indicator_reports

        return overdue.count() + due.count()

    def num_of_due_overdue_indicator_reports_partner(self, partner=None):
        overdue = self.overdue_indicator_reports.filter(
            reportable__partner_activities__partner=partner)

        due = self.due_indicator_reports.filter(
            reportable__partner_activities__partner=partner)

        return overdue.count() + due.count()

    def num_of_met_indicator_reports_partner(self, partner=None):
        return self.met_indicator_reports_partner(partner).count()

    def num_of_constrained_indicator_reports_partner(self, partner=None):
        return self.constrained_indicator_reports_partner(partner).count()

    def num_of_on_track_indicator_reports_partner(self, partner=None):
        return self.on_track_indicator_reports_partner(partner).count()

    def num_of_no_progress_indicator_reports_partner(self, partner=None):
        return self.no_progress_indicator_reports_partner(partner).count()

    def num_of_no_status_indicator_reports_partner(self, partner=None):
        return self.no_status_indicator_reports_partner(partner).count()

    def num_of_projects_in_my_organization_partner(self, partner=None):
        return partner.partner_projects.filter(clusters=self).count()

    def num_of_constrained_indicator_reports_partner(self, partner=None):
        return self.constrained_indicator_reports_partner(partner).count()

    def num_of_non_cluster_activities_partner(self, partner=None):
        return self.partner_activities.filter(
            partner=partner,
            cluster_activity__isnull=True).count()

    def overdue_indicator_reports_partner(self, partner=None):
        return self.overdue_indicator_reports.filter(
            reportable__partner_activities__partner=partner)

    def my_project_activities_partner(self, partner=None):
        return partner.partner_activities.filter(
            partner__clusters=self)

    def met_indicator_reports_partner(self, partner=None):
        return self.met_indicator_reports.filter(
            reportable__partner_activities__partner=partner
        )

    def constrained_indicator_reports_partner(self, partner=None):
        return self.constrained_indicator_reports.filter(
            reportable__partner_activities__partner=partner
        )

    def on_track_indicator_reports_partner(self, partner=None):
        return self.on_track_indicator_reports.filter(
            reportable__partner_activities__partner=partner
        )

    def no_progress_indicator_reports_partner(self, partner=None):
        return self.no_progress_indicator_reports.filter(
            reportable__partner_activities__partner=partner
        )

    def no_status_indicator_reports_partner(self, partner=None):
        return self.no_status_indicator_reports.filter(
            reportable__partner_activities__partner=partner
        )


class ClusterObjective(TimeStampedModel):
    """
    ClusterObjective model is goal of cluster. This goal should be reached via
    whole cluster aspect.
    For example - to build 3'000 schools at some country.

    related models:
        cluster.Cluster (ForeignKey): "cluster"
        indicator.Reportable (GenericRelation): "reportables"
    """
    title = models.CharField(max_length=255,
                             verbose_name='Cluster Objective Title')
    reference_number = models.CharField(max_length=255,
                                        verbose_name='Reference Number')
    cluster = models.ForeignKey(Cluster, related_name="cluster_objectives")
    locations = models.ManyToManyField('core.Location',
                                       related_name="cluster_objectives")
    frequency = models.CharField(
        max_length=3,
        choices=FREQUENCY_LEVEL,
        default=FREQUENCY_LEVEL.monthly,
        verbose_name='Frequency of reporting'
    )
    reportables = GenericRelation('indicator.Reportable',
                                  related_query_name='cluster_objectives')

    class Meta:
        ordering = ['-id']

    @property
    def response_plan(self):
        return self.cluster.response_plan

    def __str__(self):
        return "<pk: %s> %s" % (self.id, self.title)



class ClusterActivity(TimeStampedModel):
    """
    ClusterActivity models is an action, which one to take, to reach the goal
    (that is defined in ClusterObjective). These activities are decided by
    the cluster admins (IMO's) and the partners might adopt these activities
    via PartnerActivity then.

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
    cluster_objective = models.ForeignKey(ClusterObjective,
                                          related_name="cluster_activities")
    locations = models.ManyToManyField('core.Location',
                                       related_name="cluster_activities")
    reportables = GenericRelation('indicator.Reportable',
                                  related_query_name='cluster_activities')

    class Meta:
        ordering = ['-id']

    @property
    def cluster(self):
        return self.cluster_objective.cluster

    @property
    def response_plan(self):
        return self.cluster.response_plan

    def __str__(self):
        return "<pk: %s> %s" % (self.id, self.title)
