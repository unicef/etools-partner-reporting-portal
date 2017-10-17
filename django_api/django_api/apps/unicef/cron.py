from django_cron import CronJobBase, Schedule

from core.api import PMP_API
from core.models import Workspace

from unicef.serializers import PMPProgrammeDocumentSerializer, PMPPDPartnerSerializer, PMPPDPersonSerializer, \
    PMPLLOSerializer, PMPPDResultLinkSerializer
from indicator.serializers import PMPIndicatorBlueprintSerializer
from unicef.models import ProgrammeDocument, Person, LowerLevelOutput, PDResultLink
from indicator.models import IndicatorBlueprint
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
        # Iterate over all workspaces
        # TODO: remove filtering for Jordan only - testing country with fulfilled indicators
        workspaces = Workspace.objects.filter(business_area_code="2340")
        for workspace in workspaces:
            try:
                # Iterate over all pages
                page_url = None
                while(True):
                    try:
                        api = PMP_API()
                        list_data = api.programme_documents(business_area_code=str(workspace.business_area_code), url=page_url)
                    except Exception as e:
                        print "API Endpoint error: %s" % e
                        break

                    print "Found %s PDs for %s Workspace (%s)" % (list_data['count'], workspace.title, workspace.business_area_code)

                    for item in list_data['results']:
                        print "Processing PD: %s - " % item['id'],

                        # Create/Assign Partner
                        partner_data = item['partner_org']
                        try:
                            # Skip entries without unicef_vendor_number
                            if not partner_data['unicef_vendor_number']:
                                print "No unicef_vendor_number - skipping!"
                                continue
                            partner = Partner.objects.get(vendor_number=partner_data['unicef_vendor_number'])
                            serializer = PMPPDPartnerSerializer(partner, data=partner_data)
                            if serializer.is_valid():
                                serializer.save()
                            else:
                                raise Exception(serializer.errors)
                        except Partner.DoesNotExist:
                            serializer = PMPPDPartnerSerializer(data=partner_data)
                            if serializer.is_valid():
                                partner = serializer.save()
                            else:
                                raise Exception(serializer.errors)

                        # Assign partner
                        item['partner'] = partner.id

                        # Assign workspace
                        item['workspace'] = workspace.id

                        # TODO: Remove all below this - temporary fixes due wrong API data
                        # Modify offices entry
                        item['offices'] = ", ".join(item['offices']) if item['offices'] else "N/A"
                        if not item['start_date']:
                            item['start_date'] = "2017-09-01"
                        if not item['end_date']:
                            item['end_date'] = "2017-11-30"
                        # TODO: Add real currency here
                        # if not item['cso_budget_currency']:
                        #     item['cso_budget_currency'] = "USD"
                        # if not item['funds_received_currency']:
                        #     item['funds_received_currency'] = "USD"
                        # if not item['unicef_budget_currency']:
                        #     item['unicef_budget_currency'] = "USD"
                        item['cso_budget_currency'] = "USD"
                        item['funds_received_currency'] = "USD"
                        item['unicef_budget_currency'] = "USD"
                        # title has more then 255 chars
                        item['title'] = item['title'][:255]

                        # TODO: End remove section


                        # Create PD
                        try:
                            pd = ProgrammeDocument.objects.get(external_id=item['id'], workspace=workspace)
                            print "Found!"
                            serializer = PMPProgrammeDocumentSerializer(pd, data=item)
                            if serializer.is_valid():
                                serializer.save()
                            else:
                                raise Exception(serializer.errors)
                        except ProgrammeDocument.DoesNotExist:
                            serializer = PMPProgrammeDocumentSerializer(data=item)
                            print "Created!"
                            if serializer.is_valid():
                                pd = serializer.save()
                            else:
                                raise Exception(serializer.errors)

                        # Create unicef_focal_points
                        person_data_list = item['unicef_focal_points']
                        for person_data in person_data_list:
                            #print "\tAdding Unicef Focal Point Person: %s" % person_data['email']
                            try:
                                # Skip entries without unicef_vendor_number
                                if not person_data['email']:
                                    continue
                                person = Person.objects.get(email=person_data['email'])
                                serializer = PMPPDPersonSerializer(person, data=person_data)
                                if serializer.is_valid():
                                    serializer.save()
                                else:
                                    raise Exception(serializer.errors)
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
                            #print "\tAdding Officer Person: %s" % person_data['email']
                            try:
                                # Skip entries without unicef_vendor_number
                                if not person_data['email']:
                                    continue
                                person = Person.objects.get(email=person_data['email'])
                                serializer = PMPPDPersonSerializer(person, data=person_data)
                                if serializer.is_valid():
                                    serializer.save()
                                else:
                                    raise Exception(serializer.errors)
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
                            #print "\tAdding Partner Focal Point Person: %s" % person_data['email']
                            try:
                                # Skip entries without unicef_vendor_number
                                if not person_data['email']:
                                    continue
                                person = Person.objects.get(email=person_data['email'])
                                serializer = PMPPDPersonSerializer(person, data=person_data)
                                if serializer.is_valid():
                                    serializer.save()
                                else:
                                    raise Exception(serializer.errors)
                            except Person.DoesNotExist:
                                serializer = PMPPDPersonSerializer(data=person_data)
                                if serializer.is_valid():
                                    person = serializer.save()
                                else:
                                    raise Exception(serializer.errors)
                            pd.partner_focal_point.add(person)

                        # Parsing expecting results
                        for d in item['expected_results']:

                            # Create PDResultLink
                            d['programme_document'] = pd.id
                            try:
                                pdresultlink = PDResultLink.objects.get(external_id=d['result_link'], external_cp_output_id=d['id'])
                                serializer = PMPPDResultLinkSerializer(pdresultlink, data=d)
                                if serializer.is_valid():
                                    serializer.save()
                                else:
                                    raise Exception(serializer.errors)
                            except PDResultLink.DoesNotExist:
                                serializer = PMPPDResultLinkSerializer(data=d)
                                if serializer.is_valid():
                                    pdresultlink = serializer.save()
                                else:
                                    raise Exception(serializer.errors)

                            # Create LLOs
                            d['cp_output'] = pdresultlink.id
                            try:
                                llo = LowerLevelOutput.objects.get(external_id=d['id'])
                                serializer = PMPLLOSerializer(llo, data=d)
                                if serializer.is_valid():
                                    serializer.save()
                                else:
                                    raise Exception(serializer.errors)
                            except LowerLevelOutput.DoesNotExist:
                                serializer = PMPLLOSerializer(data=d)
                                if serializer.is_valid():
                                    llo = serializer.save()
                                else:
                                    raise Exception(serializer.errors)

                            # Iterate over indicators
                            for i in d['indicators']:
                                # Create IndicatorBlueprint
                                i['disaggregatable'] = True
                                try:
                                    blueprint = IndicatorBlueprint.objects.get(external_id=i['id'])
                                    serializer = PMPIndicatorBlueprintSerializer(blueprint, data=i)
                                    if serializer.is_valid():
                                        serializer.save()
                                    else:
                                        raise Exception(serializer.errors)
                                except IndicatorBlueprint.DoesNotExist:
                                    serializer = PMPIndicatorBlueprintSerializer(data=i)
                                    if serializer.is_valid():
                                        blueprint = serializer.save()
                                    else:
                                        raise Exception(serializer.errors)

                    # Check if another page exists
                    if list_data['next']:
                        print "Found new page"
                        page_url = list_data['next']
                    else:
                        print "End of workspace"
                        break
            except Exception as e:
                print e
                raise Exception(e)
