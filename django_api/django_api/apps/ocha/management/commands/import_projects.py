# -*- coding: utf-8 -*-
from django.conf import settings
from django.core.management.base import BaseCommand

from ocha.import_utilities import import_project


class Command(BaseCommand):
    help = 'Import specified partner projects'

    def add_arguments(self, parser):
        parser.add_argument(
            '--bulk',
            action='store',
            dest='bulk',
            help='Range of ids to pull, eg 50000-51000',
        )
        parser.add_argument(
            '--id',
            action='store',
            type=int,
            dest='id',
            help='ID to pull',
        )

    def handle(self, *args, **options):
        if settings.IS_PROD:
            self.stderr.write('This is a debug / testing script only. Don\'t run in production environments.')
            return

        bulk = options.get('bulk')
        _id = options.get('id')
        if _id:
            import_project(_id)
        elif bulk:
            try:
                start_id, end_id = map(int, bulk.split('-'))
            except (ValueError, KeyError):
                self.stderr.write('Invalid bulk format')
                return
            for project_id in range(start_id, end_id + 1):
                try:
                    import_project(project_id)
                except Exception as e:
                    self.stderr.write('Error getting {}: {}'.format(project_id, e))
        else:
            self.stderr.write('Either bulk range or id is required.')
