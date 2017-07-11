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
    """
    Intervention (response/emergency) model.
    It's used for drop down menu in right top corner (where location are in country level (without parents)).

    related models:
        core.Location (ManyToManyField): "locations"
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
    country_code = models.CharField(
        max_length=2,
        choices=COUNTRIES_ALPHA2_CODE,
        null=True,
        blank=True
    )
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

    locations = models.ManyToManyField('core.Location')

    class Meta:
        ordering = ['number']

    def __str__(self):
        return self.number

    @property
    def country_name(self):
        return COUNTRIES_ALPHA2_CODE_DICT[self.country_code]

    @property
    def address(self):
        return ", ".join(self.street_address, self.city, self.postal_code, self.country_name)


class Location(TimeStampedModel):
    """
    Location model define place where agents are working.
    The background of the location can be: Country > Region > City > District/Point.

    related models:
        indicator.Reportable (ForeignKey): "reportable"
        core.Location (ForeignKey): "self"
    """
    title = models.CharField(max_length=255)
    reportable = models.ForeignKey('indicator.Reportable', null=True, blank=True, related_name="locations")

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

    def __str__(self):
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
