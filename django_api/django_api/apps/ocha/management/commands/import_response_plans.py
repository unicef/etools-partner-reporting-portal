# -*- coding: utf-8 -*-
from django.conf import settings
from django.core.management.base import BaseCommand

from ocha.imports.response_plan import import_plans_for_country, import_response_plan


class Command(BaseCommand):
    help = 'Import all plans found in OCHA for country'

    def add_arguments(self, parser):
        parser.add_argument(
            '--country',
            action='store',
            dest='country',
            help='ISO 3 country code',
        )
        parser.add_argument(
            '--id',
            action='store',
            type=int,
            dest='id',
            help='ID to pull',
        )

    def handle(self, *args, **options):
        if not settings.DEBUG:
            self.stderr.write('This is a debug / testing script only. Don\'t run in production environments.')
            return

        country = options.get('country')
        _id = options.get('id')

        if country:
            import_plans_for_country(country)
        elif _id:
            import_response_plan(_id, asynch=False)
        else:
            self.stderr.write('Either country or id needs to be provided')
