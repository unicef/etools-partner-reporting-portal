# -*- coding: utf-8 -*-
from django.conf import settings
from django.core.management.base import BaseCommand

from core.models import ResponsePlan
from ocha.imports.project import get_project_list_for_plan, import_project
from ocha.imports.utilities import OCHAImportException
from partner.models import Partner


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
        parser.add_argument(
            '--rp',
            action='store',
            type=int,
            dest='rp',
            help='Response plan to pull for',
        )

    def handle(self, *args, **options):
        if not settings.DEBUG:
            self.stderr.write('This is a debug / testing script only. Don\'t run in production environments.')
            return

        bulk = options.get('bulk')
        _id = options.get('id')
        rp_id = options.get('rp')
        response_plan = ResponsePlan.objects.filter(id=rp_id).first()

        if _id:
            import_project(_id, Partner.objects.first().id, response_plan=response_plan, asynch=False)
        elif response_plan:
            project_list = get_project_list_for_plan(response_plan.external_id)
            for project in project_list:
                try:
                    import_project(project['id'], Partner.objects.first().id, response_plan=response_plan, asynch=False)
                except OCHAImportException:
                    continue
        elif bulk:
            try:
                start_id, end_id = map(int, bulk.split('-'))
            except (ValueError, KeyError):
                self.stderr.write('Invalid bulk format')
                return
            for project_id in range(start_id, end_id + 1):
                try:
                    import_project(project_id, Partner.objects.first().id, response_plan=response_plan, asynch=False)
                except Exception as e:
                    self.stderr.write('Error getting {}: {}'.format(project_id, e))
        else:
            self.stderr.write('Either bulk range or id is required.')
