from __future__ import absolute_import
import os

from .base import *


DEBUG = True
IS_DEV = False
IS_STAGING = True

# domains/hosts etc.
DOMAIN_NAME = os.getenv('DOMAIN_NAME', '127.0.0.1:8082')
WWW_ROOT = 'http://%s/' % DOMAIN_NAME
ALLOWED_HOSTS = [DOMAIN_NAME, "*"]

# other
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')

INSTALLED_APPS += [
    'django_extensions',
]

# No SAML for local dev
AUTHENTICATION_BACKENDS = (
    # 'social_core.backends.azuread_b2c.AzureADB2COAuth2',
    'core.mixins.CustomAzureADBBCOAuth2',
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
)

CORS_ORIGIN_WHITELIST += ('localhost:8082', )