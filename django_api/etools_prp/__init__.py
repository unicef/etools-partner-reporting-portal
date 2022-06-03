# This will make sure the app is always imported when
# Django starts so that shared_task will use this app.
from etools_prp.config.celery import app as celery_app  # noqa

NAME = 'etools_prp'
VERSION = '9.13'

