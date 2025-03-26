from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.partner.models import Partner
from etools_prp.apps.unicef.models import Person, ProgrammeDocument
from etools_prp.apps.unicef.ppd_sync.update_create_agreement_auth_officers import update_create_agreement_auth_officers
from etools_prp.apps.unicef.ppd_sync.update_create_focal_points import update_create_focal_points
from etools_prp.apps.unicef.ppd_sync.update_create_partner import update_create_partner
from etools_prp.apps.unicef.ppd_sync.update_create_pd import update_create_pd
from etools_prp.apps.unicef.ppd_sync.update_create_unicef_focal_points import update_create_unicef_focal_points
from etools_prp.apps.unicef.tests.tests_sync.ppd.conftest import prepare_item


class TestPDItemProcessing(BaseAPITestCase):

    def test_main(self):

        # Data preparation (As real as can be simulated)
        (_workspace,
         _partner,
         _sections,
         _unicef_officer_list,
         _unicef_focal_point_list,
         _partner_focal_point_list,
         _locations_list,
         _item) = (
            prepare_item())

        # Partner section testing
        partner_qs = Partner.objects.filter(vendor_number=_partner.vendor_number)

        _item, partner = update_create_partner(_item)

        self.assertTrue(partner_qs.exists())

        # Programme Document section testing
        pd_qs = ProgrammeDocument.objects.filter(external_id=_item['id'],
                                                 workspace=_workspace,
                                                 external_business_area_code=_workspace.business_area_code)

        _item, pd = update_create_pd(_item, _workspace)

        self.assertTrue(pd_qs.exists())

        # Unicef Focal Points section testing
        person_ufc_qs = Person.objects.filter(email=_unicef_focal_point_list[0].email)
        person_ufc_qs_2 = Person.objects.filter(email=_unicef_focal_point_list[1].email)

        pd = update_create_unicef_focal_points(_item['unicef_focal_points'], pd)

        self.assertTrue(person_ufc_qs.exists())
        self.assertTrue(person_ufc_qs_2.exists())

        # Agreement Auth Officers section testing
        person_aao_qs = Person.objects.filter(email=_unicef_officer_list[0].email)

        pd = update_create_agreement_auth_officers(_item['agreement_auth_officers'], pd, _workspace, partner)

        self.assertTrue(person_aao_qs.exists())

        # Focal Points section testing
        person_fp_qs = Person.objects.filter(email=_partner_focal_point_list[0].email)
        person_fp_qs_2 = Person.objects.filter(email=_partner_focal_point_list[1].email)
        person_fp_qs_3 = Person.objects.filter(email=_partner_focal_point_list[2].email)

        pd = update_create_focal_points(_item['focal_points'], pd, _workspace, partner)

        self.assertTrue(person_fp_qs.exists())
        self.assertTrue(person_fp_qs_2.exists())
        self.assertTrue(person_fp_qs_3.exists())

    def test_item_get_partner_returns_none_when_partner_org_incomplete(self):

        (_workspace,
         _partner,
         _sections,
         _unicef_officer_list,
         _unicef_focal_point_list,
         _partner_focal_point_list,
         _locations_list,
         _item) = (
            prepare_item())

        # Error inducing action
        _item['partner_org']['unicef_vendor_number'] = ""
        _item['partner_org']['name'] = ""

        _item, partner = update_create_partner(_item)

        self.assertIsNone(partner)
