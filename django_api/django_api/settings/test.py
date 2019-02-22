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
    'guardian': None,
}

PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]
