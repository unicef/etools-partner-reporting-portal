
from django.core.management.base import BaseCommand

from ._privates import clean_up_data, generate_real_data


class Command(BaseCommand):
    help = 'Creates a set of ORM objects for initial data'

    def add_arguments(self, parser):

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

        parser.add_argument(
            '--update',
            action='store_true',
            dest='update',
            default=False,
            help='Only update PDs'
        )

        parser.add_argument(
            '--area',
            action='store',
            dest='area',
            default="2490",
            help='Business area code to update'
        )

    def handle(self, *args, **options):
        if options['clean_before']:
            clean_up_data()

        generate_real_data(fast=options['fast'], area=options['area'], update=options['update'])

        print("Synchronization complete! ༼ つ ◕_◕ ༽つ")
