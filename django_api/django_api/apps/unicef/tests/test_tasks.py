from core.tests import factories
from core.tests.base import BaseAPITestCase
from partner.models import Partner
from partner.serializers import PMPPartnerSerializer
from unicef.models import ProgrammeDocument, Section
from unicef.serializers import PMPProgrammeDocumentSerializer, PMPSectionSerializer
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

    def test_programme_document(self):
        country = factories.CountryFactory()
        workspace = factories.WorkspaceFactory(countries=[country, ])
        partner = factories.PartnerFactory()
        data = {
            "id": 101,
            'status': 'Act',
            'agreement': 'BGD/PCA20182',
            'title': 'Executive Director',
            'offices': "Cox's Bazar",
            'number': 'BGD/PCA20182/PD2018101-1',
            'partner': partner.pk,
            'cso_budget': '6403972.00',
            'cso_budget_currency': 'BDT',
            'unicef_budget': '70634975.00',
            'unicef_budget_currency': 'BDT',
            'unicef_budget_cash':
            '60143475.00',
            'unicef_budget_supplies': '10491500.00',
            'workspace': workspace.pk,
            'external_business_area_code': workspace.business_area_code,
            'start_date': '2018-05-07',
            'end_date': '2020-12-31',
            'amendments': [
                {
                    'types': ['budget_gt_20'],
                    'other_description': None,
                    'signed_date': '24-Jul-2019',
                    'amendment_number': '1',
                }
            ]
        }
        filter_dict = {
            'external_id': data['id'],
            'workspace': workspace,
            'external_business_area_code': workspace.business_area_code,
        }
        pd_qs = ProgrammeDocument.objects.filter(**filter_dict)
        self.assertFalse(pd_qs.exists())
        process_model(
            ProgrammeDocument,
            PMPProgrammeDocumentSerializer,
            data=data,
            filter_dict=filter_dict,
        )
        self.assertTrue(pd_qs.exists())

    def test_section(self):
        data = {
            'address': 'SEBRATHA',
            'alternate_name': None,
            'basis_for_risk_rating': '',
            'city': 'SEBRATHA',
            'core_values_assessment_date': '2017-10-30',
            'country': '258',
            'cso_type': 'National',
            'email': 'test@example.com',
            'external_id': 80,
            'id': 80,
            'last_assessment_date': '2020-02-21',
            'name': 'AFAQ FOUNDATION FOR RIGHTS AND DEVELOPMENT',
            'partner_type': 'Civil Society Organization',
            'phone_number': '918528496',
            'postal_code': '',
            'rating': 'Medium',
            'short_name': 'AFAQ FOUND',
            'street_address': None,
            'total_ct_cp': '118250.00',
            'total_ct_cy': '72200.00',
            'type_of_assessment': 'Micro Assessment',
            'unicef_vendor_number': '2500238136',
        }
        filter_dict = {
            'external_id': data['id'],
        }
        section_qs = Section.objects.filter(**filter_dict)
        self.assertFalse(section_qs.exists())
        process_model(
            Section,
            PMPSectionSerializer,
            data=data,
            filter_dict=filter_dict,
        )
        self.assertTrue(section_qs.exists())
