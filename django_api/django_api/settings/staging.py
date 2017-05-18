from __future__ import absolute_import
from .base import *


# dev overrides
DEBUG = False
IS_STAGING = True

# domains/hosts etc.
DOMAIN_NAME = 'staging.etools-prp.com'
WWW_ROOT = 'http://%s/' % DOMAIN_NAME
ALLOWED_HOSTS = [DOMAIN_NAME, "*"]
