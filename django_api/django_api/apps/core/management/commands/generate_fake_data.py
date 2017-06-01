from django.core.management.base import BaseCommand

from _privates import clean_up_data, generate_fake_data


class Command(BaseCommand):
    help = 'Creates a set of ORM objects for initial data'

    def add_arguments(self, parser):
        parser.add_argument('quantity', type=int)

        parser.add_argument(
            '--clean_before',
            action='store_true',
            dest='clean_before',
            default=False,
            help='Clean up all ORM objects before generating fake data'
        )

    def handle(self, *args, **options):
        quantity = 50

        if options['clean_before']:
            clean_up_data()

        generate_fake_data(options['quantity'])

        print "Fake data are generated! :D"
