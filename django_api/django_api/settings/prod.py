from __future__ import absolute_import

import os
import sys

from .base import *

DEBUG = False
IS_DEV = False
IS_STAGING = False
IS_PROD = True

# domains/hosts etc.
DOMAIN_NAME = os.getenv('DOMAIN_NAME', 'www.partnerreportingportal.org')
WWW_ROOT = 'http://%s/' % DOMAIN_NAME
ALLOWED_HOSTS = [DOMAIN_NAME, ]

# other
SERVER_EMAIL = 'admin@' + DOMAIN_NAME

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

LOGGING['handlers']['mail_admins'] = {
    'level': 'ERROR',
    'class': 'django.utils.log.AdminEmailHandler',
}

LOGGING['loggers']['django.request'] = {
    'handlers': ['mail_admins'],
    'level': 'ERROR',
    'propagate': False,
}

if all([AWS_S3_ACCESS_KEY_ID, AWS_S3_SECRET_ACCESS_KEY, AWS_STORAGE_BUCKET_NAME]):
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    AWS_S3_FILE_OVERWRITE = False
    AWS_S3_SIGNATURE_VERSION = 's3v4'
    AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', 'eu-central-1')

elif all([AZURE_ACCOUNT_NAME, AZURE_ACCOUNT_KEY, AZURE_CONTAINER]):
    DEFAULT_FILE_STORAGE = 'core.mixins.EToolsAzureStorage'
    AZURE_SSL = True
    AZURE_AUTO_SIGN = True  # flag for automatically signing urls
    AZURE_ACCESS_POLICY_EXPIRY = 120  # length of time before signature expires in seconds
    AZURE_ACCESS_POLICY_PERMISSION = 'r'  # read permission
