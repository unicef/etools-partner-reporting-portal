from django_nose import NoseTestSuiteRunner
from django.core.management import call_command


class CustomNoseTestSuiteRunner(NoseTestSuiteRunner):

    def setup_databases(self):
        config = super(CustomNoseTestSuiteRunner, self).setup_databases()

        # Load fixtures
        call_command('loaddata', 'sites', verbosity=0)
        call_command('loaddata', 'reporting_entities', verbosity=0)

        return config
