from django.core.management import call_command

import pytest


def pytest_configure(config):
    call_command('loaddata', 'sites', verbosity=0)
    call_command('loaddata', 'reporting_entities', verbosity=0)


@pytest.fixture(autouse=True)
def configure_test(settings, caplog, db):
    settings.CELERY_ALWAYS_EAGER = True
    call_command("update_notifications")
