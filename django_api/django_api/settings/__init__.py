from __future__ import absolute_import
import os

# import defaults
from .base import *

# This will make sure the app is always imported when
# Django starts so that shared_task will use this app.
from django_api.apps.core.celery import app as celery_app

__all__ = ['celery_app']

overrides = __import__(
    'django_api.settings.{}'.format(ENV),
    globals(),
    locals(),
)

# apply imported overrides
for attr in dir(overrides):
    # we only want to import settings (which have to be variables in ALLCAPS)
    if attr.isupper():
        # update our scope with the imported variables. We use globals() instead of locals()
        # because locals() is readonly and it returns a copy of itself upon assignment.
        globals()[attr] = getattr(overrides, attr)
