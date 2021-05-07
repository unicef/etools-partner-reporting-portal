"""
WSGI config for django_api project.

It exposes the WSGI callable as a module-level variable named ``application``.

"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "etools_prp.config.settings")

application = get_wsgi_application()
