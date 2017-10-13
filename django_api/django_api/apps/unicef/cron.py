from django_cron import CronJobBase, Schedule

from core.api import PMP_API
from core.models import Workspace

from unicef.serializers import PMPProgrammeDocumentSerializer, PMPPDPartnerSerializer, PMPPDPersonSerializer
from unicef.models import ProgrammeDocument, Person
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
                    partner = serializer.save()
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
                    pd = ProgrammeDocument.objects.get(external_id=item['id'])
                    serializer = PMPProgrammeDocumentSerializer(instance, data=item)
                except ProgrammeDocument.DoesNotExist:
                    serializer = PMPProgrammeDocumentSerializer(data=item)
                if serializer.is_valid():
                    print "Saving PD"
                    pd = serializer.save()
                else:
                    print serializer.errors
                    raise Exception(serializer.errors)

                # Create unicef_focal_points
                person_data_list = item['unicef_focal_points']
                for person_data in person_data_list:
                    print "Adding Person: %s" % person_data['email']
                    try:
                        # Skip entries without unicef_vendor_number
                        if not person_data['email']:
                            continue
                        person = Person.objects.get(email=person_data['email'])
                        serializer = PMPPDPersonSerializer(person, data=person_data)
                    except Person.DoesNotExist:
                        serializer = PMPPDPersonSerializer(data=person_data)
                    if serializer.is_valid():
                        person = serializer.save()
                    else:
                        raise Exception(serializer.errors)
                    pd.unicef_focal_point.add(person)

                    # Create agreement_auth_officers
                    person_data_list = item['agreement_auth_officers']
                    for person_data in person_data_list:
                        print "Adding Person: %s" % person_data['email']
                        try:
                            # Skip entries without unicef_vendor_number
                            if not person_data['email']:
                                continue
                            person = Person.objects.get(email=person_data['email'])
                            serializer = PMPPDPersonSerializer(person, data=person_data)
                        except Person.DoesNotExist:
                            serializer = PMPPDPersonSerializer(data=person_data)
                        if serializer.is_valid():
                            person = serializer.save()
                        else:
                            raise Exception(serializer.errors)
                        pd.unicef_officers.add(person)

                    # Create agreement_auth_officers
                    person_data_list = item['focal_points']
                    for person_data in person_data_list:
                        print "Adding Person: %s" % person_data['email']
                        try:
                            # Skip entries without unicef_vendor_number
                            if not person_data['email']:
                                continue
                            person = Person.objects.get(email=person_data['email'])
                            serializer = PMPPDPersonSerializer(person, data=person_data)
                        except Person.DoesNotExist:
                            serializer = PMPPDPersonSerializer(data=person_data)
                        if serializer.is_valid():
                            person = serializer.save()
                        else:
                            raise Exception(serializer.errors)
                        pd.partner_focal_point.add(person)



        except Exception as e:
            print e
            raise(1)
