from django_cron import CronJobBase, Schedule

from core.api import PMP_API

from partner.serializers import PMPPartnerSerializer
from partner.models import Partner

class PartnerCronJob(CronJobBase):
    RUN_AT_TIMES = ['0:10']

    schedule = Schedule(run_at_times=RUN_AT_TIMES)
    code = 'partner.PartnerCronJob'    # a unique code


    def do(self):
        # Hit API
        api = PMP_API()
        data = api.partners()

        # Create partners
        try:
            for item in data:
                if item['hidden']:
                    continue
                print("Creating Partner: %s" % item['vendor_number'])
                try:
                    instance = Partner.objects.get(vendor_number=item['vendor_number'])
                    serializer = PMPPartnerSerializer(instance, data=item)
                except Partner.DoesNotExist:
                    serializer = PMPPartnerSerializer(data=item)
                if serializer.is_valid():
                    serializer.save()
                else:
                    raise Exception(serializer.errors)
        except Exception as e:
            print(e)
            raise Exception(e)
