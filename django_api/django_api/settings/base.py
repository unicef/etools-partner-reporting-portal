"""
Django settings for django_api project.

Generated by 'django-admin startproject' using Django 1.9.

For more information on this file, see
https://docs.djangoproject.com/en/1.9/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.9/ref/settings/
"""

import datetime
import os
import sys

from cryptography.hazmat.backends import default_backend
from cryptography.x509 import load_pem_x509_certificate

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APPS_DIR = os.path.join(BASE_DIR, 'apps/')
sys.path.append(APPS_DIR)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', '123')
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False
IS_TEST = False
IS_DEV = False
IS_STAGING = False
IS_PROD = False

# Get the ENV setting.
ENV = os.getenv('ENV')
if not ENV:
    raise Exception('Environment variable ENV is required!')

DATA_VOLUME = os.getenv('DATA_VOLUME', '/data')

UPLOADS_DIR_NAME = 'uploads'
MEDIA_URL = '/api/%s/' % UPLOADS_DIR_NAME

FILE_UPLOAD_MAX_MEMORY_SIZE = 4194304  # 4mb
MEDIA_ROOT = os.path.join(DATA_VOLUME, '%s' % UPLOADS_DIR_NAME)
STATIC_ROOT = '%s/staticserve' % DATA_VOLUME
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

DOMAIN_NAME = os.getenv('DOMAIN_NAME')

FRONTEND_HOST = os.getenv(
    'PRP_FRONTEND_HOST',
    os.getenv('DJANGO_ALLOWED_HOST', 'http://localhost:8081')
)
FRONTEND_PMP_HOST = os.getenv(
    'PRP_FRONTEND_PMP_HOST',
    os.getenv('DJANGO_ALLOWED_HOST', 'http://localhost:8081')
)


EMAIL_BACKEND = 'unicef_notification.backends.EmailBackend'

DEFAULT_FROM_EMAIL = 'no-reply@etools.unicef.org'
EMAIL_HOST = os.getenv('EMAIL_HOST', '')
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
EMAIL_PORT = os.getenv('EMAIL_HOST_PORT', 587)
EMAIL_USE_TLS = bool(os.getenv('EMAIL_USE_TLS', 'true'))

ADMIN_MAIL = os.getenv('ADMIN_MAIL')
if ADMIN_MAIL:
    ADMINS = [
        ('Admin', ADMIN_MAIL),
    ]

ALLOWED_HOSTS = []

CACHES = {
    "default": {
        'BACKEND': 'redis_cache.RedisCache',
        "LOCATION": REDIS_URL,
        "KEY_PREFIX": "PRP",
    }
}

# Application definition
INSTALLED_APPS = [
    # 'elasticapm.contrib.django',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'corsheaders',

    'storages',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_swagger',
    'rest_framework_gis',
    'drfpasswordless',
    'django_filters',
    'django_celery_beat',
    'django_celery_results',
    'djcelery_email',
    'leaflet',
    'suit',
    'django_cron',
    'social_django',

    'account',
    'cluster',
    'core',
    'indicator',
    'partner',
    'unicef',
    'ocha',
    'id_management',
    'post_office',
    'unicef_notification',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'core.mixins.CustomSocialAuthExceptionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ORIGIN_WHITELIST = [
    'https://etools.unicef.org',
    'https://etools-demo.unicef.org',
    'https://etools-test.unicef.org',
    'https://etools-test.unicef.io',
    'https://etools-staging.unicef.org',
    'https://etools-dev.unicef.org',
]

ROOT_URLCONF = 'django_api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates'), ],
        'OPTIONS': {
            'debug': DEBUG,
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'social_django.context_processors.backends',
                'social_django.context_processors.login_redirect',
            ],
            'loaders': [
              'django.template.loaders.filesystem.Loader',
              'django.template.loaders.app_directories.Loader',
            ],
        },
    },
]

FIXTURE_DIRS = [
    '/code/fixtures/',
]

WSGI_APPLICATION = 'django_api.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.9/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.getenv('POSTGRES_DB', 'unicef_prp'),
        'USER': os.getenv('POSTGRES_USER', 'postgres'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', ''),
        'HOST': os.getenv('POSTGRES_HOST', 'localhost'),
        'PORT': 5432,
    }
}

# Password validation
# https://docs.djangoproject.com/en/1.9/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# JWT
# django-rest-framework-jwt: http://getblimp.github.io/django-rest-framework-jwt/
JWT_AUTH = {
   'JWT_ENCODE_HANDLER':
   'rest_framework_jwt.utils.jwt_encode_handler',

   'JWT_DECODE_HANDLER':
   'rest_framework_jwt.utils.jwt_decode_handler',

   'JWT_PAYLOAD_HANDLER':
   'rest_framework_jwt.utils.jwt_payload_handler',

   'JWT_PAYLOAD_GET_USER_ID_HANDLER':
   'rest_framework_jwt.utils.jwt_get_user_id_from_payload_handler',

   'JWT_PAYLOAD_GET_USERNAME_HANDLER':
   'rest_framework_jwt.utils.jwt_get_username_from_payload_handler',

   'JWT_RESPONSE_PAYLOAD_HANDLER':
   'rest_framework_jwt.utils.jwt_response_payload_handler',

   'JWT_ALGORITHM': 'HS256',
   'JWT_VERIFY': True,
   'JWT_VERIFY_EXPIRATION': True,
   'JWT_LEEWAY': 30,
   'JWT_EXPIRATION_DELTA': datetime.timedelta(seconds=30000),
   'JWT_AUDIENCE': None,
   'JWT_ISSUER': None,

   'JWT_ALLOW_REFRESH': False,
   'JWT_REFRESH_EXPIRATION_DELTA': datetime.timedelta(days=7),

   'JWT_AUTH_HEADER_PREFIX': 'JWT',
}
DISABLE_JWT_AUTH = os.getenv('DISABLE_JWT_AUTH', False)
# This user will be used for all externals that have a valid JWT but no user account in the system
DEFAULT_UNICEF_USER = 'default_unicef_user'
# Allows login for users that do not have a User account in the system, without creating a user account by using default
JWT_ALLOW_NON_EXISTENT_USERS = True

# Internationalization
# https://docs.djangoproject.com/en/1.9/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.9/howto/static-files/
STATIC_URL = '/api/static/'

# Authentication settings
AUTH_USER_MODEL = 'account.User'

PRINT_DATA_FORMAT = "%d-%b-%Y"
DATE_FORMAT = PRINT_DATA_FORMAT

INPUT_DATA_FORMAT = "%Y-%m-%d"

# LOGS_PATH = os.path.join(DATA_VOLUME, 'django_api', 'logs')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '[%(asctime)s][%(levelname)s][%(name)s] %(filename)s %(funcName)s:%(lineno)d %(message)s'
        },
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'fmt': '%(levelname)s %(asctime)s',
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'stream': sys.stdout,
            'formatter': 'standard',
        },
        'default': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'stream': sys.stdout,
            'formatter': 'standard',
        },
        'ocha': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'stream': sys.stdout,
            'formatter': 'standard',
        },
        # 'elasticapm': {
        #     'level': 'ERROR',
        #     'class': 'elasticapm.contrib.django.handlers.LoggingHandler',
        # },
    },
    'loggers': {
        'django': {
            'handlers': ['default'],
            'level': 'INFO',
            'propagate': True
        },
        'ocha-sync': {
            'handlers': ['ocha'],
            'level': 'DEBUG',
            'propagate': True
        },
        # 'elasticapm.errors': {
        #     'level': 'ERROR',
        #     'handlers': ['default'],
        #     'propagate': False,
        # },
    }
}

# Celery
CELERY_ACCEPT_CONTENT = ['pickle', 'json', 'application/text']
CELERY_BROKER_URL = REDIS_URL
CELERY_BROKER_VISIBILITY_VAR = os.environ.get('CELERY_VISIBILITY_TIMEOUT', 1800)
CELERY_BROKER_TRANSPORT_OPTIONS = {
    'visibility_timeout': int(CELERY_BROKER_VISIBILITY_VAR)}  # 5 hours

CELERY_RESULT_BACKEND = 'django-db'
CELERY_CACHE_BACKEND = 'django-cache'
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers.DatabaseScheduler'
CELERY_EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# Sensible settings for celery
CELERY_TASK_ALWAYS_EAGER = bool(os.environ.get('CELERY_TASK_ALWAYS_EAGER', False))
CELERY_ALWAYS_EAGER = bool(os.environ.get('CELERY_ALWAYS_EAGER', False))
CELERY_TASK_ACKS_LATE = True
CELERY_TASK_PUBLISH_RETRY = True
CELERY_WORKER_DISABLE_RATE_LIMITS = False

CELERY_TASK_IGNORE_RESULT = True
CELERY_SEND_TASK_ERROR_EMAILS = False
CELERY_RESULT_EXPIRES = 600
CELERY_WORKER_PREFETCH_MULTIPLIER = 1

# django-post_office: https://github.com/ui/django-post_office
POST_OFFICE = {
    'DEFAULT_PRIORITY': 'now',
    'BACKENDS': {
        'default': 'djcelery_email.backends.CeleryEmailBackend'
    }
}

LEAFLET_CONFIG = {
    'TILES': 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    'ATTRIBUTION_PREFIX': 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
    'MIN_ZOOM': 3,
    'MAX_ZOOM': 18,
}

# CartoDB settings
CARTODB_USERNAME = os.getenv('CARTODB_USERNAME')
CARTODB_APIKEY = os.getenv('CARTODB_APIKEY')


# Cronjobs

CRON_CLASSES = [
    'indicator.cron.IndicatorReportOverDueCronJob',
    'core.cron.WorkspaceCronJob',
    'partner.cron.PartnerCronJob',
    'unicef.cron.ProgrammeDocumentCronJob'
]

# DRF settings
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES':
        (
            'rest_framework.authentication.SessionAuthentication',
            'utils.mixins.CustomJSONWebTokenAuthentication',
            'rest_framework.authentication.TokenAuthentication',
    ),
    'DATE_FORMAT': PRINT_DATA_FORMAT,
    'DATE_INPUT_FORMATS': ['iso-8601', PRINT_DATA_FORMAT],
    'EXCEPTION_HANDLER': 'utils.exception_handler.detailed_exception_handler',
}


# Auth related settings
PASSWORDLESS_AUTH = {
    'PASSWORDLESS_AUTH_TYPES': ['EMAIL', ],
    'PASSWORDLESS_EMAIL_TOKEN_HTML_TEMPLATE_NAME': "account/passwordless_login_email.html",
    'PASSWORDLESS_EMAIL_NOREPLY_ADDRESS': 'no-reply@unicef.org',
    'PASSWORDLESS_CONTEXT_PROCESSORS': ['account.context_processors.passwordless_token_email', ],
    'PASSWORDLESS_REGISTER_NEW_USERS': False,
    'PASSWORDLESS_EMAIL_SUBJECT': 'UNICEF Partner Reporting Portal: Your login link'
}

# Django-social-auth settings
KEY = os.getenv('AZURE_B2C_CLIENT_ID', None)
SECRET = os.getenv('AZURE_B2C_CLIENT_SECRET', None)

SOCIAL_AUTH_URL_NAMESPACE = 'social'
SOCIAL_AUTH_SANITIZE_REDIRECTS = False
SOCIAL_PASSWORD_RESET_POLICY = os.getenv('AZURE_B2C_PASS_RESET_POLICY', "B2C_1_PasswordResetPolicy")
POLICY = os.getenv('AZURE_B2C_POLICY_NAME', "b2c_1A_UNICEF_PARTNERS_signup_signin")

TENANT_ID = os.getenv('AZURE_B2C_TENANT', 'unicefpartners')
SCOPE = ['openid', 'email']
IGNORE_DEFAULT_SCOPE = True
SOCIAL_AUTH_USERNAME_IS_FULL_EMAIL = True
SOCIAL_AUTH_PROTECTED_USER_FIELDS = ['email']
SOCIAL_AUTH_LOGIN_REDIRECT_URL = "/app"
SOCIAL_AUTH_POSTGRES_JSONFIELD = True

# TODO: Re-enable this back once we figure out all email domain names to whitelist from partners
# SOCIAL_AUTH_WHITELISTED_DOMAINS = ['unicef.org', 'google.com']

# TODO: Set this url properly later
LOGIN_ERROR_URL = "/404"
JWT_LEEWAY = 1000

SOCIAL_AUTH_PIPELINE = (
    # 'social_core.pipeline.social_auth.social_details',
    'core.mixins.social_details',
    'social_core.pipeline.social_auth.social_uid',
    # allows based on emails being listed in 'WHITELISTED_EMAILS' or 'WHITELISTED_DOMAINS'
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    # 'social_core.pipeline.user.get_username',
    'core.mixins.get_username',
    'social_core.pipeline.social_auth.associate_by_email',
    # 'social_core.pipeline.user.create_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    # 'social_core.pipeline.user.user_details',
    'core.mixins.user_details',
)


# PMP API
PMP_API_ENDPOINT = os.getenv('PMP_API_ENDPOINT', "http://172.18.0.1:8082/api")
PMP_API_USER = os.getenv('PMP_API_USER')
PMP_API_PASSWORD = os.getenv('PMP_API_PASSWORD')

# OCHA API
OCHA_API_USER = os.getenv('OCHA_API_USER', '')
OCHA_API_PASSWORD = os.getenv('OCHA_API_PASSWORD', '')

# assuming we're using Azure Storage:
# django-storages: https://django-storages.readthedocs.io/en/latest/backends/azure.html
AZURE_ACCOUNT_NAME = os.environ.get('AZURE_ACCOUNT_NAME', None)
AZURE_ACCOUNT_KEY = os.environ.get('AZURE_ACCOUNT_KEY', None)
AZURE_CONTAINER = os.environ.get('AZURE_CONTAINER', None)

# Optionally can use S3
AWS_S3_ACCESS_KEY_ID = os.environ.get('AWS_S3_ACCESS_KEY_ID', None)
AWS_S3_SECRET_ACCESS_KEY = os.environ.get('AWS_S3_SECRET_ACCESS_KEY', None)
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME', None)

# JWT Authentication
# production overrides for django-rest-framework-jwt
if not DISABLE_JWT_AUTH:
    public_key_text = open(os.path.join(BASE_DIR, 'keys/jwt/certificate.pem'), 'rb').read()  # noqa: F405
    certificate = load_pem_x509_certificate(public_key_text, default_backend())

    JWT_PUBLIC_KEY = certificate.public_key()

    JWT_AUTH.update({  # noqa: F405
        'JWT_SECRET_KEY': SECRET_KEY,
        'JWT_PUBLIC_KEY': JWT_PUBLIC_KEY,
        'JWT_ALGORITHM': 'RS256',
        'JWT_LEEWAY': 60,
        'JWT_EXPIRATION_DELTA': datetime.timedelta(seconds=3000),  # noqa: F405
        'JWT_AUDIENCE': 'https://etools.unicef.org/',
    })

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',  # this is default
)

# apm related - it's enough to set those as env variables, here just for documentation
# by default logging and apm is off, so below envs needs to be set per environment

# ELASTIC_APM_SERVICE_NAME=<app-name> # set app name visible on dashboard
# ELASTIC_APM_SECRET_TOKEN=<app-token> #secret token - needs to be exact same as on apm-server
# ELASTIC_APM_SERVER_URL=http://elastic.tivixlabs.com:8200 # apm-server url

# raven (Sentry): https://github.com/getsentry/raven-python
SENTRY_DSN = os.getenv('SENTRY_DSN', default=False)
if SENTRY_DSN:
    RAVEN_CONFIG = {
        'dsn': SENTRY_DSN,  # noqa: F405
    }
    INSTALLED_APPS += (  # noqa: F405
        'raven.contrib.django.raven_compat',
    )
