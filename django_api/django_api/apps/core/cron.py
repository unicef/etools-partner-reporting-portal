from django_cron import CronJobBase, Schedule

from core.api import PMP_API
from core.serializers import PMPWorkspaceSerializer
from core.models import Country


class WorkspaceCronJob(CronJobBase):
    RUN_AT_TIMES = ['0:10']

    schedule = Schedule(run_at_times=RUN_AT_TIMES)
    code = 'core.WorkspaceCronJob'    # a unique code


    def do(self):

        # Hit API
        api = PMP_API()
        data = api.workspaces()

        # Create workspaces
        serializer = PMPWorkspaceSerializer(data=data, many=True)
        if not serializer.is_valid():
            raise Exception(serializer.errors)
        workspaces = serializer.save()

        # Create countries
        for workspace in workspaces:
            # TODO: switch to code when we get this data from PMP API
            country, created = Country.objects.get_or_create(name=workspace.title)
            workspace.countries.add(country)