from rest_framework.exceptions import ValidationError

from etools_prp.apps.core.models import Location
from etools_prp.apps.core.serializers import PMPLocationSerializer
from etools_prp.apps.core.tests import factories
from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.indicator.models import IndicatorBlueprint, Reportable
from etools_prp.apps.indicator.serializers import PMPIndicatorBlueprintSerializer, PMPReportableSerializer
from etools_prp.apps.partner.models import Partner
from etools_prp.apps.partner.serializers import PMPPartnerSerializer
from etools_prp.apps.unicef.models import Person, ProgrammeDocument, Section
from etools_prp.apps.unicef.serializers import (
    PMPPDPersonSerializer,
    PMPProgrammeDocumentSerializer,
    PMPSectionSerializer,
)
from etools_prp.apps.unicef.tasks import process_model
from etools_prp.apps.unicef.ppd_utils.item_get_partner import process_programme_item_get_partner


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

    def test_person_and_user(self):
        email = "wrongone@example.com"
        filter_dict = {'email': email}
        person_qs = Person.objects.filter(**filter_dict)
        data = {
            "name": "New",
            "email": email,
        }
        self.assertFalse(person_qs.exists())
        process_model(
            Person,
            PMPPDPersonSerializer,
            data=data,
            filter_dict=filter_dict,
        )
        self.assertTrue(person_qs.exists())

    def test_person_and_user_invalid_email(self):
        email = "WrongOne@example.com"
        filter_dict = {'email': email}
        person_qs = Person.objects.filter(**filter_dict)
        data = {
            "name": "New",
            "email": email,
        }
        self.assertFalse(person_qs.exists())
        self.assertRaises(
            ValidationError,
            process_model,
            Person,
            PMPPDPersonSerializer,
            data=data,
            filter_dict=filter_dict,
        )
        self.assertFalse(person_qs.exists())

    def test_programme_document(self):
        workspace = factories.WorkspaceFactory()
        partner = factories.PartnerFactory()
        data = {
            "id": 101,
            'status': 'active',
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
                },
                {
                    'types': ['budget_gt_20'],
                    'other_description': None,
                    'signed_date': None,
                    'amendment_number': '2',
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
        workspace = factories.WorkspaceFactory()
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
            'external_business_area_code': workspace.business_area_code,
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
            'external_business_area_code': workspace.business_area_code,
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

    def test_blueprint(self):
        pd = factories.ProgrammeDocumentFactory()
        data = {
            'id': 34,
            'blueprint_id': 34,
            'title': '# of children reached',
        }
        filter_dict = {
            'external_id': data['blueprint_id'],
            'reportables__lower_level_outputs__cp_output__programme_document': pd.pk
        }
        blueprint_qs = IndicatorBlueprint.objects.filter(**filter_dict)
        self.assertFalse(blueprint_qs.exists())
        process_model(
            IndicatorBlueprint,
            PMPIndicatorBlueprintSerializer,
            data=data,
            filter_dict=filter_dict,
        )
        # self.assertTrue(blueprint_qs.exists())

    def test_reportable(self):
        blueprint = factories.QuantityTypeIndicatorBlueprintFactory()
        pd = factories.ProgrammeDocumentFactory()
        data = {
            'id': 34,
            'blueprint_id': blueprint.pk,
            'disaggregation_ids': [],
            'content_type': 47,
            'object_id': 1,
        }
        filter_dict = {
            'external_id': data['blueprint_id'],
            'lower_level_outputs__cp_output__programme_document': pd.pk
        }
        reportable_qs = Reportable.objects.filter(**filter_dict)
        self.assertFalse(reportable_qs.exists())
        process_model(
            Reportable,
            PMPReportableSerializer,
            data=data,
            filter_dict=filter_dict,
        )
        # self.assertTrue(reportable_qs.exists())

    def test_location(self):
        data = {
            'id': 8136,
            'name': 'Abaipur',
            'p_code': '40448010',
            'admin_level_name': 'BGD-Admin Level 4',
            'admin_level': 4,
        }
        filter_dict = {
            'p_code': data['p_code'],
        }
        location_qs = Location.objects.filter(**filter_dict)
        self.assertFalse(location_qs.exists())
        process_model(
            Location,
            PMPLocationSerializer,
            data=data,
            filter_dict=filter_dict,
        )
        self.assertTrue(location_qs.exists())

class TestProgrammeDocumentProcess(BaseAPITestCase):
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
        self.assertFalse(partner_qs.exists())

        process_programme_item_get_partner(data)

        self.assertTrue(partner_qs.exists())

    def test_get_invalid_partner(self):
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

        self.assertFalse(process_programme_item_get_partner(data))