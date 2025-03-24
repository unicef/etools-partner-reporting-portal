import datetime
import logging
from typing import Any, Optional

from etools_prp.apps.core.models import Workspace
from etools_prp.apps.unicef.models import ProgrammeDocument
from etools_prp.apps.unicef.ppd_sync.utils import process_model
from etools_prp.apps.unicef.serializers import PMPProgrammeDocumentSerializer

logger = logging.getLogger(__name__)


def update_create_pd(item: Any, workspace: Workspace) -> (Optional[Any], Optional[ProgrammeDocument]):

    # This was before me
    item['status'] = item['status']

    item['external_business_area_code'] = workspace.business_area_code
    # Amendment date formatting
    for idx in range(len(item['amendments'])):
        if item['amendments'][idx]['signed_date'] is None:
            # no signed date yet, so formatting is not required
            continue

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

        pd.unicef_focal_point.all().update(active=False)
        pd.unicef_officers.all().update(active=False)
        pd.partner_focal_point.all().update(active=False)

        return item, pd
    except KeyError as e:
        logger.exception('Error trying to save ProgrammeDocument model with {}'.format(item), e)
        return item, None
