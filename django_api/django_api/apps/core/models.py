from __future__ import unicode_literals
import random
import logging
from decimal import Decimal

from django.contrib.gis.db import models
from django.core.validators import (
    MinValueValidator,
    MaxValueValidator
)

from model_utils.models import TimeStampedModel
from mptt.models import MPTTModel, TreeForeignKey

from .common import (
    INTERVENTION_TYPES,
    INTERVENTION_STATUS,
    RESPONSE_PLAN_TYPE,
)
from .countries import COUNTRIES_ALPHA2_CODE_DICT, COUNTRIES_ALPHA2_CODE

logger = logging.getLogger('locations.models')


def get_random_color():
    def r():
        random.randint(0, 255)

    return '#%02X%02X%02X' % (r(), r(), r())


class Intervention(TimeStampedModel):
    """
    Intervention (response/emergency) model.
    It's used for drop down menu in right top corner
    (where location are in country level (without parents)).

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

    class Meta:
        ordering = ['number']

    def __str__(self):
        return self.number

    @property
    def country_name(self):
        return COUNTRIES_ALPHA2_CODE_DICT[self.country_code]

    @property
    def address(self):
        return ", ".join(
            self.street_address,
            self.city,
            self.postal_code,
            self.country_name
        )


class ResponsePlan(TimeStampedModel):
    """
    ResponsePlan model present response of intervention.

    related models:
        ....
    """
    title = models.CharField(max_length=255, verbose_name='Response Plan')
    plan_type = models.CharField(
        max_length=3,
        choices=RESPONSE_PLAN_TYPE,
        default=RESPONSE_PLAN_TYPE.hrp,
        verbose_name='Plan Type'
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
    intervention = models.ForeignKey(
        'core.Intervention', related_name="response_plans")

    @property
    def documents(self):
        return []  # TODO probably create file field


class GatewayType(models.Model):
    """
    Represents an Admin Type in location-related models.
    """

    name = models.CharField(max_length=64L, unique=True)
    admin_level = models.PositiveSmallIntegerField()

    intervention = models.ForeignKey(
        Intervention, related_name="gateway_types")

    class Meta:
        ordering = ['name']
        verbose_name = 'Location Type'

    def __str__(self):
        return self.name


class LocationManager(models.GeoManager):

    def get_queryset(self):
        return super(LocationManager, self).get_queryset().select_related('gateway')


class Location(TimeStampedModel):
    """
    Location model define place where agents are working.
    The background of the location can be:
    Country > Region > City > District/Point.

    Either a point or geospatial object.
    pcode should be unique.

    related models:
        indicator.Reportable (ForeignKey): "reportable"
        core.Location (ForeignKey): "self"
        core.GatewayType: "gateway"
    """
    title = models.CharField(max_length=255)
    reportable = models.ForeignKey(
        'indicator.Reportable',
        null=True,
        blank=True,
        related_name="locations")

    gateway = models.ForeignKey(GatewayType, verbose_name='Location Type')
    carto_db_table = models.ForeignKey(
        'core.CartoDBTable', related_name="locations")
    intervention = models.ForeignKey(Intervention, related_name="locations")

    latitude = models.DecimalField(
        null=True,
        blank=True,
        max_digits=8,
        decimal_places=5,
        validators=[MinValueValidator(
            Decimal(-90)), MaxValueValidator(Decimal(90))]
    )
    longitude = models.DecimalField(
        null=True,
        blank=True,
        max_digits=8,
        decimal_places=5,
        validators=[MinValueValidator(
            Decimal(-180)), MaxValueValidator(Decimal(180))]
    )
    p_code = models.CharField(max_length=32, blank=True, null=True)

    parent = models.ForeignKey(
        'self', null=True, blank=True, related_name='children', db_index=True)

    geom = models.MultiPolygonField(null=True, blank=True)
    point = models.PointField(null=True, blank=True)
    objects = LocationManager()

    class Meta:
        unique_together = ('title', 'p_code')
        ordering = ['title']

    def __str__(self):
        if self.p_code:
            return '{} ({} {})'.format(
                self.name,
                self.gateway.name,
                "{}: {}".format(
                    'CERD' if self.gateway.name == 'School' else 'PCode',
                    self.p_code if self.p_code else ''
                ))

        return self.title

    @property
    def geo_point(self):
        return self.point if self.point else \
            self.geom.point_on_surface if self.geom else ""

    @property
    def point_lat_long(self):
        return "Lat: {}, Long: {}".format(
            self.point.y,
            self.point.x
        )


class CartoDBTable(MPTTModel):
    """
    Represents a table in CartoDB, it is used to import locations
    related models:
        core.GatewayType: 'gateway'
        core.Intervention: 'intervention'
    """

    domain = models.CharField(max_length=254)
    api_key = models.CharField(max_length=254)
    table_name = models.CharField(max_length=254)
    location_type = models.ForeignKey(GatewayType)
    parent = TreeForeignKey(
        'self',
        null=True,
        blank=True,
        related_name='children',
        db_index=True)

    intervention = models.ForeignKey(
        Intervention, related_name="carto_db_tables")

    def __str__(self):
        return self.table_name
