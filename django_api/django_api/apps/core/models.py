from __future__ import unicode_literals
import random
import logging
from decimal import Decimal

from django.core.cache import cache
from django.contrib.gis.db import models
from django.contrib.contenttypes.models import ContentType
from django.core.validators import (
    MinValueValidator,
    MaxValueValidator
)
from django.db import (
    IntegrityError,
    connection
)
from django.db.models.signals import pre_delete, post_save
from django.dispatch.dispatcher import receiver

from model_utils.models import TimeStampedModel
from mptt.models import MPTTModel, TreeForeignKey
from paintstore.fields import ColorPickerField

from .common import (
    RESPONSE_PLAN_TYPE,
)
from .countries import COUNTRIES_ALPHA2_CODE_DICT, COUNTRIES_ALPHA2_CODE

logger = logging.getLogger('locations.models')


def get_random_color():
    r = lambda: random.randint(0,255)
    return '#%02X%02X%02X' % (r(), r(), r())


class Country(TimeStampedModel):
    """
    Represents a country which has many offices and sections.
    Taken from https://github.com/unicef/etools/blob/master/EquiTrack/users/models.py
    on Sep. 14, 2017.
    """
    name = models.CharField(max_length=100)
    country_short_code = models.CharField(
        max_length=10,
        null=True, blank=True
    )
    long_name = models.CharField(max_length=255, null=True, blank=True)
    business_area_code = models.CharField(
        max_length=10,
        null=True, blank=True
    )
    latitude = models.DecimalField(
        null=True, blank=True,
        max_digits=8, decimal_places=5,
        validators=[MinValueValidator(Decimal(-90)), MaxValueValidator(Decimal(90))]
    )
    longitude = models.DecimalField(
        null=True, blank=True,
        max_digits=8, decimal_places=5,
        validators=[MinValueValidator(Decimal(-180)), MaxValueValidator(Decimal(180))]
    )
    initial_zoom = models.IntegerField(default=8)

    def __unicode__(self):
        return self.name


class Workspace(TimeStampedModel):
    """
    Workspace (previously called Workspace, also synonym was
    emergency/country) model.

    It's used for drop down menu in right top corner in the UI. Many times
    workspace is associated with only one country.
    """
    title = models.CharField(max_length=255)
    workspace_code = models.CharField(
        max_length=8
    )
    countries = models.ManyToManyField(Country, related_name='workspaces')
    locations = models.ManyToManyField(Location, related_name='workspaces')

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title


class ResponsePlan(TimeStampedModel):
    """
    ResponsePlan model present response of workspace (intervention).

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
    workspace = models.ForeignKey('core.Workspace', related_name="response_plans")

    @property
    def documents(self):
        return []  # TODO probably create file field


class GatewayType(models.Model):
    """
    Represents an Admin Type in location-related models.
    """

    name = models.CharField(max_length=64L, unique=True)
    admin_level = models.PositiveSmallIntegerField()

    workspace = models.ForeignKey(Workspace, related_name="gateway_types")

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
    The background of the location can be: Country > Region > City > District/Point.

    Either a point or geospatial object.
    pcode should be unique.

    related models:
        indicator.Reportable (ForeignKey): "reportable"
        core.Location (ForeignKey): "self"
        core.GatewayType: "gateway"
    """
    title = models.CharField(max_length=255)
    reportable = models.ForeignKey('indicator.Reportable', null=True, blank=True, related_name="locations")

    gateway = models.ForeignKey(GatewayType, verbose_name='Location Type')
    carto_db_table = models.ForeignKey('core.CartoDBTable', related_name="locations")

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
        return self.point if self.point else self.geom.point_on_surface if self.geom else ""

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
        core.Country: 'country'
    """

    domain = models.CharField(max_length=254)
    api_key = models.CharField(max_length=254)
    table_name = models.CharField(max_length=254)
    location_type = models.ForeignKey(GatewayType)
    parent = TreeForeignKey('self', null=True, blank=True,
                            related_name='children', db_index=True)

    country = models.ForeignKey(Country, related_name="carto_db_tables")

    def __str__(self):
        return self.table_name
