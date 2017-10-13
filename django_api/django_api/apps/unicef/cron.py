from django_cron import CronJobBase, Schedule

from core.api import PMP_API
from core.models import Workspace

from unicef.serializers import PMPProgrammeDocumentSerializer, PMPPDPartnerSerializer
from unicef.models import ProgrammeDocument
from partner.models import Partner

class ProgrammeDocumentCronJob(CronJobBase):
    RUN_AT_TIMES = ['0:10']

    schedule = Schedule(run_at_times=RUN_AT_TIMES)
    code = 'partner.ProgrammeDocumentCronJob'    # a unique code


    def do(self):
        """
        Specifically each below expected_results instance has the following
        mapping.

        From this need to create indicator blueprint first, then disagg,
        then PDResultLink, then LL output, then Reportable attached to that LLO.
        {
            id: 8,                  --> LLO.external_id
            title: "blah",          --> LLO.title
            result_link: 47,        --> PDResultLink.external_id
            cp_output: {
                id: 312,            --> PDResultLink.external_cp_output_id
                title: "1.1 POLICY - NEWBORN & CHILD HEALTH"    --> PDResultLink.title
            },
            indicators: [ ]
        }
        """
        try:
            api = PMP_API()
            list_data = api.programme_documents()

            for item in list_data:
                print "Processing PD: %s" % item['id']

                # Create/Assign Partner
                partner_data = item['partner_org']
                try:
                    # Skip entries without unicef_vendor_number
                    if not partner_data['unicef_vendor_number']:
                        continue
                    partner = Partner.objects.get(vendor_number=partner_data['unicef_vendor_number'])
                    serializer = PMPPDPartnerSerializer(partner, data=partner_data)
                except Partner.DoesNotExist:
                    serializer = PMPPDPartnerSerializer(data=partner_data)
                if serializer.is_valid():
                    serializer.save()
                else:
                    raise Exception(serializer.errors)

                # Assign partner
                item['partner'] = partner.id

                # Assign workspace
                try:
                    workspace = Workspace.objects.get(business_area_code=item['business_area_code'])
                except Workspace.DoesNotExist:
                    # TODO: uncomment
                    #raise Exception("Workspace with code %s does not exists" % item['business_area_code'])
                    # TODO: remove line below
                    workspace = Workspace.objects.first()
                item['workspace'] = workspace.id


                # TODO: Remove all below this - temporary fixes due wrong API data
                # Modify offices entry
                item['offices'] = ", ".join(item['offices']) if item['offices'] else "N/A"
                if not item['start_date']:
                    item['start_date'] = "2017-09-01"
                if not item['end_date']:
                    item['end_date'] = "2017-11-30"
                # Modify currency if empty
                if not item['cso_budget_currency']:
                    item['cso_budget_currency'] = "USD"
                if not item['funds_received_currency']:
                    item['funds_received_currency'] = "USD"
                if not item['unicef_budget_currency']:
                    item['unicef_budget_currency'] = "USD"
                # TODO: End remove section


                # Create PD
                try:
                    instance = ProgrammeDocument.objects.get(external_id=item['id'])
                    serializer = PMPProgrammeDocumentSerializer(instance, data=item)
                except ProgrammeDocument.DoesNotExist:
                    serializer = PMPProgrammeDocumentSerializer(data=item)
                if serializer.is_valid():
                    serializer.save()
                else:
                    print serializer.errors
                    raise Exception(serializer.errors)
        except Exception as e:
            print e
            raise(1)
