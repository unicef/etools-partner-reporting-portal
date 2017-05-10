from __future__ import unicode_literals
from decimal import Decimal

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

from mptt.models import TreeForeignKey

from .common import (
    PARTNER_TYPE,
    SHARED_PARTNER_TYPE,
    INTERVENTION_TYPES,
    INTERVENTION_STATUS,
    CSO_TYPES,
)
from .countries import COUNTRIES_ALPHA2_CODE_DICT, COUNTRIES_ALPHA2_CODE


class Intervention(models.Model):

    INTERVENTION_STATUS_HELP_TEXT = """
        Draft = In discussion with partner, Active = Currently ongoing,
        Implemented = completed, Terminated = cancelled or not approved
    """

    document_type = models.CharField(
        choices=INTERVENTION_TYPES,
        max_length=255,
        blank=True,
        null=True,
        verbose_name=u'Document type'
    )
    number = models.CharField(
        max_length=64,
        blank=True,
        null=True,
        verbose_name=u'Reference Number',
        unique=True,
    )
    title = models.CharField(max_length=255)
    status = models.CharField(
        max_length=3,
        blank=True,
        choices=INTERVENTION_STATUS,
        default=INTERVENTION_STATUS.draft,
        help_text=INTERVENTION_STATUS_HELP_TEXT
    )
    start = models.DateField(
        null=True,
        blank=True,
        help_text='The date the Intervention will start'
    )
    end = models.DateField(
        null=True,
        blank=True,
        help_text='The date the Intervention will end'
    )
    submission_date = models.DateField(
        null=True,
        blank=True,
        help_text='The date the partner submitted complete PD/SSFA documents to Unicef',
    )

    signed_by_unicef_date = models.DateField(null=True, blank=True)
    signed_by_partner_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['number']

    def __unicode__(self):
        return self.number


class Country(models.Model):
    name = models.CharField(max_length=255)
    intervention = models.ForeignKey(
        Intervention, related_name="countries")
    code = models.CharField(
        max_length=2,
        choices=COUNTRIES_ALPHA2_CODE,
        null=True,
        blank=True
    )

    business_area_code = models.CharField(
        max_length=10,
        null=True,
        blank=True
    )
    latitude = models.DecimalField(
        null=True, blank=True,
        max_digits=8,
        decimal_places=5,
        validators=[MinValueValidator(Decimal(-90)), MaxValueValidator(Decimal(90))]
    )
    longitude = models.DecimalField(
        null=True, blank=True,
        max_digits=8,
        decimal_places=5,
        validators=[MinValueValidator(Decimal(-180)), MaxValueValidator(Decimal(180))]
    )
    initial_zoom = models.IntegerField(default=8)

    # hmm, I gues we don't need this at all (vision sync stuff)
    vision_sync_enabled = models.BooleanField(default=True)
    vision_last_synced = models.DateTimeField(null=True, blank=True)

    local_currency_code = models.CharField(max_length=5, default=None, null=True)
    local_currency_name = models.CharField(max_length=128, default=None, null=True)

    threshold_tre_usd = models.DecimalField(max_digits=20, decimal_places=4, default=None, null=True)
    threshold_tae_usd = models.DecimalField(max_digits=20, decimal_places=4, default=None, null=True)

    def __unicode__(self):
        if self.code:
            return "%s (%s)" % (self.name, self.code)
        return self.name

    @property
    def country_name(self):
        return COUNTRIES_ALPHA2_CODE_DICT[self.code]

    @property
    def country_code(self):
        return self.code.lower()


class Partner(models.Model):

    name = models.CharField(
        max_length=255,
        verbose_name='Full Name',
        help_text='Please make sure this matches the name you enter in VISION'
    )
    short_name = models.CharField(
        max_length=50,
        blank=True
    )
    alternate_name = models.CharField(
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
    country = models.CharField(
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
    alternate_name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    rating = models.CharField(
        max_length=50,
        null=True,
        verbose_name='Risk Rating'
    )

    cluster = models.ForeignKey('cluster.Cluster', related_name="partners")

    class Meta:
        ordering = ['name']
        unique_together = ('name', 'vendor_number')

    def __unicode__(self):
        return self.name

    def get_country(self):
        return COUNTRIES_ALPHA2_CODE_DICT[self.country]

    def get_address(self):
        return ", ".join(self.street_address, self.city, self.postal_code, self.get_country())


class Location(models.Model):
    name = models.CharField(max_length=255)
    reportable = models.ForeignKey('reporting.Reportable', related_name="locations")

    latitude = models.DecimalField(
        null=True,
        blank=True,
        max_digits=8,
        decimal_places=5,
        validators=[MinValueValidator(Decimal(-90)), MaxValueValidator(Decimal(90))]
    )
    longitude = models.DecimalField(
        null=True,
        blank=True,
        max_digits=8,
        decimal_places=5,
        validators=[MinValueValidator(Decimal(-180)), MaxValueValidator(Decimal(180))]
    )
    p_code = models.CharField(max_length=32, blank=True, null=True)

    parent = TreeForeignKey('self', null=True, blank=True, related_name='children', db_index=True)
    # uncomment when dj will be >= 1.11
    # geom = models.MultiPolygonField(null=True, blank=True)
    # point = models.PointField(null=True, blank=True)

    class Meta:
        unique_together = ('name', 'p_code')
        ordering = ['name']

    def __unicode__(self):
        if self.p_code:
            return "%s {PCode: %s}" % (self.name, self.p_code)
        return self.name

    @property
    def geo_point(self):
        return self.point if self.point else self.geom.point_on_surface if self.geom else ""

    @property
    def point_lat_long(self):
        return "Lat: {}, Long: {}".format(
            self.point.y,
            self.point.x
        )
