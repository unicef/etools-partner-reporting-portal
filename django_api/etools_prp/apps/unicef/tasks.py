import logging

from django.contrib.auth import get_user_model
from django.db import transaction

from celery import shared_task

from etools_prp.apps.core.api import PMP_API
from etools_prp.apps.core.models import Workspace
from etools_prp.apps.unicef.sync.process_gd_item import process_gd_item
from etools_prp.apps.unicef.sync.process_pd_item import process_pd_item

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
            try: #last time this work perfectly
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

    for workspace in workspaces:
        # Skip global workspace and Syria Cross Border / MENARO
        if workspace.business_area_code in ("0", "234R"):
            continue

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
                "Found %s GPDs for %s Workspace (%s)" %
                (list_data['count'], workspace.title, workspace.business_area_code))

            for item in list_data['results']:

                with transaction.atomic():
                    try:
                        process_gd_item(item, workspace)
                    except Exception as e:
                        logger.exception(e)

            # Check if another page exists
            if list_data['next']:
                logger.info("Found new page")
                page_url = list_data['next']
            else:
                logger.info("End of workspace")
                break
