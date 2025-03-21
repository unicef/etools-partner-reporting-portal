from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.partner.models import Partner
from etools_prp.apps.unicef.ppd_sync.update_create_partner import update_create_partner


class TestItemCreateUpdatePartner(BaseAPITestCase):
    def test_get_partner(self):
        filter_dict = {'vendor_number': '777999777'}
        partner_qs = Partner.objects.filter(**filter_dict)
        data = {
            'address': 'test-get-partner-process-stage-address',
            'alternate_name': None,
            'basis_for_risk_rating': '',
            'city': 'HARARE',
            'core_values_assessment_date': '2024-03-28',
            'country': '626',
            'cso_type': 'International',
            'email': 'test-get-partner@example.com',
            'external_id': 777999,
            'id': 777999,
            'last_assessment_date': '2025-03-28',
            'name': 'test-get-partner-process-stage-name',
            'partner_type': 'Civil Society Organization',
            'phone_number': '263 773637079',
            'postal_code': '',
            'rating': 'High',
            'short_name': 'CAFOD',
            'street_address': None,
            'total_ct_cp': '111222.00',
            'total_ct_cy': '111222.00',
            'type_of_assessment': 'High Risk Assumed',
            'unicef_vendor_number': '777999777',
        }

        update_create_partner(data)

        self.assertTrue(partner_qs.exists())

    def test_returns_none_when_partner_name_and_vendor_number_is_none(self):
        data = {
            'address': 'test-get-partner-process-stage-address',
            'alternate_name': None,
            'basis_for_risk_rating': '',
            'city': 'HARARE',
            'core_values_assessment_date': '2024-03-28',
            'country': '626',
            'cso_type': 'International',
            'email': 'test-get-partner@example.com',
            'external_id': 777999,
            'id': 777999,
            'last_assessment_date': '2025-03-28',
            'name': None,
            'partner_type': 'Civil Society Organization',
            'phone_number': '263 773637079',
            'postal_code': '',
            'rating': 'High',
            'short_name': 'CAFOD',
            'street_address': None,
            'total_ct_cp': '111222.00',
            'total_ct_cy': '111222.00',
            'type_of_assessment': 'High Risk Assumed',
            'unicef_vendor_number': None,
        }

        self.assertIsNone(update_create_partner(data))
