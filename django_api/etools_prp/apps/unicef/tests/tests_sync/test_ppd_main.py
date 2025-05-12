from unittest.mock import MagicMock, patch

from etools_prp.apps.core.models import Location
from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.indicator.models import (
    Disaggregation,
    DisaggregationValue,
    IndicatorBlueprint,
    Reportable,
    ReportableLocationGoal,
)
from etools_prp.apps.partner.models import Partner
from etools_prp.apps.unicef.models import (
    LowerLevelOutput,
    PDResultLink,
    Person,
    ProgrammeDocument,
    ReportingPeriodDates,
    Section,
)
from etools_prp.apps.unicef.tasks import process_programme_documents
from etools_prp.apps.unicef.tests.tests_sync.conftest import item_pd_reference


def _for_loop_reporting_period_dates_qpr_n_hr(reporting_requirements):
    for reporting_requirement in reporting_requirements:

        reporting_period_date_qpr_n_hr_qs_index = ReportingPeriodDates.objects.filter(external_id=reporting_requirement['id'])
        if not reporting_period_date_qpr_n_hr_qs_index.exists():
            return False

    return True


def _for_loop_pd_result_links_and_llos(expected_results):
    for expected_result in expected_results:

        # # PD Result Link step testing
        pd_result_link_qs_index = PDResultLink.objects.filter(external_id=expected_result['result_link'])
        if not pd_result_link_qs_index.exists():
            return False

        # # LLO step testing
        llo_qs_index = LowerLevelOutput.objects.filter(external_id=expected_result['id'], active=True)
        if not llo_qs_index.exists():
            return False

    return True


def _for_loop_indicators(expected_results):
    for expected_result in expected_results:
        for indicator in expected_result['indicators']:

            # # # Indicator Blueprint step testing
            indicator_blueprint_qs_index = IndicatorBlueprint.objects.filter(title=indicator['title'])
            if not indicator_blueprint_qs_index.exists():
                return False

            # # # Locations step testing
            for location in indicator["locations"]:
                location_qs_index = Location.objects.filter(name=location['name'], p_code=location['p_code'])
                if not location_qs_index.exists():
                    return False

            for disaggregation in indicator["disaggregation"]:

                # # # Disaggregations step testing
                disaggregation_qs_index = Disaggregation.objects.filter(name=disaggregation['name'])
                if not disaggregation_qs_index.exists():
                    return False

                for disaggregation_value in disaggregation["disaggregation_values"]:
                    # # # Disaggregation Values step testing
                    disaggregation_value_qs_index = DisaggregationValue.objects.filter(
                        value=disaggregation_value['value'])
                    if not disaggregation_value_qs_index.exists():
                        return False

            # # # Reportable step testing
            reportable_qs_index = Reportable.objects.filter(external_id=indicator['id'])
            if not reportable_qs_index.exists():
                return False

            # # # Reportable Location Goal step testing
            for location in indicator["locations"]:
                reportable_location_goal_qs_index = ReportableLocationGoal.objects.filter(
                    location__name=location['name'],
                    reportable=reportable_qs_index[0],
                    is_active=True)
                if not reportable_location_goal_qs_index.exists():
                    return False

    return True


class TestProcessProgrammeDocuments(BaseAPITestCase):

    # Test for non-cluster-indicator-containing object
    @patch('etools_prp.apps.unicef.tasks.PMP_API')
    def test_process_programme_documents(self, simulation_pmp_api_programme_documents):

        (_workspace,
         _item) = (
            item_pd_reference())

        # PMP API query result equivalent for testing purposes
        simulation_pmp_api = MagicMock()
        simulation_pmp_api.programme_documents.return_value = {'count': 1, 'next': None, 'results': _item}
        simulation_pmp_api_programme_documents.return_value = simulation_pmp_api

        # Main process execution
        process_programme_documents()

        # Partner section testing
        partner_qs = Partner.objects.filter(vendor_number=_item["partner_org"]['unicef_vendor_number'])
        self.assertTrue(partner_qs.exists())

        # Programme Document section testing
        pd_qs = ProgrammeDocument.objects.filter(external_id=_item['id'],
                                                 workspace=_workspace,
                                                 external_business_area_code=_workspace.business_area_code)
        self.assertTrue(pd_qs.exists())

        # Unicef Focal Points section testing
        person_ufc_qs = Person.objects.filter(email=_item['unicef_focal_points'][0]['email'])
        self.assertTrue(person_ufc_qs.exists())

        # Agreement Auth Officers section testing
        person_aao_qs = Person.objects.filter(email=_item['agreement_auth_officers'][0]['email'])
        self.assertTrue(person_aao_qs.exists())

        # Focal Points section testing
        person_fp_qs = Person.objects.filter(email=_item['focal_points'][0]['email'])
        self.assertTrue(person_fp_qs.exists())

        # 'Section' section testing
        section_qs = Section.objects.filter(external_id=_item['sections'][0]['id'])
        self.assertTrue(section_qs.exists())

        # Reporting period dates QPR and HR section testing
        self.assertTrue(_for_loop_reporting_period_dates_qpr_n_hr(_item['reporting_requirements']))

        # Reporting period dates SR section testing
        reporting_period_date_sr_qs = ReportingPeriodDates.objects.filter(external_id=_item['special_reports'][0]['id'])
        self.assertTrue(reporting_period_date_sr_qs.exists())

        # # Expected results loop testing
        self.assertTrue(_for_loop_pd_result_links_and_llos(_item['expected_results']))

        # # # Indicators loop testing
        self.assertTrue(_for_loop_indicators(_item['expected_results']))
