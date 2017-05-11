from __future__ import unicode_literals
from decimal import Decimal

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

from model_utils.models import TimeStampedModel

from .common import (
    INTERVENTION_TYPES,
    INTERVENTION_STATUS,
)
from .countries import COUNTRIES_ALPHA2_CODE_DICT, COUNTRIES_ALPHA2_CODE


class Intervention(TimeStampedModel):
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
        help_text="""
            Draft = In discussion with partner, Active = Currently ongoing,
            Implemented = completed, Terminated = cancelled or not approved
        """
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

    signed_by_unicef_date = models.DateField(null=True, blank=True)
    signed_by_partner_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['number']

    def __unicode__(self):
        return self.number


class Country(TimeStampedModel):
    title = models.CharField(max_length=255)
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
    local_currency_title = models.CharField(max_length=128, default=None, null=True)

    threshold_tre_usd = models.DecimalField(max_digits=20, decimal_places=4, default=None, null=True)
    threshold_tae_usd = models.DecimalField(max_digits=20, decimal_places=4, default=None, null=True)

    def __unicode__(self):
        if self.code:
            return "%s (%s)" % (self.title, self.code)
        return self.title

    @property
    def country_name(self):
        return COUNTRIES_ALPHA2_CODE_DICT[self.code]

    @property
    def country_code(self):
        return self.code.lower()


class Location(TimeStampedModel):
    title = models.CharField(max_length=255)
    reportable = models.ForeignKey('indicator.Reportable', related_name="locations")

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

    parent = models.ForeignKey('self', null=True, blank=True, related_name='children', db_index=True)
    # uncomment when dj will be >= 1.11
    # geom = models.MultiPolygonField(null=True, blank=True)
    # point = models.PointField(null=True, blank=True)

    class Meta:
        unique_together = ('title', 'p_code')
        ordering = ['title']

    def __unicode__(self):
        if self.p_code:
            return "%s {PCode: %s}" % (self.title, self.p_code)
        return self.title

    @property
    def geo_point(self):
        return self.point if self.point else self.geom.point_on_surface if self.geom else ""

    @property
    def point_lat_long(self):
        return "Lat: {}, Long: {}".format(
            self.point.y,
            self.point.x
        )
