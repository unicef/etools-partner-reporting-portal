from django.core.management import call_command


def pytest_configure(config):
    call_command('loaddata', 'sites', verbosity=0)
    call_command('loaddata', 'reporting_entities', verbosity=0)
