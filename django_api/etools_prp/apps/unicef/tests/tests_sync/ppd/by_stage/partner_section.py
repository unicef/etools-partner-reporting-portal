from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.partner.models import Partner
from etools_prp.apps.unicef.ppd_sync.update_create_partner import update_create_partner
from etools_prp.apps.unicef.tests.tests_sync.ppd.conftest import item_reference


class TestCreateUpdatePartner(BaseAPITestCase):

    def test_create_update_partner(self):

        (_workspace,
         _item) = (
            item_reference())

        # Creating static object [filter], before executing
        partner_qs = Partner.objects.filter(vendor_number=_item["partner_org"]['unicef_vendor_number'])

        # Executing search on filter
        self.assertFalse(partner_qs.exists())

        _item, partner = update_create_partner(_item)

        # Executing search on filter, now, as we have that object created
        self.assertTrue(partner_qs.exists())

    def test_create_update_partner_returns_none_when_partner_org_incomplete(self):

        (_workspace,
         _item) = (
            item_reference())

        # Error inducing action
        _item['partner_org']['unicef_vendor_number'] = ""
        _item['partner_org']['name'] = ""

        _item, partner = update_create_partner(_item)

        self.assertIsNone(partner)
