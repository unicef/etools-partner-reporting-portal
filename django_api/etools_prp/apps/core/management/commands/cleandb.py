from django.core.management.base import BaseCommand

from ._privates import clean_up_data


class Command(BaseCommand):
    help = 'Wipes DB'

    def handle(self, *args, **options):
        clean_up_data()
