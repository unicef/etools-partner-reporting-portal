
from django.core.management.base import BaseCommand

from etools_prp.apps.ocha.tasks import finish_response_plan_import


class Command(BaseCommand):
    help = 'Creates a reports in database based on current data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--response-plan',
            action='store',
            type=int,
            dest='response_plan',
            default=10,
            help='# of workspaces to create'
        )

    def handle(self, *args, **options):

        finish_response_plan_import(options['response_plan'])

        print("Generation complete! ༼ つ ◕_◕ ༽つ")
