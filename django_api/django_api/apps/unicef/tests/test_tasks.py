from core.tests.base import BaseAPITestCase

from partner.models import Partner
from partner.serializers import PMPPartnerSerializer
from unicef.tasks import process_model


class TestProcessModel(BaseAPITestCase):
    def test_partner(self):
        filter_dict = {'vendor_number': '2500241256'}
        partner_qs = Partner.objects.filter(**filter_dict)
        data = {
            'address': 'BROADLANDS ROAD',
            'alternate_name': None,
            'basis_for_risk_rating': '',
            'city': 'HARARE',
            'core_values_assessment_date': '2017-08-08',
            'country': '626',
            'cso_type': 'International',
            'email': 'someone@example.com',
            'external_id': 379,
            'id': 379,
            'last_assessment_date': '2019-12-16',
            'name': 'CAFOD',
            'partner_type': 'Civil Society Organization',
            'phone_number': '263 773637079',
            'postal_code': '',
            'rating': 'High',
            'short_name': 'CAFOD',
            'street_address': None,
            'total_ct_cp': '108855.00',
            'total_ct_cy': '108855.00',
            'type_of_assessment': 'High Risk Assumed',
            'unicef_vendor_number': '2500241256',
        }
        self.assertFalse(partner_qs.exists())
        process_model(
            Partner,
            PMPPartnerSerializer,
            data=data,
            filter_dict=filter_dict,
        )
        self.assertTrue(partner_qs.exists())
