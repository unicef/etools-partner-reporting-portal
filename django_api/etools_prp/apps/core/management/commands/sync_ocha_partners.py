
from django.core.management.base import BaseCommand

from etools_prp.apps.ocha.tasks import sync_partners


class Command(BaseCommand):
    help = 'Creates a set of ORM objects for initial data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--country',
            action='store',
            dest='area',
            default=False,
            help='ISO2 Country code to update'
        )

    def handle(self, *args, **options):

        sync_partners(area=options['area'])

        print("Synchronization complete! ༼ つ ◕_◕ ༽つ")
