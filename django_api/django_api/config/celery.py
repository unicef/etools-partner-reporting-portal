from contextlib import contextmanager
from time import monotonic

from django.core.cache import cache
from django.db import connection

from celery import Celery, Task
from celery.utils.log import get_task_logger

# # set the default Django settings module for the 'celery' program.
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.staging')

logger = get_task_logger(__name__)

LOCK_EXPIRE = 60 * 45  # Lock expires in 45 minutes


# http://docs.celeryproject.org/en/latest/tutorials/task-cookbook.html#ensuring-a-task-is-only-executed-one-at-a-time
@contextmanager
def cache_lock(lock_id, oid):
    timeout_at = monotonic() + LOCK_EXPIRE - 3

    # cache.add fails if the key already exists
    status = cache.add(lock_id, oid, LOCK_EXPIRE)

    try:
        yield status
    finally:
        # memcache delete is very slow, but we have to use it to take
        # advantage of using add() for atomic locking
        if monotonic() < timeout_at and status:
            # don't release the lock if we exceeded the timeout
            # to lessen the chance of releasing an expired lock
            # owned by someone else
            # also don't release the lock if we didn't acquire it
            cache.delete(lock_id)


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
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
