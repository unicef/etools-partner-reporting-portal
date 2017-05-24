from __future__ import unicode_literals

from django.db import models
from django.contrib.contenttypes.fields import GenericRelation

from model_utils.models import TimeStampedModel

from core.common import (
    PARTNER_TYPE,
    SHARED_PARTNER_TYPE,
    CSO_TYPES,
)

from core.countries import COUNTRIES_ALPHA2_CODE_DICT, COUNTRIES_ALPHA2_CODE


class Partner(TimeStampedModel):
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
        max_length=32,
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
    alternate_title = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    rating = models.CharField(
        max_length=50,
        null=True,
        verbose_name='Risk Rating'
    )
    type_of_assessment = models.CharField(
        max_length=50,
        null=True,
    )

    cluster = models.ManyToManyField('cluster.Cluster', related_name="partners")

    class Meta:
        ordering = ['title']
        unique_together = ('title', 'vendor_number')

    def __unicode__(self):
        return self.title

    @property
    def country(self):
        return COUNTRIES_ALPHA2_CODE_DICT[self.country_code]

    @property
    def address(self):
        return ", ".join([self.street_address, self.city, self.postal_code, self.country])


class PartnerProject(TimeStampedModel):
    title = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=100)

    cluster = models.ManyToManyField('cluster.Cluster', related_name="partner_projects")
    location = models.ManyToManyField('core.Location', related_name="partner_projects")
    partner = models.ForeignKey(Partner, null=True, related_name="partner_projects")
    reportables = GenericRelation('indicator.Reportable', related_query_name='partner_projects')


class PartnerActivity(TimeStampedModel):
    title = models.CharField(max_length=255)
    project = models.ForeignKey(PartnerProject, null=True, related_name="partner_activities")
    partner = models.ForeignKey(Partner, related_name="partner_activities")
    cluster_activity = models.ForeignKey('cluster.ClusterActivity', related_name="partner_activities")
    reportables = GenericRelation('indicator.Reportable', related_query_name='partner_projects')
