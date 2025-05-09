from unittest.mock import MagicMock, patch

from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.partner.models import Partner
from etools_prp.apps.unicef.models import Person, ProgrammeDocument, ReportingPeriodDates, Section
from etools_prp.apps.unicef.tasks import process_government_documents
from etools_prp.apps.unicef.tests.tests_sync.pgd.conftest import item_reference


def _for_loop_reporting_period_dates_qpr_n_hr(reporting_requirements):
    for reporting_requirement in reporting_requirements:

        reporting_period_date_qpr_n_hr_qs_index = ReportingPeriodDates.objects.filter(external_id=reporting_requirement['id'])
        if not reporting_period_date_qpr_n_hr_qs_index.exists():
            return False

    return True


class TestProcessGovernmentDocuments(BaseAPITestCase):

    @patch('etools_prp.apps.unicef.tasks.PMP_API')
    def test_process_government_documents(self, simulation_pmp_api_government_documents):

        (_workspace,
         _item) = (
            item_reference())

        # PMP API query result equivalent for testing purposes
        simulation_pmp_api = MagicMock()
        simulation_pmp_api.government_documents.return_value = {'count': 1, 'next': None, 'results': [_item]}
        simulation_pmp_api_government_documents.return_value = simulation_pmp_api

        # Main process execution
        process_government_documents()

        # Partner section testing
        partner_qs = Partner.objects.filter(vendor_number=_item["partner_org"]['unicef_vendor_number'])
        self.assertTrue(partner_qs.exists())

        # Programme Document section testing
        pd_qs = ProgrammeDocument.objects.filter(external_id=_item['id'],
                                                 workspace=_workspace,
                                                 external_business_area_code=_workspace.business_area_code)
        self.assertTrue(pd_qs.exists())

        # Unicef Focal Points section testing
        person_ufc_qs = Person.objects.filter(email=_item['unicef_focal_points'][0]['email'], active=False)
        self.assertTrue(person_ufc_qs.exists())

        # Agreement Auth Officers section testing
        person_aao_qs = Person.objects.filter(email=_item['agreement_auth_officers'][0]['email'], active=False)
        self.assertTrue(person_aao_qs.exists())

        # Focal Points section testing
        person_fp_qs = Person.objects.filter(email=_item['focal_points'][0]['email'], active=False)
        self.assertTrue(person_fp_qs.exists())

        # 'Section' section testing
        section_qs = Section.objects.filter(external_id=_item['sections'][0]['id'])
        self.assertTrue(section_qs.exists())

        # Reporting period dates QPR and HR section testing
        self.assertTrue(_for_loop_reporting_period_dates_qpr_n_hr(_item['reporting_requirements']))

        # Reporting period dates SR section testing
        reporting_period_date_sr_qs = ReportingPeriodDates.objects.filter(external_id=_item['special_reports'][0]['id'])
        self.assertTrue(reporting_period_date_sr_qs.exists())
