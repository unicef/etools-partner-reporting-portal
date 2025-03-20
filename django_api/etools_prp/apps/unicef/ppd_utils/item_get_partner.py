import logging

from rest_framework.exceptions import ValidationError

from etools_prp.apps.partner.models import Partner
from etools_prp.apps.partner.serializers import PMPPartnerSerializer

logger = logging.getLogger(__name__)


def process_programme_item_get_partner(partner_org):
    from etools_prp.apps.unicef.tasks import process_model

    # Get partner data
    partner_data = partner_org

    # Skip entries without unicef_vendor_number
    if not partner_data['unicef_vendor_number']:
        logger.warning("No unicef_vendor_number - skipping!")
        return False

    # Create/Assign Partner
    if not partner_data['name']:
        logger.warning("No partner name - skipping!")
        return False

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
        logger.exception('Error trying to save Partner model with {}'.format(partner_data))
        return False