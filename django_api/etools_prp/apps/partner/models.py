from django.contrib.contenttypes.fields import GenericRelation
from django.db import models
from django.db.models.signals import m2m_changed, pre_save
from django.dispatch import receiver
from django.utils.translation import gettext as _

from model_utils.models import TimeStampedModel

from etools_prp.apps.core.common import (
    CSO_TYPES,
    EXTERNAL_DATA_SOURCES,
    PARTNER_PROJECT_STATUS,
    PARTNER_TYPE,
    RESPONSE_PLAN_TYPE,
    SHARED_PARTNER_TYPE,
)
from etools_prp.apps.core.countries import COUNTRIES_ALPHA2_CODE, COUNTRIES_ALPHA2_CODE_DICT
from etools_prp.apps.core.fields import UniqueNullCharField
from etools_prp.apps.core.models import TimeStampedExternalSourceModel


class Partner(TimeStampedExternalSourceModel):
    """
    Partner model describe in details who is it and their activity humanitarian
    goals (clusters).

    related models:
        cluster.Cluster (ManyToManyField): "clusters"
    """
    title = models.CharField(
        max_length=255,
        verbose_name='Full Name',
        help_text='Please make sure this matches the name you enter in VISION'
    )
    short_title = models.CharField(
        max_length=50,
        blank=True
    )
    alternate_title = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    partner_type = models.CharField(
        max_length=3,
        choices=PARTNER_TYPE,
        default=PARTNER_TYPE.government,
    )
    shared_partner = models.CharField(
        help_text='Partner shared with UNDP or UNFPA?',
        choices=SHARED_PARTNER_TYPE,
        default=SHARED_PARTNER_TYPE.no,
        max_length=3
    )
    cso_type = models.CharField(
        max_length=3,
        choices=CSO_TYPES,
        verbose_name='CSO Type',
        blank=True,
        null=True
    )
    email = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    phone_number = models.CharField(
        max_length=32,
        blank=True,
        null=True
    )
    last_assessment_date = models.DateField(
        blank=True,
        null=True
    )
    core_values_assessment_date = models.DateField(
        blank=True,
        null=True,
        verbose_name=u'Date positively assessed against core values'
    )

    street_address = models.CharField(
        max_length=512,
        blank=True,
        null=True
    )
    city = models.CharField(
        max_length=64,
        blank=True,
        null=True
    )
    postal_code = models.CharField(
        max_length=32,
        blank=True,
        null=True
    )
    country_code = models.CharField(
        max_length=2,
        choices=COUNTRIES_ALPHA2_CODE,
        blank=True,
        null=True
    )

    total_ct_cp = models.DecimalField(
        decimal_places=2,
        max_digits=12,
        blank=True,
        null=True,
        help_text='Total Cash Transferred for Country Programme'
    )
    total_ct_cy = models.DecimalField(
        decimal_places=2,
        max_digits=12,
        blank=True,
        null=True,
        help_text='Total Cash Transferred per Current Year'
    )

    vendor_number = models.CharField(
        blank=True,
        null=True,
        unique=True,
        max_length=30
    )
    alternate_id = models.IntegerField(
        blank=True,
        null=True
    )
    rating = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        verbose_name='Risk Rating'
    )

    basis_for_risk_rating = models.CharField(
        max_length=50,
        null=True,
        blank=True,
    )

    clusters = models.ManyToManyField(
        'cluster.Cluster', related_name="partners"
    )
    ocha_external_id = UniqueNullCharField(max_length=128, blank=True, null=True, unique=True)
    sea_risk_rating_name = models.CharField(
        max_length=150,
        verbose_name=_("PSEA Risk Rating"),
        blank=True,
        default='',
    )
    psea_assessment_date = models.DateTimeField(
        verbose_name=_("Last PSEA Assess. Date"),
        null=True,
        blank=True,
    )
    overall_risk_rating = models.CharField(
        max_length=50,
        blank=True,
        default='',
    )
    type_of_assessment = models.CharField(
        verbose_name=_("Assessment Type"),
        max_length=50,
        null=True,
    )
    highest_risk_rating_type = models.CharField(
        verbose_name=_("Highest Risk Rating Type"),
        max_length=150,
        blank=True,
        default='',
    )
    highest_risk_rating_name = models.CharField(
        verbose_name=_("Highest Risk Rating Name"),
        max_length=150,
        blank=True,
        default='',
    )

    class Meta:
        ordering = ['title']
        unique_together = (
            ('title', 'vendor_number'),
        )

    def __str__(self):
        return self.title

    @property
    def country(self):
        return COUNTRIES_ALPHA2_CODE_DICT[self.country_code]

    @property
    def address(self):
        address_lines = [
            self.street_address,
            self.city,
            self.postal_code,
            self.country,
        ]

        if all(address_lines):
            return ", ".join(address_lines)
        else:
            return self.street_address or ''


class PartnerProject(TimeStampedExternalSourceModel):
    """
    PartnerProject model is a container for defined group of PartnerActivities
    model.

    related models:
        cluster.Cluster (ManyToManyField): "clusters"
        core.Location (ManyToManyField): "locations"
        partner.Partner (ForeignKey): "partner"
        partner.FundingSource (ForeignKey): "funding_sources"
        indicator.Reportable (GenericRelation): "reportables"
    """
    code = models.TextField(null=True, blank=True, unique=True, verbose_name='Project code in HRP')
    type = models.CharField(
        max_length=8,
        choices=RESPONSE_PLAN_TYPE,
        verbose_name='Plan Type',
        help_text='Is this project part of an HRP or FA?',
        null=True, blank=True
    )

    title = models.CharField(max_length=1024)
    description = models.TextField(max_length=5120, null=True, blank=True)
    additional_information = models.CharField(
        max_length=255, verbose_name="Additional information (e.g. links)", null=True, blank=True
    )
    custom_fields = models.JSONField(default=list, blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(
        max_length=3, choices=PARTNER_PROJECT_STATUS, default=PARTNER_PROJECT_STATUS.ongoing
    )

    agency_name = models.TextField(max_length=512, null=True, blank=True)
    agency_type = models.TextField(max_length=128, null=True, blank=True)

    # TODO: Should be a choicefield, or an integerfield?
    prioritization = models.TextField(null=True, blank=True, verbose_name='Prioritization Classification')

    total_budget = models.DecimalField(
        null=True, decimal_places=2, help_text='Total Budget (USD)', max_digits=12
    )
    funding_source = models.TextField(max_length=2048, null=True, blank=True)

    clusters = models.ManyToManyField(
        'cluster.Cluster', related_name="partner_projects"
    )
    locations = models.ManyToManyField(
        'core.Location', related_name="partner_projects"
    )
    partner = models.ForeignKey(
        Partner,
        related_name="partner_projects",
        on_delete=models.CASCADE,
    )
    additional_partners = models.ManyToManyField(
        Partner, blank=True, verbose_name='Additional implementing partners'
    )
    reportables = GenericRelation(
        'indicator.Reportable', related_query_name='partner_projects'
    )

    class Meta:
        ordering = ['-id']
        permissions = (
            ('imo_object', 'IMO Object'),
            ('partner_object', 'Partner Object'),
        )

    def __str__(self):
        return '{} <PK:{}> {}'.format(
            self.__class__.__name__, self.id, self.title
        )

    @property
    def response_plan(self):
        cluster = self.clusters.first()
        return cluster and cluster.response_plan

    @property
    def funding(self):
        return PartnerProjectFunding.objects.get_or_create(project=self)[0]

    @property
    def is_ocha_imported(self):
        return bool(self.external_id and self.external_source == EXTERNAL_DATA_SOURCES.HPC)


@receiver(m2m_changed, sender=PartnerProject.locations.through, dispatch_uid="sync_locations_for_pp_reportables")
def sync_locations_for_pp_reportables(sender, instance, action, pk_set, **kwargs):
    if action != "post_add":
        return

    from etools_prp.apps.core.models import Location
    from etools_prp.apps.indicator.models import ReportableLocationGoal
    locations = instance.locations.all()

    if locations.exists():
        loc_type = locations.first().gateway.admin_level
        new_locations = Location.objects.filter(id__in=pk_set)

        for r in instance.reportables.all():
            r_locations = r.locations.all()

            if not r_locations.exists():
                return

            r_loc_type = r_locations.first().gateway.admin_level

            if loc_type == r_loc_type:
                for loc in new_locations:
                    ReportableLocationGoal.objects.get_or_create(
                        reportable=r,
                        location=loc,
                    )


class PartnerProjectFunding(TimeStampedModel):
    project = models.OneToOneField(
        PartnerProject,
        on_delete=models.CASCADE,
    )

    # All fields below stored in USD
    required_funding = models.DecimalField(decimal_places=2, max_digits=32, null=True, blank=True)
    internal_funding = models.DecimalField(decimal_places=2, max_digits=32, null=True, blank=True)
    cerf_funding = models.DecimalField(
        decimal_places=2, max_digits=32, null=True, blank=True, verbose_name='Central Emergency Response Fund funding'
    )
    cbpf_funding = models.DecimalField(
        decimal_places=2, max_digits=32, null=True, blank=True, verbose_name='Country based pooled funds funding'
    )
    bilateral_funding = models.DecimalField(
        decimal_places=2, max_digits=32, null=True, blank=True,
        verbose_name='Funding from bilateral agreements, not including UNICEF/WFP'
    )
    unicef_funding = models.DecimalField(
        decimal_places=2, max_digits=32, null=True, blank=True,
        verbose_name='Funding from UNICEF including supplies cost'
    )
    wfp_funding = models.DecimalField(
        decimal_places=2, max_digits=32, null=True, blank=True, verbose_name='Funding from WFP including supplies cost'
    )

    @property
    def total_funding(self):
        return sum(list(filter(
            None, [
                self.internal_funding,
                self.cerf_funding,
                self.cbpf_funding,
                self.bilateral_funding,
                self.unicef_funding,
                self.wfp_funding,
            ]
        )))

    @property
    def funding_gap(self):
        if not self.required_funding:
            return None

        return self.required_funding - self.total_funding


class PartnerActivity(TimeStampedModel):
    """
    PartnerActivity model define actions the partner intends to take. These
    activities might link or be associated with a cluster activity. But the
    partner is allowed to define their ideas that wasn't defined.

    related models:
        partner.PartnerProject (ManyToMany): "projects"
        partner.Partner (ForeignKey): "partner"
        cluster.ClusterActivity (ForeignKey): "cluster_activity"
        indicator.Reportable (GenericRelation): "reportables"
    """
    title = models.CharField(max_length=2048)
    projects = models.ManyToManyField(
        PartnerProject,
        related_name="partner_activities",
        through="PartnerActivityProjectContext",
    )
    partner = models.ForeignKey(
        Partner,
        related_name="partner_activities",
        on_delete=models.CASCADE,
    )
    cluster_activity = models.ForeignKey(
        'cluster.ClusterActivity',
        related_name="partner_activities",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    cluster_objective = models.ForeignKey(
        'cluster.ClusterObjective',
        related_name="partner_activities",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    reportables = GenericRelation('indicator.Reportable',
                                  related_query_name='partner_activities')
    locations = models.ManyToManyField('core.Location',
                                       related_name="partner_activities")

    class Meta:
        ordering = ['-id']
        verbose_name_plural = 'Partner activities'
        permissions = (
            ('imo_object', 'IMO Object'),
            ('partner_object', 'Partner Object'),
        )

    @property
    def clusters(self):
        from etools_prp.apps.cluster.models import Cluster
        return Cluster.objects.filter(id__in=self.projects.values_list('clusters', flat=True).distinct())

    @property
    def response_plan(self):
        return self.clusters[0].response_plan

    @property
    def is_custom(self):
        return self.cluster_activity is None

    def __str__(self):
        return self.title


@receiver(pre_save, sender=PartnerActivity, dispatch_uid="check_pa_double_fks")
def check_pa_double_fks(sender, instance, **kwargs):
    if instance.cluster_activity and instance.cluster_objective:
        raise Exception(
            "PartnerActivity cannot belong to both ClusterActivity and ClusterObjective"
        )


class PartnerActivityProjectContext(TimeStampedModel):
    project = models.ForeignKey("PartnerProject", on_delete=models.CASCADE)
    activity = models.ForeignKey("PartnerActivity", on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()

    # PartnerActivity shares the status flags with PartnerProject
    status = models.CharField(max_length=3, choices=PARTNER_PROJECT_STATUS,
                              default=PARTNER_PROJECT_STATUS.ongoing)

    reportables = GenericRelation(
        'indicator.Reportable',
        related_query_name='partner_activity_project_contexts'
    )

    class Meta:
        unique_together = ('project', 'activity')
