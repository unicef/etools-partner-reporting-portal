"""
Model factories used for generating models dynamically for tests
"""
import json
import decimal
from datetime import datetime, timedelta, date

from django.db.models.signals import post_save
from django.contrib.contenttypes.models import ContentType
from django.contrib.gis.geos import GEOSGeometry
from django.contrib.auth.models import Group

import factory
from factory import fuzzy
