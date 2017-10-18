from django_cron import CronJobBase, Schedule

from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Group

from account.models import User

from core.api import PMP_API
from core.models import Workspace, GatewayType, Location
from core.serializers import PMPGatewayTypeSerializer, PMPLocationSerializer

from unicef.serializers import PMPProgrammeDocumentSerializer, PMPPDPartnerSerializer, PMPPDPersonSerializer, \
    PMPLLOSerializer, PMPPDResultLinkSerializer
from indicator.serializers import PMPIndicatorBlueprintSerializer, PMPDisaggregationSerializer, PMPReportableSerializer
from unicef.models import ProgrammeDocument, Person, LowerLevelOutput, PDResultLink
from indicator.models import IndicatorBlueprint, Disaggregation, Reportable
from partner.models import Partner

class ProgrammeDocumentCronJob(CronJobBase):
    RUN_AT_TIMES = ['0:10']

    schedule = Schedule(run_at_times=RUN_AT_TIMES)
    code = 'partner.ProgrammeDocumentCronJob'    # a unique code


    def process_model(self, process_model, process_serializer, data, filter_dict):
        try:
            obj = process_model.objects.get(**filter_dict)
            serializer = process_serializer(obj, data=data)
            if serializer.is_valid():
                serializer.save()
            else:
                raise Exception(serializer.errors)
        except process_model.DoesNotExist:
            serializer = process_serializer(data=data)
            if serializer.is_valid():
                obj = serializer.save()
            else:
                raise Exception(serializer.errors)
        return obj

    def create_user(self, person):
        # Check if given person already exists in user model (by email)

        user, created = User.objects.get_or_create(email=person.email, username=person.email)
        if created:
            user.set_password("Passw0rd!")
        # Update credentials
        user.first_name = person.name
        user.save()
        return user


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
        # Get/Create Group that will be assigned to persons
        group, created = Group.objects.get_or_create(name="IP Authorized Officer")
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
                        print "Processing PD: %s" % item['id']

                        # Get partner data
                        partner_data = item['partner_org']

                        # Skip entries without unicef_vendor_number
                        if not partner_data['unicef_vendor_number']:
                            print "No unicef_vendor_number - skipping!"
                            continue

                        # Create/Assign Partner
                        partner = self.process_model(Partner, PMPPDPartnerSerializer, partner_data, {'vendor_number': partner_data['unicef_vendor_number']})

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
                        pd = self.process_model(ProgrammeDocument, PMPProgrammeDocumentSerializer, item,
                                                     {'external_id': item['id'], 'workspace': workspace})

                        # Create unicef_focal_points
                        person_data_list = item['unicef_focal_points']
                        for person_data in person_data_list:
                            # Skip entries without unicef_vendor_number
                            if not person_data['email']:
                                continue
                            person = self.process_model(Person, PMPPDPersonSerializer, person_data,
                                                    {'email': person_data['email']})
                            pd.unicef_focal_point.add(person)

                        # Create agreement_auth_officers
                        person_data_list = item['agreement_auth_officers']
                        for person_data in person_data_list:
                            # Skip entries without unicef_vendor_number
                            if not person_data['email']:
                                continue
                            person = self.process_model(Person, PMPPDPersonSerializer, person_data,
                                                        {'email': person_data['email']})
                            pd.unicef_officers.add(person)

                            # Create user for this Person
                            u = self.create_user(person)
                            u.partner = partner
                            u.workspaces.add(workspace)
                            u.groups.add(group)
                            u.save()

                        # Create agreement_auth_officers
                        person_data_list = item['focal_points']
                        for person_data in person_data_list:
                            # Skip entries without unicef_vendor_number
                            if not person_data['email']:
                                continue
                            person = self.process_model(Person, PMPPDPersonSerializer, person_data,
                                                        {'email': person_data['email']})
                            pd.partner_focal_point.add(person)

                            # Create user for this Person
                            u = self.create_user(person)
                            u.partner = partner
                            u.save()
                            u.workspaces.add(workspace)
                            u.groups.add(group)

                        # Parsing expecting results
                        for d in item['expected_results']:

                            # Create PDResultLink
                            d['programme_document'] = pd.id
                            pdresultlink = self.process_model(PDResultLink, PMPPDResultLinkSerializer, d,
                                                        {'external_id': d['result_link'], 'external_cp_output_id': d['id']})

                            # Create LLOs
                            d['cp_output'] = pdresultlink.id
                            llo = self.process_model(LowerLevelOutput, PMPLLOSerializer, d,
                                                              {'external_id': d['id']})

                            # Iterate over indicators
                            for i in d['indicators']:
                                # Create IndicatorBlueprint
                                i['disaggregatable'] = True
                                blueprint = self.process_model(IndicatorBlueprint, PMPIndicatorBlueprintSerializer, i,
                                                         {'external_id': i['id']})

                                locations = list()
                                for l in i['locations']:
                                    # Create gateway for location
                                    # TODO: assign country after PMP add these fields into API
                                    l['gateway_country'] = workspace.countries.all()[0].id
                                    l['admin_level'] = 1
                                    gateway = self.process_model(GatewayType, PMPGatewayTypeSerializer, l, {'name': l['pcode']})

                                    # Create location
                                    l['gateway'] = gateway.id
                                    location = self.process_model(Location, PMPLocationSerializer, l, {'p_code': l['pcode']})
                                    locations.append(location)

                                # Create Disaggregations
                                disaggregations = list()
                                for dis in i['disaggregation']:
                                    dis['active'] = True
                                    disaggregation = self.process_model(Disaggregation, PMPDisaggregationSerializer, dis,
                                                                  {'name': dis['name']})
                                    disaggregations.append(disaggregation)

                                # Create Reportable
                                i['blueprint_id'] = blueprint.id
                                i['location_ids'] = [l.id for l in locations]
                                i['disaggregation_ids'] = [ds.id for ds in disaggregations]
                                i['is_cluster_indicator'] = True if i['cluster_indicator_id'] else False
                                i['content_type'] = ContentType.objects.get_for_model(llo).id
                                i['object_id'] = llo.id
                                i['start_date'] = item['start_date']
                                i['end_date'] = item['end_date']
                                self.process_model(Reportable, PMPReportableSerializer, i,
                                                                    {'external_id': i['id']})

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
