from __future__ import absolute_import
from .base import *

IS_TEST = True

MIGRATION_MODULES = {
    'account': None,
    'admin': None,
    'auth': None,
    'cluster': None,
    'contenttypes': None,
    'core': None,
    'indicator': None,
    'partner': None,
    'sessions': None,
    'unicef': None,
}

# DATABASES['default'] = {
#     'ENGINE': 'django.db.backends.sqlite3',
#     # 'NAME': ':memory:?cache=shared',
#     # 'TEST_NAME': ':memory:?cache=shared',
#     'NAME': ':memory:',
#     'TEST_NAME': ':memory:',
# }
