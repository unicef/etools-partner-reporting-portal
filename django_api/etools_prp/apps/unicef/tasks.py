import logging

from django.contrib.auth import get_user_model
from django.db import transaction

from celery import shared_task

from etools_prp.apps.core.api import PMP_API
from etools_prp.apps.core.models import Workspace
from etools_prp.apps.unicef.models import LowerLevelOutput, PDResultLink, ReportingPeriodDates
from etools_prp.apps.unicef.pgd_sync.update_create_date_period import (
    update_create_qpr_n_hr_date_periods,
    update_create_sr_date_periods,
)
from etools_prp.apps.unicef.pgd_sync.update_create_gd import update_create_gd
from etools_prp.apps.unicef.pgd_sync.update_create_partner import update_create_partner
from etools_prp.apps.unicef.pgd_sync.update_create_person import (
    update_create_agreement_auth_officers,
    update_create_focal_points,
    update_create_unicef_focal_points,
)
from etools_prp.apps.unicef.pgd_sync.update_create_section import update_create_sections
from etools_prp.apps.unicef.pgd_sync.utils import process_model
from etools_prp.apps.unicef.ppd_sync.process_pd_item import process_pd_item
from etools_prp.apps.unicef.serializers import (
    PMPLLOSerializer,
    PMPPDResultLinkSerializer,
    PMPReportingPeriodDatesSerializer,
    PMPReportingPeriodDatesSRSerializer,
)

logger = logging.getLogger(__name__)
User = get_user_model()
FIRST_NAME_MAX_LENGTH = User._meta.get_field('first_name').max_length
LAST_NAME_MAX_LENGTH = User._meta.get_field('last_name').max_length


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

    for workspace in workspaces:
        # Skip global workspace and Syria Cross Border / MENARO
        if workspace.business_area_code in ("0", "234R"):
            continue

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
                with transaction.atomic():
                    try:
                        process_pd_item(item, workspace)
                    except Exception as e:
                        logger.exception(e)

            # Check if another page exists
            if list_data['next']:
                logger.info("Found new page")
                page_url = list_data['next']
            else:
                logger.info("End of workspace")
                break


@shared_task
def process_government_documents(fast=False, area=False):
    """
    Specifically each below expected_results instance has the following
    mapping.

    {
        id: 8,                  --> LLO.external_id
        title: "blah",          --> LLO.title
        result_link: 47,        --> PDResultLink.external_id
        cp_output: {
            id: 312,            --> PDResultLink.external_cp_output_id
            title: "1.1 POLICY - NEWBORN & CHILD HEALTH"    --> PDResultLink.title
        }
    }
    """
    # Iterate over all workspaces
    if fast:
        workspaces = Workspace.objects.filter(business_area_code=area)  # 0060 for Afghanistan
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
                        list_data = api.government_documents(
                            business_area_code=str(workspace.business_area_code), url=page_url)
                    except Exception as e:
                        logger.exception("API Endpoint error: %s" % e)
                        break

                    logger.info(
                        "Found %s PDs for %s Workspace (%s)" %
                        (list_data['count'], workspace.title, workspace.business_area_code))

                    for item in list_data['results']:
                        logger.info("Processing PD: %s" % item['id'])

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

                        # Get partner
                        item, partner = update_create_partner(item)

                        if partner is None:
                            continue

                        # Get PD
                        item, pd = update_create_gd(item, workspace)

                        if pd is None:
                            continue

                        # Get Unicef Focal Points
                        pd = update_create_unicef_focal_points(item['unicef_focal_points'], pd)

                        # Create Agreement Auth Officers
                        pd = update_create_agreement_auth_officers(item['agreement_auth_officers'], pd, workspace, partner)

                        # Create Focal Points
                        pd = update_create_focal_points(item['focal_points'], pd, workspace, partner)

                        # Create sections
                        item, pd = update_create_sections(item, pd, workspace)

                        # Create Reporting Date Periods for QPR and HR report type
                        item = update_create_qpr_n_hr_date_periods(item, pd, workspace)

                        # Create Reporting Date Periods for SR report type
                        item = update_create_sr_date_periods(item, pd, workspace)

                        if item['status'] not in ("draft", "approved",):
                            # Mark all LLO assigned to this GDD as inactive
                            llos = LowerLevelOutput.objects.filter(cp_output__programme_document=pd)
                            llos.update(active=False)

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
