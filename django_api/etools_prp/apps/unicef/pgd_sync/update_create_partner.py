import logging
from typing import Any, Optional

from rest_framework.exceptions import ValidationError

from etools_prp.apps.partner.models import Partner
from etools_prp.apps.partner.serializers import PMPPartnerSerializer
from etools_prp.apps.unicef.ppd_sync.utils import process_model

logger = logging.getLogger(__name__)


def update_create_partner(item: Any) -> (Optional[Any], Optional[Partner]):

    # Skip entries without unicef_vendor_number
    if not item['partner_org']['unicef_vendor_number']:
        logger.warning("No unicef_vendor_number - skipping!")
        return item, None

    # Create/Assign Partner
    if not item['partner_org']['name']:
        logger.warning("No partner name - skipping!")
        return item, None

    item['partner_org']['external_id'] = item['partner_org'].get('id', '#')

    try:
        partner = process_model(
            Partner,
            PMPPartnerSerializer,
            item['partner_org'], {
                'vendor_number': item['partner_org']['unicef_vendor_number']
            }
        )

        item['partner'] = partner.id

        return item, partner
    except ValidationError:
        logger.exception('Error trying to save Partner model with {}'
                         .format(item['partner_org']))
        return item, None
