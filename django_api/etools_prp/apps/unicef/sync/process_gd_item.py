import logging

from etools_prp.apps.core.models import Workspace
from etools_prp.apps.unicef.sync.update_create_date_period import (
    update_create_qpr_n_hr_date_periods,
    update_create_sr_date_periods,
)
from etools_prp.apps.unicef.sync.update_create_expected_result import (
    update_create_expected_result_llo,
    update_create_expected_result_rl,
)
from etools_prp.apps.unicef.sync.update_create_partner import update_create_partner
from etools_prp.apps.unicef.sync.update_create_pd import update_create_pd
from etools_prp.apps.unicef.sync.update_create_person import (
    update_create_agreement_auth_officers,
    update_create_focal_points,
    update_create_unicef_focal_points,
)
from etools_prp.apps.unicef.sync.update_create_section import update_create_sections
from etools_prp.apps.unicef.sync.update_llos_and_reportables import update_llos_and_reportables

logger = logging.getLogger(__name__)


def process_gd_item(item: dict, workspace: Workspace) -> bool:
    # here is the start of the transaction

    logger.info("Processing GPD: %s" % item['id'])

    # Assign workspace
    item['workspace'] = workspace.id

    # Modify offices entry
    item['offices'] = ", ".join(
        item['offices']) if item['offices'] else "N/A"

    if not item['start_date']:
        logger.warning("Start date is required - skipping!")
        return False

    if not item['end_date']:
        logger.warning("End date is required - skipping!")
        return False

    # Get partner
    item, partner = update_create_partner(item)

    if partner is None:
        return False

    # Get PD
    item, pd = update_create_pd(item, workspace)

    if pd is None:
        return False

    # Get Unicef Focal Points
    if "unicef_focal_points" in item:
        pd = update_create_unicef_focal_points(item['unicef_focal_points'], pd)

    # Create Agreement Auth Officers
    if 'agreement_auth_officers' in item:
        pd = update_create_agreement_auth_officers(item['agreement_auth_officers'], pd, workspace, partner)

    # Create Focal Points
    if "focal_points" in item:
        pd = update_create_focal_points(item['focal_points'], pd, workspace, partner)

    # Create sections
    item, pd = update_create_sections(item, pd, workspace)

    # Create Reporting Date Periods for QPR and HR report type
    item = update_create_qpr_n_hr_date_periods(item, pd, workspace)

    # Create Reporting Date Periods for SR report type
    item = update_create_sr_date_periods(item, pd, workspace)

    if item['status'] not in ("draft", "signed",):

        # Update LLOs and Reportable entities
        update_llos_and_reportables(pd)

        # Parsing expecting results and set them active, rest will stay inactive for this PD
        for d in item['expected_results']:

            # Create PDResultLink
            pdresultlink = update_create_expected_result_rl(d, workspace, pd)

            # Create LLO
            update_create_expected_result_llo(d, workspace, pd, pdresultlink)

    return True
