from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.partner.models import Partner
from etools_prp.apps.unicef.models import Person, ProgrammeDocument
from etools_prp.apps.unicef.sync.update_create_partner import update_create_partner
from etools_prp.apps.unicef.sync.update_create_pd import update_create_pd
from etools_prp.apps.unicef.sync.update_create_person import (
    update_create_agreement_auth_officers,
    update_create_partner_focal_points,
    update_create_unicef_focal_points,
)
from etools_prp.apps.unicef.tests.tests_sync.conftest import item_gd_reference


class TestGDItem(BaseAPITestCase):

    def test_gd_item(self):

        (_workspace,
         _item) = (
            item_gd_reference())

        # Partner section testing
        partner_qs = Partner.objects.filter(vendor_number=_item["partner_org"]['unicef_vendor_number'])

        self.assertFalse(partner_qs.exists())

        _item, partner = update_create_partner(_item)

        self.assertTrue(partner_qs.exists())

        # Programme Document section testing
        pd_qs = ProgrammeDocument.objects.filter(external_id=_item['id'],
                                                 workspace=_workspace,
                                                 external_business_area_code=_workspace.business_area_code)

        self.assertFalse(pd_qs.exists())

        _item, pd = update_create_pd(_item, _workspace)

        self.assertTrue(pd_qs.exists())

        # Unicef Focal Points section testing
        person_ufc_qs = Person.objects.filter(email=_item['unicef_focal_points'][0]['email'])

        self.assertFalse(person_ufc_qs.exists())

        pd = update_create_unicef_focal_points(_item['unicef_focal_points'], pd)

        self.assertTrue(person_ufc_qs.exists())

        # Agreement Auth Officers section testing
        person_aao_qs = Person.objects.filter(email=_item['agreement_auth_officers'][0]['email'])

        self.assertFalse(person_aao_qs.exists())

        pd = update_create_agreement_auth_officers(_item['agreement_auth_officers'], pd, _workspace, partner)

        self.assertTrue(person_aao_qs.exists())

        # Focal Points section testing
        person_fp_qs = Person.objects.filter(email=_item['focal_points'][0]['email'])

        self.assertFalse(person_fp_qs.exists())

        pd = update_create_partner_focal_points(_item['focal_points'], pd, _workspace, partner)

        self.assertTrue(person_fp_qs.exists())
