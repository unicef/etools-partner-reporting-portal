from __future__ import absolute_import

# # set the default Django settings module for the 'celery' program.
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.staging')

from django.conf import settings
from django.db import connection

from celery import Celery, Task


# https://stackoverflow.com/a/36580629
class FaultTolerantTask(Task):
    """
    Implements after return hook to close the invalid connection.
    This way, django is forced to serve a new connection
    for the next task.
    """
    abstract = True

    def after_return(self, *args, **kwargs):
        connection.close()


app = Celery('etools-prp')

# Using a string here means the worker will not have to
# pickle the object when using Windows.
app.config_from_object('django.conf:settings')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)
