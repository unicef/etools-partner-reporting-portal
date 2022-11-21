import logging
import random
from datetime import datetime, timedelta
from decimal import Decimal

from django.conf import settings
from django.contrib.auth.models import Group
from django.contrib.gis.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db.models import Q
from django.utils.functional import cached_property
from django.utils.translation import gettext as _

import mptt
import pycountry
from model_utils.models import TimeStampedModel
from mptt.managers import TreeManager
from unicef_locations.models import AbstractLocation, LocationsManager

from etools_prp.apps.utils.emails import send_email_from_template

from .common import EXTERNAL_DATA_SOURCES, INDICATOR_REPORT_STATUS, OVERALL_STATUS, PRP_ROLE_TYPES, RESPONSE_PLAN_TYPE
from .countries import COUNTRY_NAME_TO_ALPHA2_CODE

logger = logging.getLogger('locations.models')


def get_random_color():
    return '#%02X%02X%02X' % (
        random.randint(0, 255),
        random.randint(0, 255),
        random.randint(0, 255)
    )


class TimeStampedExternalSyncModelMixin(TimeStampedModel):
    """
    A abstract class that provides external_id field that some models need since
    they might have been synced from an external system.
    """
    external_id = models.CharField(
        help_text='An ID representing this instance in an external system',
        blank=True,
        null=True,
        max_length=32
    )

    class Meta:
        abstract = True


class TimeStampedExternalBusinessAreaModel(TimeStampedExternalSyncModelMixin):
    external_business_area_code = models.CharField(
        help_text='A Workspace business area code as unique constraint factor',
        blank=True,
        null=True,
        max_length=32
    )

    class Meta:
        abstract = True
        unique_together = ('external_id', 'external_business_area_code')


class TimeStampedExternalSourceModel(TimeStampedExternalSyncModelMixin):
    external_source = models.TextField(choices=EXTERNAL_DATA_SOURCES, blank=True, null=True)

    class Meta:
        abstract = True
        unique_together = ('external_id', 'external_source')


class WorkspaceManager(models.Manager):
    def user_workspaces(self, user, role_list=None):
        if user.is_unicef:
            return self.all()

        ip_kw = {'prp_roles__user': user}
        cluster_kw = {'response_plans__clusters__prp_roles__user': user}

        if role_list:
            ip_kw['prp_roles__role__in'] = role_list
            cluster_kw['response_plans__clusters__prp_roles__role__in'] = role_list

        if user.prp_roles.filter(role=PRP_ROLE_TYPES.cluster_system_admin).exists():
            q_cluster_admin = Q(response_plans__clusters__isnull=False)
        else:
            q_cluster_admin = Q()

        return self.filter(Q(**ip_kw) | Q(**cluster_kw) | q_cluster_admin).distinct()


class Workspace(TimeStampedExternalSourceModel):
    """
    Workspace (previously called Workspace, also synonym was
    emergency/country) model.

    It's used for drop down menu in right top corner in the UI. Many times
    workspace is associated with only one country.
    """
    title = models.CharField(max_length=255)
    workspace_code = models.CharField(
        max_length=8,
        unique=True
    )
    business_area_code = models.CharField(
        max_length=10,
        null=True, blank=True
    )
    latitude = models.DecimalField(
        null=True, blank=True,
        max_digits=8, decimal_places=5,
        validators=[
            MinValueValidator(Decimal(-90)),
            MaxValueValidator(Decimal(90))
        ]
    )
    longitude = models.DecimalField(
        null=True, blank=True,
        max_digits=8, decimal_places=5,
        validators=[
            MinValueValidator(Decimal(-180)),
            MaxValueValidator(Decimal(180))
        ]
    )
    initial_zoom = models.IntegerField(default=8)

    objects = WorkspaceManager()

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title

    # @property
    # def locations(self):
    #     """
    #     Returns a list of locations that belong to countries associated with
    #     this workspace.
    #     """
    #     result = self.countries.all().values_list(
    #         'gateway_types__locations').distinct()
    #     pks = []
    #     [pks.extend(filter(lambda x: x is not None, part)) for part in result]
    #     return Location.objects.filter(pk__in=pks)


class Realm(TimeStampedExternalSyncModelMixin):
    user = models.ForeignKey(
        'account.User',
        related_name="realms",
        on_delete=models.CASCADE,
    )
    workspace = models.ForeignKey(
        Workspace,
        related_name="realms",
        on_delete=models.CASCADE,
    )
    partner = models.ForeignKey(
        'partner.Partner',
        related_name="realms",
        on_delete=models.CASCADE,
    )
    group = models.ForeignKey(
        Group,
        related_name="realms",
        on_delete=models.CASCADE,
    )
    is_active = models.BooleanField(_('Active'), default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'workspace', 'partner', 'group'], name='unique_realm')
        ]
        indexes = [
            models.Index(fields=['user', 'workspace', 'partner'])
        ]

    def __str__(self):
        return f"{self.user.email} - {self.workspace.title} - {self.partner.title}: " \
               f"{self.group.name if self.group else ''}"


# TODO REALMS clean up
class PRPRole(TimeStampedExternalSourceModel):
    """
    PRPRole model present a workspace-partner level permission entity
    with cluster association.

    related models:
        account.User (ForeignKey): "user"
    """
    user = models.ForeignKey(
        'account.User',
        related_name="prp_roles",
        on_delete=models.CASCADE,
    )
    role = models.CharField(max_length=32, choices=PRP_ROLE_TYPES)
    workspace = models.ForeignKey(
        'core.Workspace',
        related_name="prp_roles",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    cluster = models.ForeignKey(
        'cluster.Cluster',
        related_name="prp_roles",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'PRP roles'
        unique_together = (
            'user',
            'role',
            'workspace',
            'cluster',
        )

    def __str__(self):
        return '{} - {} in Workspace {}'.format(self.user, self.role, self.workspace)

    def send_email_notification(self, deleted=None):
        template_data = {
            'user': self.user,
            'role': self,
            'portal_url': settings.FRONTEND_HOST,
            'portal': None
        }
        to_email_list = [self.user.email]
        content_subtype = 'html'

        if self.role in {PRP_ROLE_TYPES.cluster_system_admin,
                         PRP_ROLE_TYPES.cluster_imo,
                         PRP_ROLE_TYPES.cluster_member,
                         PRP_ROLE_TYPES.cluster_viewer,
                         PRP_ROLE_TYPES.cluster_coordinator}:
            template_data['portal'] = 'CLUSTER'
        elif self.role in {PRP_ROLE_TYPES.ip_authorized_officer,
                           PRP_ROLE_TYPES.ip_admin,
                           PRP_ROLE_TYPES.ip_editor,
                           PRP_ROLE_TYPES.ip_viewer}:
            template_data['portal'] = 'IP'

        if deleted:
            subject_template_path = 'emails/on_role_remove_subject.txt'
            body_template_path = 'emails/on_role_remove.html'
        else:
            subject_template_path = 'emails/on_role_assign_change_subject.txt'
            body_template_path = 'emails/on_role_assign_change.html'

        send_email_from_template(
            subject_template_path=subject_template_path,
            body_template_path=body_template_path,
            template_data=template_data,
            to_email_list=to_email_list,
            content_subtype=content_subtype
        )
        return True


class ResponsePlan(TimeStampedExternalSourceModel):
    """
    ResponsePlan model present response of workspace (intervention).

    related models:
        ....
    """
    title = models.CharField(max_length=255, verbose_name='Response Plan')
    plan_type = models.CharField(
        max_length=5,
        choices=RESPONSE_PLAN_TYPE,
        default=RESPONSE_PLAN_TYPE.hrp,
        verbose_name='Plan Type'
    )
    plan_custom_type_label = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name='Plan Custom Type Label'
    )
    start = models.DateField(
        null=True,
        blank=True,
        verbose_name='Start date'
    )
    end = models.DateField(
        null=True,
        blank=True,
        verbose_name='End date'
    )
    workspace = models.ForeignKey(
        'core.Workspace',
        related_name="response_plans",
        on_delete=models.CASCADE,
    )

    class Meta:
        unique_together = ('title', 'plan_type', 'workspace')

    def __str__(self):
        return '#{} {}'.format(self.id, self.title)

    @property
    def documents(self):
        return []  # TODO probably create file field

    @cached_property
    def all_clusters(self):
        return self.clusters.all()

    @cached_property
    def can_import_ocha_projects(self):
        """
        We need external id and source to search projects for this plan
        """
        return bool(
            self.external_id and self.external_source == EXTERNAL_DATA_SOURCES.HPC
        )

    def num_of_partners(self, clusters=None):
        from etools_prp.apps.partner.models import Partner

        if not clusters or clusters == []:
            clusters = self.all_clusters
        return Partner.objects.filter(clusters__in=clusters).distinct().count()

    def num_of_due_overdue_indicator_reports(self,
                                             clusters=None,
                                             partner=None):
        if not clusters or clusters == []:
            clusters = self.all_clusters

        count = 0
        for c in clusters:
            count += c.num_of_due_overdue_indicator_reports(partner=partner)
        return count

    def num_of_non_cluster_activities(self,
                                      clusters=None,
                                      partner=None):
        if not clusters or clusters == []:
            clusters = self.all_clusters

        count = 0
        for c in clusters:
            count += c.num_of_non_cluster_activities(partner=partner)
        return count

    def num_of_met_indicator_reports(self, clusters=None, partner=None):
        if not clusters or clusters == []:
            clusters = self.all_clusters

        count = 0
        for c in clusters:
            count += c.num_of_met_indicator_reports(partner=partner)
        return count

    def num_of_constrained_indicator_reports(
            self, clusters=None, partner=None):
        if not clusters or clusters == []:
            clusters = self.all_clusters

        count = 0
        for c in clusters:
            count += c.num_of_constrained_indicator_reports(partner=partner)
        return count

    def num_of_on_track_indicator_reports(self, clusters=None, partner=None):
        if not clusters or clusters == []:
            clusters = self.all_clusters

        count = 0
        for c in clusters:
            count += c.num_of_on_track_indicator_reports(partner=partner)
        return count

    def num_of_no_progress_indicator_reports(
            self, clusters=None, partner=None):
        if not clusters or clusters == []:
            clusters = self.all_clusters

        count = 0
        for c in clusters:
            count += c.num_of_no_progress_indicator_reports(partner=partner)
        return count

    def num_of_no_status_indicator_reports(self, clusters=None, partner=None):
        if not clusters or clusters == []:
            clusters = self.all_clusters

        count = 0
        for c in clusters:
            count += c.num_of_no_status_indicator_reports(partner=partner)
        return count

    def num_of_projects(self, clusters=None, partner=None):
        from etools_prp.apps.partner.models import PartnerProject

        if not clusters or clusters == []:
            clusters = self.all_clusters

        qset = PartnerProject.objects.filter(clusters__in=clusters).distinct()
        if partner:
            qset = qset.filter(partner=partner)
        return qset.count()

    def _latest_indicator_reports(self, clusters):
        """
        Return reportables that are linked to partner activities. The logic
        to filter out activities that belong to these clusters is a bit involved
        given PA could be custom or not and hence eithe CA or CO could be null
        on it.
        """
        from etools_prp.apps.indicator.models import IndicatorReport, Reportable
        reportables = Reportable.objects.filter(
            Q(partner_activity_project_contexts__activity__cluster_activity__cluster_objective__cluster__in=clusters) |
            Q(partner_activity_project_contexts__activity__cluster_objective__cluster__in=clusters))
        return IndicatorReport.objects.filter(
            reportable__in=reportables).order_by(
            '-time_period_end').distinct()

    def upcoming_indicator_reports(self, clusters=None, partner=None,
                                   limit=None, days=15):
        if not clusters or clusters == []:
            clusters = self.all_clusters

        days_in_future = datetime.today() + timedelta(days=days)
        indicator_reports = self._latest_indicator_reports(clusters).filter(
            report_status=INDICATOR_REPORT_STATUS.due
        ).filter(
            due_date__gte=datetime.today()
        ).filter(
            due_date__lte=days_in_future
        )
        return indicator_reports

    def overdue_indicator_reports(self, clusters=None, partner=None,
                                  limit=None):
        """
        Returns indicator reports associated with partner activities or
        partner projects that are overdue, if partner is specified.
        """
        if not clusters or clusters == []:
            clusters = self.all_clusters

        indicator_reports = self._latest_indicator_reports(clusters)
        indicator_reports = indicator_reports.filter(
            report_status=INDICATOR_REPORT_STATUS.overdue)

        if partner:
            indicator_reports = indicator_reports.filter(
                Q(reportable__partner_projects__partner=partner) |
                Q(reportable__partner_activity_project_contexts__activity__partner=partner)
            )

        if limit:
            indicator_reports = indicator_reports[:limit]

        return indicator_reports

    def constrained_indicator_reports(self, clusters=None, partner=None,
                                      limit=None):
        if not clusters or clusters == []:
            clusters = self.all_clusters

        indicator_reports = self._latest_indicator_reports(clusters)
        if partner:
            indicator_reports = indicator_reports.filter(
                Q(reportable__partner_projects__partner=partner) |
                Q(reportable__partner_activity_project_contexts__activity__partner=partner)
            )
        indicator_reports = indicator_reports.filter(
            report_status=INDICATOR_REPORT_STATUS.accepted,
            overall_status=OVERALL_STATUS.constrained).order_by(
                'reportable__id', '-submission_date'
        ).distinct('reportable__id')
        if limit:
            indicator_reports = indicator_reports[:limit]
        return indicator_reports

    def partner_activities(self, partner, clusters=None, limit=None):
        if not clusters or clusters == []:
            clusters = self.all_clusters
        qset = partner.partner_activities.filter(
            Q(cluster_objective__cluster__in=clusters) |
            Q(cluster_activity__cluster_objective__cluster__in=clusters)
        ).distinct()
        if limit:
            qset = qset[:limit]
        return qset


class PRPLocationsManager(TreeManager):

    def get_queryset(self):
        return super().get_queryset().select_related('parent').defer('geom', 'point')

    def active(self):
        return self.get_queryset().filter(is_active=True)

    def archived_locations(self):
        return self.get_queryset().filter(is_active=False)


class Location(AbstractLocation):
    external_id = models.CharField(
        help_text='An ID representing this instance in an external system',
        blank=True,
        null=True,
        max_length=32
    )

    external_source = models.TextField(choices=EXTERNAL_DATA_SOURCES, blank=True, null=True)

    workspaces = models.ManyToManyField(Workspace, related_name='locations')

    objects = PRPLocationsManager()
    super_objects = LocationsManager()


mptt.register(Location, order_insertion_by=['name'])


# TODO remove me
class Country(TimeStampedModel):
    """
    Represents a country which has many offices and sections.
    Taken from https://github.com/unicef/etools/blob/master/EquiTrack/users/models.py
    on Sep. 14, 2017.
    """
    name = models.CharField(max_length=100)
    iso3_code = models.CharField(
        max_length=10,
        blank=True,
        default='',
        verbose_name=_("ISO3 Code"),
    )
    country_short_code = models.CharField(
        max_length=10,
        null=True,
        blank=True
    )
    long_name = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Countries'

    def __str__(self):
        return self.name

    @property
    def details(self):
        """
        Tries to retrieve a usable country reference
        :return: pycountry Country object or None
        """
        lookup = None

        if not self.country_short_code:
            lookup = {'alpha_2': COUNTRY_NAME_TO_ALPHA2_CODE.get(self.name, None)}
        elif len(self.country_short_code) == 3:
            lookup = {'alpha_3': self.country_short_code}
        elif len(self.country_short_code) == 2:
            lookup = {'alpha_2': self.country_short_code}

        if lookup:
            try:
                return pycountry.countries.get(**lookup)
            except KeyError:
                pass


# TODO Remove me
class GatewayType(TimeStampedModel):
    """
    Represents an Admin Type in location-related models.
    """

    name = models.CharField(max_length=64, unique=True, verbose_name=_('Name'))
    admin_level = models.PositiveSmallIntegerField(verbose_name=_('Admin Level'))

    country = models.ForeignKey(
        Country,
        related_name="gateway_types",
        on_delete=models.CASCADE,
    )

    class Meta:
        ordering = ['name']
        verbose_name = 'Location type'
        unique_together = ('country', 'admin_level')

    def __str__(self):
        return '{} - {}'.format(self.name, self.admin_level)
