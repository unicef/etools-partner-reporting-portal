"""Development settings and globals."""
from os.path import join, normpath

from base import *


########## DEBUG CONFIGURATION
# See: https://docs.djangoproject.com/en/dev/ref/settings/#debug
DEBUG = True

ALLOWED_HOSTS = ['127.0.0.1']

########## END DEBUG CONFIGURATION

CELERY_ALWAYS_EAGER = True
