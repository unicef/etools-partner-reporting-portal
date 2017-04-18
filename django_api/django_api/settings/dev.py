from __future__ import absolute_import
from .base import *


# dev overrides
DATA_VOLUME = '/data'
DEBUG = True
TEMPLATE_DEBUG = DEBUG
IS_DEV = True

UPLOADS_DIR_NAME = 'uploads'
MEDIA_URL = '/%s/' % UPLOADS_DIR_NAME
MEDIA_ROOT = os.path.join(DATA_VOLUME, '%s' % UPLOADS_DIR_NAME)

FILE_UPLOAD_MAX_MEMORY_SIZE = 4194304  # 4mb
MEDIA_ROOT = os.path.join(DATA_VOLUME, '%s' % UPLOADS_DIR_NAME)
STATIC_ROOT = '%s/staticserve' % DATA_VOLUME

# domains/hosts etc.
DOMAIN_NAME = '127.0.0.1:8000'
WWW_ROOT = 'http://%s/' % DOMAIN_NAME
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "django_api"]

# other
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

INSTALLED_APPS += [
    'debug_toolbar',
    'django_extensions',
]

MIDDLEWARE_CLASSES = [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
] + MIDDLEWARE_CLASSES
