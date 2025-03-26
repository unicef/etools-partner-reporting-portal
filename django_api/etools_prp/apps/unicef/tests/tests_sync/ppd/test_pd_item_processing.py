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

        filter_dict = {
            'vendor_number': _partner.vendor_number
        }
        partner_qs = Partner.objects.filter(**filter_dict)

        update_create_partner(_item)

        self.assertTrue(partner_qs.exists())

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

        filter_dict = {
            'external_id': _item['id'],
            'workspace': _workspace,
            'external_business_area_code': _workspace.business_area_code,
        }
        pd_qs = ProgrammeDocument.objects.filter(**filter_dict)

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

        filter_dict = {
            "email": _unicef_focal_point_list[0].email
        }
        person_qs = Person.objects.filter(**filter_dict)

        filter_dict_2 = {
            "email": _unicef_focal_point_list[1].email
        }
        person_qs_2 = Person.objects.filter(**filter_dict_2)

        _item, partner = update_create_partner(_item)

        _item, pd = update_create_pd(_item, _workspace)

        pd = update_create_unicef_focal_points(_item, pd)

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

        filter_dict = {
            "email": _unicef_officer_list[0].email
        }
        person_qs = Person.objects.filter(**filter_dict)

        _item, partner = update_create_partner(_item)

        _item, pd = update_create_pd(_item, _workspace)

        pd = update_create_unicef_focal_points(_item, pd)

        _item, pd = update_create_agreement_auth_officers(_item, pd, _workspace, partner)

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

        filter_dict = {
            "email": _partner_focal_point_list[0].email
        }
        person_qs = Person.objects.filter(**filter_dict)

        filter_dict_2 = {
            "email": _partner_focal_point_list[1].email
        }
        person_qs_2 = Person.objects.filter(**filter_dict_2)

        filter_dict_3 = {
            "email": _partner_focal_point_list[2].email
        }
        person_qs_3 = Person.objects.filter(**filter_dict_3)

        _item, partner = update_create_partner(_item)

        _item, pd = update_create_pd(_item, _workspace)

        pd = update_create_unicef_focal_points(_item, pd)

        _item, pd = update_create_agreement_auth_officers(_item, pd, _workspace, partner)

        _item, pd = update_create_focal_points(_item, pd, _workspace, partner)

        self.assertTrue(person_qs.exists())
        self.assertTrue(person_qs_2.exists())
        self.assertTrue(person_qs_3.exists())
