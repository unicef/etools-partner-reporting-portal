from __future__ import unicode_literals

from django.contrib.contenttypes.fields import GenericRelation
from django.contrib.postgres.fields import JSONField
from django.db import models
from django.db.models.signals import pre_save, m2m_changed
from django.dispatch import receiver

from model_utils.models import TimeStampedModel

from core.common import (
    PARTNER_TYPE,
    SHARED_PARTNER_TYPE,
    CSO_TYPES,
    PARTNER_PROJECT_STATUS,
    RESPONSE_PLAN_TYPE, EXTERNAL_DATA_SOURCES)
from core.models import TimeStampedExternalSourceModel
from core.fields import UniqueNullCharField
from core.countries import COUNTRIES_ALPHA2_CODE_DICT, COUNTRIES_ALPHA2_CODE


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
        max_length=3,
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
    custom_fields = JSONField(default=[])
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
        Partner, related_name="partner_projects"
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

    from core.models import Location
    from indicator.models import ReportableLocationGoal
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
    project = models.OneToOneField(PartnerProject)

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
        partner.PartnerProject (ForeignKey): "project"
        partner.Partner (ForeignKey): "partner"
        cluster.ClusterActivity (ForeignKey): "cluster_activity"
        indicator.Reportable (GenericRelation): "reportables"
    """
    title = models.CharField(max_length=2048)
    project = models.ForeignKey(PartnerProject, null=True,
                                related_name="partner_activities")
    partner = models.ForeignKey(Partner, related_name="partner_activities")
    cluster_activity = models.ForeignKey('cluster.ClusterActivity',
                                         related_name="partner_activities",
                                         null=True, blank=True)
    cluster_objective = models.ForeignKey('cluster.ClusterObjective',
                                          related_name="partner_activities",
                                          null=True, blank=True)
    reportables = GenericRelation('indicator.Reportable',
                                  related_query_name='partner_activities')
    locations = models.ManyToManyField('core.Location',
                                       related_name="partner_activities")
    start_date = models.DateField()
    end_date = models.DateField()

    # PartnerActivity shares the status flags with PartnerProject
    status = models.CharField(max_length=3, choices=PARTNER_PROJECT_STATUS,
                              default=PARTNER_PROJECT_STATUS.ongoing)

    class Meta:
        ordering = ['-id']
        permissions = (
            ('imo_object', 'IMO Object'),
            ('partner_object', 'Partner Object'),
        )

    @property
    def clusters(self):
        return self.project.clusters.all()

    @property
    def response_plan(self):
        return self.project.clusters.all()[0].response_plan

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
