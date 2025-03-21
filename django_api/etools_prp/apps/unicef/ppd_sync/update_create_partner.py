import logging
from typing import Optional

from rest_framework.exceptions import ValidationError

from etools_prp.apps.partner.models import Partner
from etools_prp.apps.partner.serializers import PMPPartnerSerializer
from etools_prp.apps.unicef.utils import process_model

logger = logging.getLogger(__name__)


def update_create_partner(partner_data: dict) -> Optional[Partner]:

    # Skip entries without unicef_vendor_number
    if not partner_data['unicef_vendor_number']:
        logger.warning("No unicef_vendor_number for PD - skipping!")
        return None

    # Create/Assign Partner
    if not partner_data['name']:
        logger.warning("No partner name for PD - skipping!")
        return None

    partner_data['external_id'] = partner_data.get('id', '#')

    try:
        partner = process_model(
            Partner,
            PMPPartnerSerializer,
            partner_data, {
                'vendor_number': partner_data['unicef_vendor_number']
            }
        )

        return partner
    except ValidationError:
        logger.exception('Error trying to save Partner model with {}'
                         .format(partner_data))
        return None
