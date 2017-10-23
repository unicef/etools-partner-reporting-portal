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
        workspaces_data = api.workspaces()

        # Create workspaces
        try:
            for data in workspaces_data:
                print("Create Workspace: %s" % data['name'])
                if not data['country_short_code']:
                    print("\tNo country_short_code - skipping!")
                    continue
                serializer = PMPWorkspaceSerializer(data=data)
                if not serializer.is_valid():
                    raise Exception(serializer.errors)
                workspace = serializer.save()
                print("Create Country for Workspace: %s" % data['country_short_code'])
                country, created = Country.objects.get_or_create(name=workspace.title, country_short_code=data['country_short_code'])
                workspace.countries.add(country)
        except Exception as e:
            print(e)
            raise Exception(e)
