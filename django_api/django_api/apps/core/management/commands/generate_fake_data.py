from django.core.management.base import BaseCommand

from ._privates import clean_up_data, generate_fake_data


class Command(BaseCommand):
    help = 'Creates a set of ORM objects for initial data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--quantity',
            action='store',
            type=int,
            dest='quantity',
            default=10,
            help='# of workspaces to create'
        )

        parser.add_argument(
            '--clean_before',
            action='store_true',
            dest='clean_before',
            default=False,
            help='Clean up all ORM objects before generating fake data'
        )

        parser.add_argument(
            '--fast',
            action='store_true',
            dest='fast',
            default=False,
            help='Use light fake data'
        )

    def handle(self, *args, **options):
        if options['clean_before']:
            clean_up_data()

        generate_fake_data(options['quantity'])

        print("Fake data has been generated! :D")
