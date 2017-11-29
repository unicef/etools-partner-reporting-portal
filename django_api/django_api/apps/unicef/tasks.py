from celery import shared_task

from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Group
from django.db import transaction

from account.models import User

from core.api import PMP_API
from core.models import Workspace, GatewayType, Location
from core.serializers import PMPGatewayTypeSerializer, PMPLocationSerializer

from unicef.serializers import PMPProgrammeDocumentSerializer, PMPPDPartnerSerializer, PMPPDPersonSerializer, \
    PMPLLOSerializer, PMPPDResultLinkSerializer, PMPSectionSerializer, PMPReportingPeriodDatesSerializer
from unicef.models import ProgrammeDocument, Person, LowerLevelOutput, PDResultLink, Section, ReportingPeriodDates

from indicator.serializers import PMPIndicatorBlueprintSerializer, PMPDisaggregationSerializer, PMPDisaggregationValueSerializer, PMPReportableSerializer
from indicator.models import IndicatorBlueprint, Disaggregation, Reportable, DisaggregationValue

from partner.models import Partner


def process_model(process_model,
                  process_serializer, data, filter_dict):
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


def create_user(person):
    # Check if given person already exists in user model (by email)

    user, created = User.objects.get_or_create(
        email=person.email, username=person.email)
    if created:
        user.set_password("Passw0rd!")
    # Update credentials
    user.first_name = person.name
    user.save()
    return user


@shared_task
def process_programme_documents(fast=False, area=False):
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
    group, created = Group.objects.get_or_create(
        name="IP Authorized Officer")

    # Iterate over all workspaces
    if fast:
        workspaces = Workspace.objects.filter(business_area_code=area)  # 2130 for Iraq
    else:
        workspaces = Workspace.objects.all()

    with transaction.atomic():
        for workspace in workspaces:
            # Skip global workspace
            if workspace.business_area_code == "0":
                continue
            try:
                # Iterate over all pages
                page_url = None
                while (True):
                    try:
                        api = PMP_API()
                        list_data = api.programme_documents(
                            business_area_code=str(
                                workspace.business_area_code), url=page_url)
                    except Exception as e:
                        print("API Endpoint error: %s" % e)
                        break

                    print(
                        "Found %s PDs for %s Workspace (%s)" %
                        (list_data['count'],
                         workspace.title,
                         workspace.business_area_code))

                    for item in list_data['results']:
                        print("Processing PD: %s" % item['id'])

                        # Get partner data
                        partner_data = item['partner_org']

                        # Skip entries without unicef_vendor_number
                        if not partner_data['unicef_vendor_number']:
                            print("No unicef_vendor_number - skipping!")
                            continue

                        # Create/Assign Partner
                        if not partner_data['name']:
                            print("No partner name - skipping!")
                            continue
                        partner = process_model(
                            Partner, PMPPDPartnerSerializer, partner_data, {
                                'vendor_number': partner_data['unicef_vendor_number']})

                        # Assign partner
                        item['partner'] = partner.id

                        # Assign workspace
                        item['workspace'] = workspace.id

                        # Modify offices entry
                        item['offices'] = ", ".join(
                            item['offices']) if item['offices'] else "N/A"

                        if not item['start_date']:
                            print("Start date is required - skipping!")
                            continue

                        if not item['end_date']:
                            print("End date is required - skipping!")
                            continue

                        # Create PD
                        item['status'] = item['status'].title()[:3]
                        pd = process_model(ProgrammeDocument, PMPProgrammeDocumentSerializer, item,
                                                {'external_id': item['id'], 'workspace': workspace})

                        # Create unicef_focal_points
                        person_data_list = item['unicef_focal_points']
                        for person_data in person_data_list:
                            # Skip entries without unicef_vendor_number
                            if not person_data['email']:
                                continue
                            if not person_data['name']:
                                continue
                            person = process_model(Person, PMPPDPersonSerializer, person_data,
                                                        {'email': person_data['email']})
                            pd.unicef_focal_point.add(person)

                        # Create agreement_auth_officers
                        person_data_list = item['agreement_auth_officers']
                        for person_data in person_data_list:
                            # Skip entries without unicef_vendor_number
                            if not person_data['email']:
                                continue
                            if not person_data['name']:
                                continue
                            person = process_model(Person, PMPPDPersonSerializer, person_data,
                                                        {'email': person_data['email']})
                            pd.unicef_officers.add(person)

                            # Create user for this Person
                            u = create_user(person)
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
                            if not person_data['name']:
                                continue
                            person = process_model(Person, PMPPDPersonSerializer, person_data,
                                                        {'email': person_data['email']})
                            pd.partner_focal_point.add(person)

                            # Create user for this Person
                            u = create_user(person)
                            u.partner = partner
                            u.save()
                            u.workspaces.add(workspace)
                            u.groups.add(group)

                        # Create sections
                        section_data_list = item['sections']
                        for section_data in section_data_list:
                            section = process_model(Section, PMPSectionSerializer, section_data,
                                                   {'external_id': section_data['id']}) # Is section unique globally or per workspace?
                            pd.sections.add(section)

                        # Create Reporting Date Periods
                        reporting_periods = item['reporting_periods']
                        for reporting_period in reporting_periods:
                            reporting_period['programme_document'] = pd.id
                            process_model(ReportingPeriodDates, PMPReportingPeriodDatesSerializer, reporting_period,
                                                    {'external_id': reporting_period['id']})

                        if item['status'] not in ("draft, signed",):
                            # Mark all LLO/reportables assigned to this PD as inactive
                            llos = LowerLevelOutput.objects.filter(cp_output__programme_document=pd)
                            llos.update(active=False)
                            Reportable.objects.filter(lower_level_outputs__in=llos).update(active=False)

                            # Parsing expecting results and set them active, rest will stay inactive for this PD
                            for d in item['expected_results']:
                                # Create PDResultLink
                                rl = d['cp_output']
                                rl['programme_document'] = pd.id
                                rl['result_link'] = d['result_link']
                                pdresultlink = process_model(PDResultLink, PMPPDResultLinkSerializer, rl,
                                                                  {'external_id': rl['result_link'],
                                                                   'external_cp_output_id': rl['id']})

                                # Create LLO
                                d['cp_output'] = pdresultlink.id
                                llo = process_model(LowerLevelOutput, PMPLLOSerializer, d,
                                                         {'external_id': d['id']})
                                # Mark LLO as active
                                llo.active = True
                                llo.save()

                                # Iterate over indicators
                                for i in d['indicators']:
                                    # Check if indicator is cluster indicator
                                    i['is_cluster_indicator'] = True if i['cluster_indicator_id'] else False

                                    # If indicator is not cluster, create Blueprint
                                    # otherwise use parent Blueprint
                                    if i['is_cluster_indicator']:
                                        # Get blueprint of parent indicator
                                        try:
                                            blueprint = Reportable.objects.get(
                                                id=i['cluster_indicator_id']).blueprint
                                        except Reportable.DoesNotExist:
                                            print("Blueprint not exists! Skipping!")
                                            blueprint = None
                                            continue
                                    else:
                                        # Create IndicatorBlueprint
                                        i['disaggregatable'] = True
                                        blueprint = process_model(IndicatorBlueprint,
                                                                       PMPIndicatorBlueprintSerializer, i,
                                                                       {'external_id': i['blueprint_id']})

                                    locations = list()
                                    for l in i['locations']:
                                        # Create gateway for location
                                        # TODO: assign country after PMP add these
                                        # fields into API
                                        l['gateway_country'] = workspace.countries.all()[
                                            0].id  # TODO: later figure out how to fix this on eTools PMP side
                                        if not l['admin_level']:
                                            l['admin_level'] = 1
                                        if not l['pcode']:
                                            print("Location code empty! Skipping!")
                                            continue
                                        gateway = process_model(
                                            GatewayType, PMPGatewayTypeSerializer, l, {
                                                'name': l['pcode']})

                                        # Create location
                                        l['gateway'] = gateway.id
                                        location = process_model(
                                            Location, PMPLocationSerializer, l, {
                                                'p_code': l['pcode']})
                                        locations.append(location)

                                    # If indicator is not cluster, create
                                    # Disaggregation otherwise use parent
                                    # Disaggregation
                                    disaggregations = list()
                                    if i['is_cluster_indicator']:
                                        # Get Disaggregation
                                        try:
                                            disaggregations = list(
                                                Reportable.objects.get(
                                                    external_id=i['cluster_indicator_id']).disaggregations.all())
                                        except Reportable.DoesNotExist:
                                            disaggregations = list()
                                    else:
                                        # Create Disaggregation
                                        for dis in i['disaggregation']:
                                            dis['active'] = True
                                            disaggregation = process_model(Disaggregation,
                                                                                PMPDisaggregationSerializer, dis,
                                                                                {'name': dis['name']})
                                            disaggregations.append(disaggregation)

                                            # Create Disaggregation Values
                                            for dv in dis['disaggregation_values']:
                                                dv['disaggregation'] = disaggregation.id
                                                process_model(DisaggregationValue,
                                                                   PMPDisaggregationValueSerializer, dv,
                                                                   {'external_id': dv['id']})

                                    # Create Reportable
                                    i['blueprint_id'] = blueprint.id if blueprint else None
                                    i['location_ids'] = [l.id for l in locations]
                                    i['disaggregation_ids'] = [
                                        ds.id for ds in disaggregations]

                                    i['content_type'] = ContentType.objects.get_for_model(
                                        llo).id
                                    i['object_id'] = llo.id
                                    i['start_date'] = item['start_date']
                                    i['end_date'] = item['end_date']
                                    reportable = process_model(Reportable, PMPReportableSerializer, i,
                                                                    {'external_id': i['id']})
                                    reportable.active = True
                                    reportable.save()

                    # Check if another page exists
                    if list_data['next']:
                        print("Found new page")
                        page_url = list_data['next']
                    else:
                        print("End of workspace")
                        break
            except Exception as e:
                print(e)
                raise Exception(e)
