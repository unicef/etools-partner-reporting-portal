import datetime
import os
import sys

import environ
import sentry_sdk
from corsheaders.defaults import default_headers
from cryptography.hazmat.backends import default_backend
from cryptography.x509 import load_pem_x509_certificate
# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.django import DjangoIntegration

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env = environ.Env()

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY', default='prp-123')
REDIS_URL = env('REDIS_URL', default='redis://localhost:6379/0')


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool('DEBUG', default=False)

# Get the ENV setting.
ENV = env.bool('ENV', default='dev')

DATA_VOLUME = env('DATA_VOLUME', default='/data')

UPLOADS_DIR_NAME = 'uploads'
MEDIA_URL = '/api/%s/' % UPLOADS_DIR_NAME

FILE_UPLOAD_MAX_MEMORY_SIZE = 4194304  # 4mb
MEDIA_ROOT = os.path.join(DATA_VOLUME, '%s' % UPLOADS_DIR_NAME)
STATIC_ROOT = '%s/staticserve' % DATA_VOLUME
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

DOMAIN_NAME = env('DOMAIN_NAME', default='127.0.0.1:8081')  # 'www.partnerreportingportal.org'
WWW_ROOT = 'http://%s/' % DOMAIN_NAME
ALLOWED_HOSTS = env('ALLOWED_HOSTS', default='localhost').split(",")


FRONTEND_HOST = env(
    'PRP_FRONTEND_HOST',
    default=env('DJANGO_ALLOWED_HOST', default='http://localhost:8081')
)
FRONTEND_PMP_HOST = env(
    'PRP_FRONTEND_PMP_HOST',
    default=env('DJANGO_ALLOWED_HOST', default='http://localhost:8081')
)


EMAIL_BACKEND = 'unicef_notification.backends.EmailBackend'
SERVER_EMAIL = 'admin@' + DOMAIN_NAME

DEFAULT_FROM_EMAIL = 'no-reply@etools.unicef.org'
EMAIL_HOST = env('EMAIL_HOST', default='')
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
EMAIL_PORT = env('EMAIL_HOST_PORT', default=587)
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)

ADMIN_MAIL = env('ADMIN_MAIL', default=None)
if ADMIN_MAIL:
    ADMINS = [
        ('Admin', ADMIN_MAIL),
    ]

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
    'django_cron',
    'social_django',

    'unicef_locations',

    'etools_prp.apps.account',
    'etools_prp.apps.cluster',
    'etools_prp.apps.core',
    'etools_prp.apps.indicator',
    'etools_prp.apps.partner',
    'etools_prp.apps.unicef',
    'etools_prp.apps.ocha',
    'etools_prp.apps.id_management',

    'post_office',
    'unicef_notification',
    'django_extensions',
    'admin_extra_urls',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'etools_prp.apps.core.mixins.CustomSocialAuthExceptionMiddleware',
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

CORS_ALLOW_HEADERS = (
    *default_headers,
    "language",
)

ROOT_URLCONF = 'etools_prp.config.urls'

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

WSGI_APPLICATION = 'etools_prp.config.wsgi.application'


# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': env('POSTGRES_DB', default='unicef_prp'),
        'USER': env('POSTGRES_USER', default='postgres'),
        'PASSWORD': env('POSTGRES_PASSWORD', default=''),
        'HOST': env('POSTGRES_HOST', default='localhost'),
        'PORT': 5432,
    }
}

DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'

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

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': datetime.timedelta(minutes=480),
    'REFRESH_TOKEN_LIFETIME': datetime.timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': False,

    'ALGORITHM': 'RS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'LEEWAY': 60,

    'AUTH_HEADER_TYPES': ('JWT', ),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'email',
    'USER_ID_CLAIM': 'email',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',

    'JTI_CLAIM': 'user_id',

    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': datetime.timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': datetime.timedelta(days=1),
}

DISABLE_JWT_AUTH = env.bool('DISABLE_JWT_AUTH', default=False)
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

# LOGS_PATH = os.path.join(DATA_VOLUME, 'etools_prp', 'logs')

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
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
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
            'level': 'INFO',
            'propagate': True
        },
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': False,
        },
        'etools_prp.apps.unicef.tasks': {
            'handlers': ['default'],
            'level': 'INFO',
        }
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
CELERY_BROKER_VISIBILITY_VAR = env.int('CELERY_VISIBILITY_TIMEOUT', default=1800)
CELERY_BROKER_TRANSPORT_OPTIONS = {
    'visibility_timeout': CELERY_BROKER_VISIBILITY_VAR}  # 5 hours

CELERY_RESULT_BACKEND = 'django-db'
CELERY_CACHE_BACKEND = 'django-cache'
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers.DatabaseScheduler'
CELERY_EMAIL_BACKEND = env('CELERY_EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
# 'django.core.mail.backends.console.EmailBackend'

# Sensible settings for celery
CELERY_TASK_ALWAYS_EAGER = env.bool('CELERY_TASK_ALWAYS_EAGER', False)
CELERY_ALWAYS_EAGER = env.bool('CELERY_TASK_ALWAYS_EAGER', False)
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
        'default': env('POST_OFFICE_BACKEND', default='djcelery_email.backends.CeleryEmailBackend')
    }
}
# 'django.core.mail.backends.console.EmailBackend'

LEAFLET_CONFIG = {
    'TILES': 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    'ATTRIBUTION_PREFIX': 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, '
                          'Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
    'MIN_ZOOM': 3,
    'MAX_ZOOM': 18,
}

# CartoDB settings
CARTODB_USERNAME = env('CARTODB_USERNAME', default='')
CARTODB_APIKEY = env('CARTODB_APIKEY', default='')


# Cronjobs

CRON_CLASSES = [
    'indicator.cron.IndicatorReportOverDueCronJob',
    'etools_prp.apps.core.cron.WorkspaceCronJob',
    'partner.cron.PartnerCronJob',
    'unicef.cron.ProgrammeDocumentCronJob'
]

# DRF settings
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'rest_framework.schemas.coreapi.AutoSchema',
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES':
        (
            'rest_framework.authentication.SessionAuthentication',
            'etools_prp.apps.utils.mixins.CustomJSONWebTokenAuthentication',
            'rest_framework.authentication.TokenAuthentication',
    ),
    'DATE_FORMAT': PRINT_DATA_FORMAT,
    'DATE_INPUT_FORMATS': ['iso-8601', PRINT_DATA_FORMAT],
    'EXCEPTION_HANDLER': 'etools_prp.apps.utils.exception_handler.detailed_exception_handler',
}


# Auth related settings
PASSWORDLESS_AUTH = {
    'PASSWORDLESS_AUTH_TYPES': ['EMAIL', ],
    'PASSWORDLESS_EMAIL_TOKEN_HTML_TEMPLATE_NAME': "account/passwordless_login_email.html",
    'PASSWORDLESS_EMAIL_NOREPLY_ADDRESS': 'no-reply@unicef.org',
    'PASSWORDLESS_CONTEXT_PROCESSORS': ['etools_prp.apps.account.context_processors.passwordless_token_email', ],
    'PASSWORDLESS_REGISTER_NEW_USERS': False,
    'PASSWORDLESS_EMAIL_SUBJECT': 'UNICEF Partner Reporting Portal: Your login link'
}

# Django-social-auth settings
KEY = env('AZURE_B2C_CLIENT_ID', default=None)
SECRET = env('AZURE_B2C_CLIENT_SECRET', default=None)

SOCIAL_AUTH_URL_NAMESPACE = 'social'
SOCIAL_AUTH_SANITIZE_REDIRECTS = False
SOCIAL_PASSWORD_RESET_POLICY = env('AZURE_B2C_PASS_RESET_POLICY', default="B2C_1_PasswordResetPolicy")
POLICY = env('AZURE_B2C_POLICY_NAME', default="b2c_1A_UNICEF_PARTNERS_signup_signin")

TENANT_ID = env('AZURE_B2C_TENANT', default='unicefpartners')
TENANT_B2C_URL = f'{TENANT_ID}.b2clogin.com'


SCOPE = ['openid', 'email']
IGNORE_DEFAULT_SCOPE = True
SOCIAL_AUTH_USERNAME_IS_FULL_EMAIL = True
SOCIAL_AUTH_PROTECTED_USER_FIELDS = ['email']
SOCIAL_AUTH_LOGIN_REDIRECT_URL = "/"
SOCIAL_AUTH_JSONFIELD_ENABLED = True

# TODO: Re-enable this back once we figure out all email domain names to whitelist from partners
# SOCIAL_AUTH_WHITELISTED_DOMAINS = ['unicef.org', 'google.com']

LOGIN_URL = "/landing"
LOGIN_ERROR_URL = "/unauthorized"
LOGOUT_URL = "/api/account/user-logout/"

SOCIAL_AUTH_PIPELINE = (
    # 'social_core.pipeline.social_auth.social_details',
    'etools_prp.apps.core.mixins.social_details',
    'social_core.pipeline.social_auth.social_uid',
    # allows based on emails being listed in 'WHITELISTED_EMAILS' or 'WHITELISTED_DOMAINS'
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    # 'social_core.pipeline.user.get_username',
    'etools_prp.apps.core.mixins.get_username',
    'social_core.pipeline.social_auth.associate_by_email',
    # 'social_core.pipeline.user.create_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    # 'social_core.pipeline.user.user_details',
    'etools_prp.apps.core.mixins.user_details',
)


# PMP API
PMP_API_ENDPOINT = env('PMP_API_ENDPOINT', default="http://172.18.0.1:8082/api")
PMP_API_USER = env('PMP_API_USER', default=None)
PMP_API_PASSWORD = env('PMP_API_PASSWORD', default=None)

# OCHA API
OCHA_API_USER = env('OCHA_API_USER', default='')
OCHA_API_PASSWORD = env('OCHA_API_PASSWORD', default='')

# assuming we're using Azure Storage:
# django-storages: https://django-storages.readthedocs.io/en/latest/backends/azure.html
AZURE_ACCOUNT_NAME = env('AZURE_ACCOUNT_NAME', default=None)
AZURE_ACCOUNT_KEY = env('AZURE_ACCOUNT_KEY', default=None)
AZURE_CONTAINER = env('AZURE_CONTAINER', default=None)

# Optionally can use S3
AWS_S3_ACCESS_KEY_ID = env('AWS_S3_ACCESS_KEY_ID', default=None)
AWS_S3_SECRET_ACCESS_KEY = env('AWS_S3_SECRET_ACCESS_KEY', default=None)
AWS_STORAGE_BUCKET_NAME = env('AWS_STORAGE_BUCKET_NAME', default=None)

if all([AWS_S3_ACCESS_KEY_ID, AWS_S3_SECRET_ACCESS_KEY, AWS_STORAGE_BUCKET_NAME]):
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    AWS_S3_FILE_OVERWRITE = False
    AWS_S3_SIGNATURE_VERSION = 's3v4'
    AWS_S3_REGION_NAME = env('AWS_S3_REGION_NAME', default='eu-central-1')

elif all([AZURE_ACCOUNT_NAME, AZURE_ACCOUNT_KEY, AZURE_CONTAINER]):
    DEFAULT_FILE_STORAGE = 'etools_prp.apps.core.mixins.EToolsAzureStorage'
    AZURE_SSL = True
    AZURE_AUTO_SIGN = True  # flag for automatically signing urls
    AZURE_ACCESS_POLICY_EXPIRY = 120  # length of time before signature expires in seconds
    AZURE_ACCESS_POLICY_PERMISSION = 'r'  # read permission

# JWT Authentication
# production overrides for django-rest-framework-jwt
if not DISABLE_JWT_AUTH:
    cert_path = "keys/jwt/certificate.txt"
    if all([AZURE_ACCOUNT_NAME, AZURE_ACCOUNT_KEY, AZURE_CONTAINER]):
        cert_path = "keys/jwt/certificate.pem"
        from storages.backends.azure_storage import AzureStorage
        storage = AzureStorage()
        with storage.open('keys/jwt/certificate.pem') as jwt_cert:
            with open(os.path.join(BASE_DIR, 'keys/jwt/certificate.pem'), 'wb+') as new_jwt_cert:
                new_jwt_cert.write(jwt_cert.read())

    with open(os.path.join(BASE_DIR, cert_path), 'rb') as public_key:
        public_key_text = public_key.read()  # noqa: F405
        certificate = load_pem_x509_certificate(public_key_text, default_backend())

        JWT_PUBLIC_KEY = certificate.public_key()

        SIMPLE_JWT.update({  # noqa: F405
            'SIGNING_KEY': SECRET_KEY,
            'VERIFYING_KEY': JWT_PUBLIC_KEY,
            'AUDIENCE': 'https://etools.unicef.org/',
        })

AUTHENTICATION_BACKENDS = (
    'etools_prp.apps.core.mixins.CustomAzureADBBCOAuth2',
    'django.contrib.auth.backends.ModelBackend',
)

# apm related - it's enough to set those as env variables, here just for documentation
# by default logging and apm is off, so below envs needs to be set per environment

# ELASTIC_APM_SERVICE_NAME=<app-name> # set app name visible on dashboard
# ELASTIC_APM_SECRET_TOKEN=<app-token> #secret token - needs to be exact same as on apm-server
# ELASTIC_APM_SERVER_URL=http://elastic.tivixlabs.com:8200 # apm-server url

SENTRY_DSN = env('SENTRY_DSN', default=None)
if SENTRY_DSN:
    sentry_sdk.init(dsn=SENTRY_DSN, integrations=[DjangoIntegration(), CeleryIntegration()],)

if DEBUG:
    CORS_ORIGIN_WHITELIST += ('http://localhost:8082', 'http://localhost:8081')
    FIXTURE_DIRS += ["fixtures"]
    INSTALLED_APPS += [
        'debug_toolbar',
    ]
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware', ]

DOCS_URL = 'api/docs/'

UNICEF_LOCATIONS_MODEL = 'core.Location'

# Matomo settings
MATOMO_HOST_URL = env('MATOMO_HOST_URL', default='https://unisitetracker.unicef.io/')
MATOMO_TRACKER_URL = env('MATOMO_TRACKER_URL', default='matomo.php')
MATOMO_SITE_ID = env('MATOMO_SITE_ID', default=None)
