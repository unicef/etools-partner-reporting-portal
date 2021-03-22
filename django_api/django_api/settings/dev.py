import os

from .base import *  # noqa:403

# dev overrides
DEBUG = True
IS_DEV = True
IS_STAGING = False

# domains/hosts etc.
DOMAIN_NAME = os.getenv('DOMAIN_NAME', '127.0.0.1:8081')
WWW_ROOT = 'http://%s/' % DOMAIN_NAME
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "*"]

CELERY_EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
POST_OFFICE = {
    'DEFAULT_PRIORITY': 'now',
    'BACKENDS': {
        # Send email to console for local dev
        'default': os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
    }
}

INSTALLED_APPS += [
    'debug_toolbar',
    'django_extensions',
]

MIDDLEWARE = [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
] + MIDDLEWARE

# No SAML for local dev
AUTHENTICATION_BACKENDS = (
    # 'social_core.backends.azuread_b2c.AzureADB2COAuth2',
    'core.mixins.CustomAzureADBBCOAuth2',
    'django.contrib.auth.backends.ModelBackend',
)

CORS_ORIGIN_WHITELIST += ('http://localhost:8082', 'http://localhost:8081')

FIXTURE_DIRS += ["fixtures"]
