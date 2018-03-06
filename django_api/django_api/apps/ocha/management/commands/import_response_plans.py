# -*- coding: utf-8 -*-
from django.conf import settings
from django.core.management.base import BaseCommand

from ocha.import_utilities import import_plans_for_country


class Command(BaseCommand):
    help = 'Import all plans found in OCHA for country'

    def add_arguments(self, parser):
        parser.add_argument(
            '--country',
            action='store',
            dest='country',
            help='ISO 3 country code',
        )

    def handle(self, *args, **options):
        if settings.IS_PROD:
            self.stderr.write('This is a debug / testing script only. Don\'t run in production environments.')
            return

        import_plans_for_country(options['country'])
