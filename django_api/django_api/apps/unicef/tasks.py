import logging
import datetime

from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.db import transaction

from celery import shared_task

from rest_framework.exceptions import ValidationError

from core.api import PMP_API
from core.models import Workspace, GatewayType, Location, PRPRole
from core.serializers import PMPGatewayTypeSerializer, PMPLocationSerializer
from core.common import PARTNER_ACTIVITY_STATUS, PRP_ROLE_TYPES, EXTERNAL_DATA_SOURCES

from partner.models import PartnerActivity
from partner.serializers import (
    PMPPartnerSerializer,
)

from unicef.serializers import (
    PMPProgrammeDocumentSerializer,
    PMPPDPersonSerializer,
    PMPLLOSerializer,
    PMPPDResultLinkSerializer,
    PMPSectionSerializer,
    PMPReportingPeriodDatesSerializer,
    PMPReportingPeriodDatesSRSerializer,
)
from unicef.models import ProgrammeDocument, Person, LowerLevelOutput, PDResultLink, Section, ReportingPeriodDates

from indicator.serializers import PMPIndicatorBlueprintSerializer, PMPDisaggregationSerializer, \
    PMPDisaggregationValueSerializer, PMPReportableSerializer
from indicator.models import (
    IndicatorBlueprint,
    Disaggregation,
    Reportable,
    DisaggregationValue,
    ReportableLocationGoal,
    create_pa_reportables_from_ca,
    create_reportable_for_pp_from_ca_reportable,
)

from partner.models import Partner, PartnerProject, PartnerActivityProjectContext


logger = logging.getLogger(__name__)

User = get_user_model()
FIRST_NAME_MAX_LENGTH = User._meta.get_field('first_name').max_length
LAST_NAME_MAX_LENGTH = User._meta.get_field('last_name').max_length


def process_model(model_to_process, process_serializer, data, filter_dict):
    instance = model_to_process.objects.filter(**filter_dict).first()
    serializer = process_serializer(instance=instance, data=data)
    serializer.is_valid(raise_exception=True)
    return serializer.save()


def create_user_for_person(person):
    # Check if given person already exists in user model (by email)
    user, created = User.objects.get_or_create(username=person.email, defaults={
        'email': person.email
    })
    if created:
        user.set_unusable_password()
        user.send_email_notification_on_create('IP')

    if person.name:
        name_parts = person.name.split()
        if len(name_parts) == 2:
            user.first_name = name_parts[0][:FIRST_NAME_MAX_LENGTH]
            user.last_name = name_parts[1][:LAST_NAME_MAX_LENGTH]
        else:
            user.first_name = person.name[:FIRST_NAME_MAX_LENGTH]

    user.save()
    return user


def save_person_and_user(person_data, create_user=False):
    try:
        person = process_model(
            Person, PMPPDPersonSerializer, person_data, {'email': person_data['email']}
        )
    except ValidationError:
        logger.exception('Error trying to save Person model with {}'.format(person_data))
        return None, None

    if create_user:
        user = create_user_for_person(person)
    else:
        user = None

    return person, user


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
    # # Get/Create Group that will be assigned to persons
    # partner_authorized_officer_group = PartnerAuthorizedOfficerRole.as_group()

    # Iterate over all workspaces
    if fast:
        workspaces = Workspace.objects.filter(business_area_code=area)  # 2130 for Iraq
    else:
        workspaces = Workspace.objects.all()

    with transaction.atomic():
        for workspace in workspaces:
            # Skip global workspace and Syria Cross Border / MENARO
            if workspace.business_area_code in ("0", "234R"):
                continue

            try:
                # Iterate over all pages
                page_url = None
                while True:
                    try:
                        api = PMP_API()
                        list_data = api.programme_documents(
                            business_area_code=str(
                                workspace.business_area_code), url=page_url)
                    except Exception as e:
                        logger.exception("API Endpoint error: %s" % e)
                        break

                    logger.info(
                        "Found %s PDs for %s Workspace (%s)" %
                        (list_data['count'],
                         workspace.title,
                         workspace.business_area_code))

                    for item in list_data['results']:
                        logger.info("Processing PD: %s" % item['id'])

                        # Get partner data
                        partner_data = item['partner_org']

                        # Skip entries without unicef_vendor_number
                        if not partner_data['unicef_vendor_number']:
                            logger.warning("No unicef_vendor_number - skipping!")
                            continue

                        # Create/Assign Partner
                        if not partner_data['name']:
                            logger.warning("No partner name - skipping!")
                            continue

                        partner_data['external_id'] = partner_data.get('id', '#')

                        try:
                            partner = process_model(
                                Partner,
                                PMPPartnerSerializer,
                                partner_data, {
                                    'vendor_number': partner_data['unicef_vendor_number']
                                }
                            )
                        except ValidationError:
                            logger.exception('Error trying to save Partner model with {}'.format(partner_data))
                            continue

                        # Assign partner
                        item['partner'] = partner.id

                        # Assign workspace
                        item['workspace'] = workspace.id

                        # Modify offices entry
                        item['offices'] = ", ".join(
                            item['offices']) if item['offices'] else "N/A"

                        if not item['start_date']:
                            logger.warning("Start date is required - skipping!")
                            continue

                        if not item['end_date']:
                            logger.warning("End date is required - skipping!")
                            continue

                        # Create PD
                        item['status'] = item['status'].title()[:3]
                        item['external_business_area_code'] = workspace.business_area_code
                        # Amendment date formatting
                        for idx in range(len(item['amendments'])):
                            item['amendments'][idx]['signed_date'] = datetime.datetime.strptime(
                                item['amendments'][idx]['signed_date'], "%Y-%m-%d"
                            ).strftime("%d-%b-%Y")

                        try:
                            pd = process_model(
                                ProgrammeDocument, PMPProgrammeDocumentSerializer, item,
                                {
                                    'external_id': item['id'],
                                    'workspace': workspace,
                                    'external_business_area_code': workspace.business_area_code,
                                }
                            )
                        except KeyError as e:
                            logger.exception('Error trying to save ProgrammeDocument model with {}'.format(item), e)
                            continue

                        pd.unicef_focal_point.all().update(active=False)
                        pd.unicef_officers.all().update(active=False)
                        pd.partner_focal_point.all().update(active=False)

                        # Create unicef_focal_points
                        person_data_list = item['unicef_focal_points']
                        for person_data in person_data_list:
                            person, user = save_person_and_user(person_data)
                            if not person:
                                continue

                            person.active = True
                            person.save()
                            pd.unicef_focal_point.add(person)

                        # Create agreement_auth_officers
                        person_data_list = item['agreement_auth_officers']
                        for person_data in person_data_list:
                            person, user = save_person_and_user(person_data, create_user=True)
                            if not person:
                                continue

                            person.active = True
                            person.save()
                            pd.unicef_officers.add(person)

                            user.partner = partner
                            user.save()

                            obj, created = PRPRole.objects.get_or_create(
                                user=user,
                                role=PRP_ROLE_TYPES.ip_authorized_officer,
                                workspace=workspace,
                            )

                            if created:
                                obj.send_email_notification()

                            is_active = person_data.get('active')

                            if not created and obj.is_active and is_active is False:
                                obj.is_active = is_active
                                obj.save()

                        # Create focal_points
                        person_data_list = item['focal_points']
                        for person_data in person_data_list:
                            person, user = save_person_and_user(person_data)
                            if not person:
                                continue

                            person.active = True
                            person.save()
                            pd.partner_focal_point.add(person)

                        # Create sections
                        section_data_list = item['sections']
                        for section_data in section_data_list:
                            section = process_model(
                                Section, PMPSectionSerializer, section_data, {'external_id': section_data['id']}
                            )  # Is section unique globally or per workspace?
                            pd.sections.add(section)

                        # Create Reporting Date Periods for QPR and HR report type
                        reporting_requirements = item['reporting_requirements']
                        for reporting_requirement in reporting_requirements:
                            reporting_requirement['programme_document'] = pd.id
                            reporting_requirement['external_business_area_code'] = workspace.business_area_code
                            process_model(
                                ReportingPeriodDates,
                                PMPReportingPeriodDatesSerializer,
                                reporting_requirement,
                                {
                                    'external_id': reporting_requirement['id'],
                                    'report_type': reporting_requirement['report_type'],
                                    'programme_document': pd.id,
                                    'external_business_area_code': workspace.business_area_code,
                                },
                            )

                        # Create Reporting Date Periods for SR report type
                        special_reports = item['special_reports'] if 'special_reports' in item else []
                        for special_report in special_reports:
                            special_report['programme_document'] = pd.id
                            special_report['report_type'] = 'SR'
                            special_report['external_business_area_code'] = workspace.business_area_code
                            process_model(
                                ReportingPeriodDates,
                                PMPReportingPeriodDatesSRSerializer,
                                special_report,
                                {
                                    'external_id': special_report['id'],
                                    'report_type': 'SR',
                                    'programme_document': pd.id,
                                    'external_business_area_code': workspace.business_area_code,
                                },
                            )

                        if item['status'] not in ("draft, signed",):
                            # Mark all LLO/reportables assigned to this PD as inactive
                            llos = LowerLevelOutput.objects.filter(cp_output__programme_document=pd)
                            llos.update(active=False)
                            Reportable.objects.filter(lower_level_outputs__in=llos).update(active=False)

                            # Mark all ReportableLocationGoal instances referred in LLO Reportables as inactive
                            ReportableLocationGoal.objects.filter(reportable__lower_level_outputs__in=llos).update(is_active=False)

                            # Parsing expecting results and set them active, rest will stay inactive for this PD
                            for d in item['expected_results']:
                                # Create PDResultLink
                                rl = d['cp_output']
                                rl['programme_document'] = pd.id
                                rl['result_link'] = d['result_link']
                                rl['external_business_area_code'] = workspace.business_area_code
                                pdresultlink = process_model(
                                    PDResultLink, PMPPDResultLinkSerializer,
                                    rl, {
                                            'external_id': rl['result_link'],
                                            'external_cp_output_id': rl['id'],
                                            'programme_document': pd.id,
                                            'external_business_area_code': workspace.business_area_code,
                                        }
                                )

                                # Create LLO
                                d['cp_output'] = pdresultlink.id
                                d['external_business_area_code'] = workspace.business_area_code

                                llo = process_model(
                                    LowerLevelOutput, PMPLLOSerializer, d,
                                    {
                                        'external_id': d['id'],
                                        'cp_output__programme_document': pd.id,
                                        'external_business_area_code': workspace.business_area_code,
                                    }
                                )

                                # Mark LLO as active
                                llo.active = True
                                llo.save()

                                # Iterate over indicators
                                for i in d['indicators']:
                                    # Check if indicator is cluster indicator
                                    i['is_cluster_indicator'] = True if i['cluster_indicator_id'] else False
                                    i['is_unicef_hf_indicator'] = i['is_high_frequency']

                                    # If indicator is not cluster, create Blueprint
                                    # otherwise use parent Blueprint
                                    if i['is_cluster_indicator']:
                                        # Get blueprint of parent indicator
                                        try:
                                            blueprint = Reportable.objects.get(
                                                id=i['cluster_indicator_id']).blueprint
                                        except Reportable.DoesNotExist:
                                            logger.exception("Blueprint not exists! Skipping!")
                                            continue
                                    else:
                                        # Create IndicatorBlueprint
                                        i['disaggregatable'] = True
                                        # TODO: Fix db schema to accommodate larger lengths
                                        i['title'] = i['title'][:255] if i['title'] else "unknown"

                                        if i['unit'] == '':
                                            if int(i['baseline']['d']) == 1:
                                                i['unit'] = 'number'
                                                i['display_type'] = 'number'

                                            elif int(i['baseline']['d']) != 1:
                                                i['unit'] = 'percentage'
                                                i['display_type'] = 'percentage'

                                        elif i['unit'] == 'number':
                                            i['display_type'] = 'number'

                                        blueprint = process_model(
                                            IndicatorBlueprint,
                                            PMPIndicatorBlueprintSerializer,
                                            i, {
                                                    'external_id': i['blueprint_id'],
                                                    'reportables__lower_level_outputs__cp_output__programme_document': pd.id
                                                }
                                        )

                                    locations = list()
                                    for l in i['locations']:
                                        # Create gateway for location
                                        # TODO: assign country after PMP add these
                                        # fields into API
                                        country = workspace.countries.first()
                                        l['gateway_country'] = country.id

                                        if l['admin_level'] is None:
                                            logger.warning("Admin level empty! Skipping!")
                                            continue

                                        if l['pcode'] is None or not l['pcode']:
                                            logger.warning("Location code empty! Skipping!")
                                            continue

                                        l['location_type'] = '{}-Admin Level {}'.format(
                                            country.country_short_code,
                                            l['admin_level']
                                        )

                                        gateway = process_model(
                                            GatewayType,
                                            PMPGatewayTypeSerializer,
                                            l,
                                            {
                                                'admin_level': l['admin_level'],
                                                'country': l['gateway_country'],
                                            },
                                        )

                                        # Create location
                                        l['gateway'] = gateway.id
                                        location = process_model(
                                            Location,
                                            PMPLocationSerializer,
                                            l,
                                            {
                                                'gateway': l['gateway'],
                                                'p_code': l['pcode'],
                                            }
                                        )
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
                                                    id=i['cluster_indicator_id']).disaggregations.all())
                                        except Reportable.DoesNotExist:
                                            disaggregations = list()
                                    else:
                                        # Create Disaggregation
                                        for dis in i['disaggregation']:
                                            dis['active'] = True
                                            disaggregation = process_model(
                                                Disaggregation, PMPDisaggregationSerializer,
                                                dis, {
                                                        'name': dis['name'],
                                                        'reportable__lower_level_outputs__cp_output__programme_document__workspace': pd.workspace.id
                                                    }
                                            )
                                            disaggregations.append(disaggregation)

                                            # Create Disag1gregation Values
                                            for dv in dis['disaggregation_values']:
                                                dv['disaggregation'] = disaggregation.id
                                                process_model(
                                                    DisaggregationValue,
                                                    PMPDisaggregationValueSerializer,
                                                    dv,
                                                    {
                                                        'disaggregation_id': disaggregation.id,
                                                        'value': dv['value'],
                                                    }
                                                )

                                    # Create Reportable
                                    i['blueprint_id'] = blueprint.id if blueprint else None
                                    i['disaggregation_ids'] = [ds.id for ds in disaggregations]

                                    i['content_type'] = ContentType.objects.get_for_model(llo).id
                                    i['object_id'] = llo.id
                                    i['start_date'] = item['start_date']
                                    i['end_date'] = item['end_date']

                                    reportable = process_model(
                                        Reportable,
                                        PMPReportableSerializer,
                                        i, {
                                                'external_id': i['id'],
                                                'lower_level_outputs__cp_output__programme_document': pd.id
                                            }
                                    )
                                    reportable.active = i['is_active']
                                    partner_activity = None

                                    # Associate this LLO Reportable with ClusterActivity Reportable
                                    # for dual reporting
                                    if 'cluster_indicator_id' in i and i['cluster_indicator_id'] is not None:
                                        try:
                                            cai = Reportable.objects.get(id=int(i['cluster_indicator_id']))
                                            reportable.ca_indicator_used_by_reporting_entity = cai

                                            # Partner Project for this PD check
                                            if not PartnerProject.objects.filter(
                                                external_id="{}/{}".format(workspace.business_area_code, pd.id),
                                                external_source=EXTERNAL_DATA_SOURCES.UNICEF
                                            ).exists():
                                                pp = PartnerProject.objects.create(
                                                    external_id="{}/{}".format(workspace.business_area_code, pd.id),
                                                    external_source=EXTERNAL_DATA_SOURCES.UNICEF,
                                                    title=item['title'],
                                                    partner=partner,
                                                    start_date=item['start_date'],
                                                    end_date=item['end_date'],
                                                )

                                                logger.info(
                                                        "Created a new PartnerProject "
                                                        "from PD: " + str(item['number'])
                                                    )
                                            else:
                                                pp = PartnerProject.objects.get(
                                                    external_id="{}/{}".format(area, item['id']),
                                                    external_source=EXTERNAL_DATA_SOURCES.UNICEF
                                                )

                                            # Force adoption of PartnerActivity from ClusterActivity Indicator
                                            if pd.partner.id not in cai.content_object.partner_activities.values_list(
                                                    'partner', flat=True):
                                                try:
                                                    partner_activity = PartnerActivity.objects.create(
                                                        title=cai.blueprint.title,
                                                        partner=pd.partner,
                                                        cluster_activity=cai.content_object,
                                                    )

                                                    PartnerActivityProjectContext.objects.update_or_create(
                                                        defaults={
                                                            'activity': partner_activity,
                                                            'project': pp,
                                                        },
                                                        start_date=item['start_date'],
                                                        end_date=item['end_date'],
                                                        status=PARTNER_ACTIVITY_STATUS.ongoing,
                                                    )

                                                except Exception as e:
                                                    logger.exception(
                                                        "Cannot force adopt PartnerActivity and its project context from ClusterActivity "
                                                        "for dual reporting - skipping link!: " + str(e)
                                                    )
                                                    continue
                                                else:
                                                    try:
                                                        # Grab Cluster Activity instance from
                                                        # this newly created Partner Activity instance
                                                        create_pa_reportables_from_ca(
                                                            partner_activity, cai.content_object
                                                        )
                                                    except Exception as e:
                                                        logger.exception(
                                                            "Cannot create Reportables for adopted "
                                                            "PartnerActivity from ClusterActivity "
                                                            "for dual reporting - skipping link!: " + str(e)
                                                        )

                                                        partner_activity.delete()
                                                        continue

                                                    try:
                                                        # Grab Cluster Activity instance from
                                                        # this newly created Partner Activity instance
                                                        create_reportable_for_pp_from_ca_reportable(
                                                            pp, cai
                                                        )
                                                    except Exception as e:
                                                        logger.exception(
                                                            "Cannot create Reportables for PD Partner Project "
                                                            "from referenced Cluster Activity Reportable "
                                                            " - skipping link!: " + str(e)
                                                        )

                                                        continue

                                        except Reportable.DoesNotExist:
                                            logger.exception(
                                                "No ClusterActivity Reportable found "
                                                "for dual reporting - skipping link!"
                                            )

                                    reportable.save()

                                    rlgs = ReportableLocationGoal.objects.filter(reportable=reportable)

                                    # If the locations for this reportable has been created before
                                    if rlgs.exists():
                                        existing_locs = set(rlgs.values_list('location', flat=True))
                                        new_locs = set(map(lambda x: x.id, locations)) - existing_locs

                                        # Creating M2M Through model instances for new locations
                                        reportable_location_goals = [
                                            ReportableLocationGoal(
                                                reportable=reportable,
                                                location=l,
                                                is_active=True,
                                            ) for l in Location.objects.filter(id__in=new_locs)
                                        ]

                                    else:
                                        # Creating M2M Through model instances
                                        reportable_location_goals = [
                                            ReportableLocationGoal(
                                                reportable=reportable,
                                                location=l,
                                                is_active=True,
                                            ) for l in locations
                                        ]

                                    ReportableLocationGoal.objects.bulk_create(reportable_location_goals)

                                    ReportableLocationGoal.objects.filter(reportable=reportable, location__in=locations).update(is_active=True)

                                    if partner_activity:
                                        # Force update on PA Reportable instance for location update
                                        for pa_reportable in Reportable.objects.filter(partner_activity_project_contexts__activity=partner_activity):
                                            llo_locations = reportable.locations.values_list('id', flat=True)
                                            pai_locations = pa_reportable.locations.values_list('id', flat=True)
                                            loc_diff = pai_locations.exclude(id__in=llo_locations)

                                            # Add new locations from LLO Reportable to PA Reportable
                                            if loc_diff.exists():
                                                # Creating M2M Through model instances
                                                reportable_location_goals = [
                                                    ReportableLocationGoal(
                                                        reportable=reportable,
                                                        location=l,
                                                        is_active=True,
                                                    ) for l in loc_diff
                                                ]

                                                ReportableLocationGoal.objects.bulk_create(reportable_location_goals)

                                                # We don't overwrite is_active flag on PartnerActivity reportable from LLO locations here
                                                # since Cluster may use those locations

                    # Check if another page exists
                    if list_data['next']:
                        logger.info("Found new page")
                        page_url = list_data['next']
                    else:
                        logger.info("End of workspace")
                        break
            except Exception as e:
                logger.exception(e)
                raise
