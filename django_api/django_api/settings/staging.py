from __future__ import absolute_import
from .base import *


# dev overrides
DATA_VOLUME = '/data'
DEBUG = False
IS_STAGING = True

UPLOADS_DIR_NAME = 'uploads'
MEDIA_URL = '/%s/' % UPLOADS_DIR_NAME
MEDIA_ROOT = os.path.join(DATA_VOLUME, '%s' % UPLOADS_DIR_NAME)

FILE_UPLOAD_MAX_MEMORY_SIZE = 4194304  # 4mb
MEDIA_ROOT = os.path.join(DATA_VOLUME, '%s' % UPLOADS_DIR_NAME)
STATIC_ROOT = '%s/staticserve' % DATA_VOLUME

# domains/hosts etc.
DOMAIN_NAME = 'staging.domain_name.com'
WWW_ROOT = 'http://%s/' % DOMAIN_NAME
ALLOWED_HOSTS = [DOMAIN_NAME]
