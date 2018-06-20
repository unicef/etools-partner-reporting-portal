from django_nose import NoseTestSuiteRunner
from django.core.management import call_command
from django.contrib.auth.models import Group

from core.helpers import suppress_stdout
from core.management.commands._privates import generate_fake_data
from utils.groups.wrappers import GroupWrapper


class CustomNoseTestSuiteRunner(NoseTestSuiteRunner):

    def setup_databases(self):
        config = super(CustomNoseTestSuiteRunner, self).setup_databases()
        for group in GroupWrapper._instances:
            Group.objects.get_or_create(name=group.name)

        # Load fixtures
        call_command('loaddata', 'sites', verbosity=0)
        call_command('loaddata', 'reporting_entities', verbosity=0)
        call_command('loaddata', 'periodic_tasks', verbosity=0)

        with suppress_stdout():
            generate_fake_data(2, generate_all_disagg=True)
        return config
