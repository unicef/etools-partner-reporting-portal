
from django.core.management.base import BaseCommand

from ._privates import generate_reports


class Command(BaseCommand):
    help = 'Creates a reports in database based on current data'

    def handle(self, *args, **options):

        generate_reports()

        print("Generation complete! ༼ つ ◕_◕ ༽つ")
