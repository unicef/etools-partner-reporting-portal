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

    def test_item_get_partner(self):

        (_workspace,
         _partner,
         _sections,
         _unicef_officer_list,
         _unicef_focal_point_list,
         _partner_focal_point_list,
         _locations_list,
         _item) = (
            prepare_item())

        partner_qs = Partner.objects.filter(vendor_number=_partner.vendor_number)

        update_create_partner(_item)

        self.assertTrue(partner_qs.exists())

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

    def test_item_get_pd(self):

        (_workspace,
         _partner,
         _sections,
         _unicef_officer_list,
         _unicef_focal_point_list,
         _partner_focal_point_list,
         _locations_list,
         _item) = (
            prepare_item())

        pd_qs = ProgrammeDocument.objects.filter(external_id=_item['id'],
                                                 workspace=_workspace,
                                                 external_business_area_code=_workspace.business_area_code)

        _item, partner = update_create_partner(_item)

        _item, pd = update_create_pd(_item, _workspace)

        self.assertTrue(pd_qs.exists())

    def test_item_get_unicef_focal_points(self):

        (_workspace,
         _partner,
         _sections,
         _unicef_officer_list,
         _unicef_focal_point_list,
         _partner_focal_point_list,
         _locations_list,
         _item) = (
            prepare_item())

        person_qs = Person.objects.filter(email=_unicef_focal_point_list[0].email)
        person_qs_2 = Person.objects.filter(email=_unicef_focal_point_list[1].email)

        _item, partner = update_create_partner(_item)

        _item, pd = update_create_pd(_item, _workspace)

        pd = update_create_unicef_focal_points(_item['unicef_focal_points'], pd)

        self.assertTrue(person_qs.exists())
        self.assertTrue(person_qs_2.exists())

    def test_item_get_agreement_auth_officers(self):
        (_workspace,
         _partner,
         _sections,
         _unicef_officer_list,
         _unicef_focal_point_list,
         _partner_focal_point_list,
         _locations_list,
         _item) = (
            prepare_item())

        person_qs = Person.objects.filter(email=_unicef_officer_list[0].email)

        _item, partner = update_create_partner(_item)

        _item, pd = update_create_pd(_item, _workspace)

        pd = update_create_unicef_focal_points(_item['unicef_focal_points'], pd)

        pd = update_create_agreement_auth_officers(_item['agreement_auth_officers'], pd, _workspace, partner)

        self.assertTrue(person_qs.exists())

    def test_item_get_focal_points(self):
        (_workspace,
         _partner,
         _sections,
         _unicef_officer_list,
         _unicef_focal_point_list,
         _partner_focal_point_list,
         _locations_list,
         _item) = (
            prepare_item())

        person_qs = Person.objects.filter(email=_partner_focal_point_list[0].email)
        person_qs_2 = Person.objects.filter(email=_partner_focal_point_list[1].email)
        person_qs_3 = Person.objects.filter(email=_partner_focal_point_list[2].email)

        _item, partner = update_create_partner(_item)

        _item, pd = update_create_pd(_item, _workspace)

        pd = update_create_unicef_focal_points(_item['unicef_focal_points'], pd)

        pd = update_create_agreement_auth_officers(_item['agreement_auth_officers'], pd, _workspace, partner)

        pd = update_create_focal_points(_item['focal_points'], pd, _workspace, partner)

        self.assertTrue(person_qs.exists())
        self.assertTrue(person_qs_2.exists())
        self.assertTrue(person_qs_3.exists())
