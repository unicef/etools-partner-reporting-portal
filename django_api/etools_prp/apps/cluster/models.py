import datetime

from django.contrib.contenttypes.fields import GenericRelation
from django.db import models
from django.db.models import Q
from django.utils.functional import cached_property

from etools_prp.apps.account.models import User
from etools_prp.apps.core.common import CLUSTER_TYPES, INDICATOR_REPORT_STATUS, OVERALL_STATUS, PRP_ROLE_TYPES
from etools_prp.apps.core.models import PRPRole, TimeStampedExternalSourceModel
from etools_prp.apps.indicator.models import IndicatorReport, Reportable
from etools_prp.apps.partner.models import PartnerActivity


class Cluster(TimeStampedExternalSourceModel):
    """
    Cluster model it is a group of partners that cooperate to reach the same
    goal (Removal of the humanitarian crisis). We can divide clusters to few
    types for example Partners will belong to Education, that are working on
    this background.

    related models:
        core.Workspace (ForeignKey): "intervention"

    """
    type = models.CharField(max_length=32, choices=CLUSTER_TYPES)
    imported_type = models.TextField(
        max_length=1024, null=True, blank=True, help_text='Type as specified in the external system'
    )
    response_plan = models.ForeignKey(
        'core.ResponsePlan',
        related_name="clusters",
        on_delete=models.CASCADE,
        null=True,
    )

    class Meta:
        """One response plan can only have a cluster of one type."""
        unique_together = (
            ('type', 'imported_type', 'response_plan'),
            TimeStampedExternalSourceModel.Meta.unique_together
        )

    def __str__(self):
        return "<pk: {}> `{}` PLAN: `{}`".format(
            self.id,
            self.title,
            self.response_plan
        )

    @property
    def title(self):
        return self.imported_type or self.get_type_display()

    @property
    def imo_users(self):
        return User.objects.filter(
            id__in=PRPRole.objects.filter(
                cluster=self, role=PRP_ROLE_TYPES.cluster_imo
            ).values_list('user', flat=True).distinct()
        )

    @property
    def num_of_partners(self):
        return self.partners.count()

    def num_of_met_indicator_reports(self, partner=None):
        qset = self.met_indicator_reports
        if partner:
            qset = qset.filter(reportable__partner_activity_project_contexts__activity__partner=partner)
        return qset.count()

    def num_of_constrained_indicator_reports(self, partner=None):
        qset = self.constrained_indicator_reports
        if partner:
            qset = qset.filter(reportable__partner_activity_project_contexts__activity__partner=partner)
        return qset.count()

    def num_of_on_track_indicator_reports(self, partner=None):
        qset = self.on_track_indicator_reports
        if partner:
            qset = qset.filter(reportable__partner_activity_project_contexts__activity__partner=partner)
        return qset.count()

    def num_of_no_progress_indicator_reports(self, partner=None):
        qset = self.no_progress_indicator_reports
        if partner:
            qset = qset.filter(reportable__partner_activity_project_contexts__activity__partner=partner)
        return qset.count()

    def num_of_no_status_indicator_reports(self, partner=None):
        qset = self.no_status_indicator_reports
        if partner:
            qset = qset.filter(reportable__partner_activity_project_contexts__activity__partner=partner)
        return qset.count()

    def num_of_non_cluster_activities(self, partner=None):
        qset = self.partner_activities.filter(
            cluster_activity__isnull=True)
        if partner:
            qset = qset.filter(partner=partner)
        return qset.count()

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
    def partner_activity_reportables_queryset(self):
        return Reportable.objects.filter(
            Q(partner_activity_project_contexts__activity__cluster_activity__cluster_objective__cluster=self) |
            Q(partner_activity_project_contexts__activity__cluster_objective__cluster=self)).distinct()

    @cached_property
    def latest_indicator_reports(self):
        """
        Returns the latest indicator reports for each reportable that is
        associated with partner activities for this cluster.
        """
        latest_irs = list()

        for reportable in self.partner_activity_reportables_queryset:
            try:
                latest_irs.append(reportable.indicator_reports.latest('time_period_end'))
            except IndicatorReport.DoesNotExist:
                pass

        return IndicatorReport.objects.filter(
            id__in=list(map(lambda x: x.id, latest_irs))
        )

    @cached_property
    def indicator_reports(self):
        return IndicatorReport.objects.filter(
            reportable__in=self.partner_activity_reportables_queryset
        )

    @cached_property
    def overdue_indicator_reports(self):
        return self.indicator_reports.filter(
            report_status=INDICATOR_REPORT_STATUS.overdue)

    @cached_property
    def due_indicator_reports(self):
        return self.indicator_reports.filter(
            report_status=INDICATOR_REPORT_STATUS.due)

    @cached_property
    def accepted_indicator_reports(self):
        return self.indicator_reports.filter(
            report_status=INDICATOR_REPORT_STATUS.accepted)

    @cached_property
    def new_indicator_reports(self):
        today = datetime.date.today()
        return filter(
            lambda item: (today - item.submission_date).days <= 15,
            self.accepted_indicator_reports)

    @cached_property
    def met_indicator_reports(self):
        return self.accepted_indicator_reports.filter(
            overall_status=OVERALL_STATUS.met
        )

    @cached_property
    def constrained_indicator_reports(self):
        return self.accepted_indicator_reports.filter(
            overall_status=OVERALL_STATUS.constrained
        )

    @cached_property
    def on_track_indicator_reports(self):
        return self.accepted_indicator_reports.filter(
            overall_status=OVERALL_STATUS.on_track,
        )

    @cached_property
    def no_progress_indicator_reports(self):
        return self.accepted_indicator_reports.filter(
            overall_status=OVERALL_STATUS.no_progress,
        )

    @cached_property
    def no_status_indicator_reports(self):
        return self.accepted_indicator_reports.filter(
            overall_status=OVERALL_STATUS.no_status,
        )

    def num_of_due_overdue_indicator_reports(self, partner=None):
        overdue = self.overdue_indicator_reports
        due = self.due_indicator_reports

        if partner:
            overdue = overdue.filter(
                reportable__partner_activity_project_contexts__activity__partner=partner)
            due = due.filter(
                reportable__partner_activity_project_contexts__activity__partner=partner)

        return overdue.count() + due.count()

    def num_of_projects_in_my_organization_partner(self, partner=None):
        return partner.partner_projects.filter(clusters=self).count()

    def num_of_non_cluster_activities_partner(self, partner=None):
        return self.partner_activities.filter(
            partner=partner,
            cluster_activity__isnull=True).count()

    def overdue_indicator_reports_partner(self, partner=None):
        return self.overdue_indicator_reports.filter(
            reportable__partner_activity_project_contexts__activity__partner=partner)

    def my_project_activities_partner(self, partner=None):
        return partner.partner_activities.filter(
            partner__clusters=self)

    def constrained_indicator_reports_partner(self, partner=None):
        return self.constrained_indicator_reports.filter(
            reportable__partner_activity_project_contexts__activity__partner=partner
        )


class ClusterObjective(TimeStampedExternalSourceModel):
    """
    ClusterObjective model is goal of cluster. This goal should be reached via
    whole cluster aspect.
    For example - to build 3'000 schools at some country.

    related models:
        cluster.Cluster (ForeignKey): "cluster"
        indicator.Reportable (GenericRelation): "reportables"
    """
    title = models.TextField(
        max_length=2048, verbose_name='Cluster Objective Title'
    )
    cluster = models.ForeignKey(
        Cluster,
        related_name="cluster_objectives",
        on_delete=models.CASCADE,
    )
    locations = models.ManyToManyField(
        'core.Location', related_name="cluster_objectives"
    )
    reportables = GenericRelation(
        'indicator.Reportable', related_query_name='cluster_objectives'
    )

    class Meta:
        ordering = ['-id']
        unique_together = (
            TimeStampedExternalSourceModel.Meta.unique_together
        )

    @property
    def response_plan(self):
        return self.cluster.response_plan

    def __str__(self):
        return "<pk: {}> {}".format(self.id, self.title)


class ClusterActivity(TimeStampedExternalSourceModel):
    """
    ClusterActivity models is an action, which one to take, to reach the goal
    (that is defined in ClusterObjective). These activities are decided by
    the cluster admins (IMO's) and the partners might adopt these activities
    via PartnerActivity then.

    related models:
        cluster.ClusterObjective (ForeignKey): "cluster_objective"
        indicator.Reportable (GenericRelation): "reportables"
    """
    title = models.TextField(max_length=2048)
    cluster_objective = models.ForeignKey(
        ClusterObjective,
        related_name="cluster_activities",
        on_delete=models.CASCADE,
    )
    locations = models.ManyToManyField(
        'core.Location', related_name="cluster_activities"
    )
    reportables = GenericRelation(
        'indicator.Reportable', related_query_name='cluster_activities'
    )

    class Meta:
        ordering = ['-id']
        verbose_name_plural = 'Cluster activities'
        unique_together = (
            TimeStampedExternalSourceModel.Meta.unique_together
        )

    @property
    def cluster(self):
        return self.cluster_objective.cluster

    @property
    def response_plan(self):
        return self.cluster.response_plan

    def __str__(self):
        return "<pk: {}> {}".format(self.id, self.title)
