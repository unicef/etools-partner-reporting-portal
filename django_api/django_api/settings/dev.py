from __future__ import absolute_import

import os

from .base import *


# dev overrides
DEBUG = True
IS_DEV = True

# domains/hosts etc.
DOMAIN_NAME = os.getenv('DOMAIN_NAME', '127.0.0.1:8080')
WWW_ROOT = 'http://%s/' % DOMAIN_NAME
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "*"]

# other
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')

INSTALLED_APPS += [
    'debug_toolbar',
    'django_extensions',
]

MIDDLEWARE_CLASSES = [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
] + MIDDLEWARE_CLASSES

CORS_ORIGIN_WHITELIST += ('localhost:8082', )
