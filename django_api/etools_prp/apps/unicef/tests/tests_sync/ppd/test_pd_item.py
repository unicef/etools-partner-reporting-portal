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
from etools_prp.apps.unicef.ppd_sync.update_create_date_period import (
    update_create_qpr_n_hr_date_periods,
    update_create_sr_date_periods,
)
from etools_prp.apps.unicef.ppd_sync.update_create_expected_result import (
    update_create_expected_result_llos,
    update_create_expected_result_rl,
)
from etools_prp.apps.unicef.ppd_sync.update_create_partner import update_create_partner
from etools_prp.apps.unicef.ppd_sync.update_create_pd import update_create_pd
from etools_prp.apps.unicef.ppd_sync.update_create_person import (
    update_create_agreement_auth_officers,
    update_create_focal_points,
    update_create_unicef_focal_points,
)
from etools_prp.apps.unicef.ppd_sync.update_create_section import update_create_section
from etools_prp.apps.unicef.ppd_sync.update_llos_and_reportables import update_llos_and_reportables
from etools_prp.apps.unicef.tests.tests_sync.ppd.conftest import item_reference


def _for_loop_reporting_period_dates_qpr_n_hr(reporting_requirements, flag_needs_not_to_exist=False):
    for reporting_requirement in reporting_requirements:

        reporting_period_date_qpr_n_hr_qs_index = ReportingPeriodDates.objects.filter(external_id=reporting_requirement['id'])

        if flag_needs_not_to_exist and reporting_period_date_qpr_n_hr_qs_index.exists():
            return True
        elif not flag_needs_not_to_exist and not reporting_period_date_qpr_n_hr_qs_index.exists():
            return False

    if flag_needs_not_to_exist:
        return False
    else:
        return True


def _for_loop_pd_result_links_and_llos(expected_results, flag_needs_not_to_exist=False):
    for expected_result in expected_results:

        # # PD Result Link step testing
        pd_result_link_qs_index = PDResultLink.objects.filter(external_id=expected_result['id'])

        if flag_needs_not_to_exist and pd_result_link_qs_index.exists():
            return True
        elif not flag_needs_not_to_exist and not pd_result_link_qs_index.exists():
            return False

        # # LLO step testing
        llo_qs_index = LowerLevelOutput.objects.filter(external_id=expected_result['id'])

        if flag_needs_not_to_exist and llo_qs_index.exists():
            return True
        elif not flag_needs_not_to_exist and not llo_qs_index.exists():
            return False

    if flag_needs_not_to_exist:
        return False
    else:
        return True


def _for_loop_indicators(expected_results, flag_needs_not_to_exist=False):
    for expected_result in expected_results:
        for indicator in expected_result['indicators']:

            # # # Indicator Blueprint step testing
            indicator_blueprint_qs_index = IndicatorBlueprint.objects.filter(title=indicator['title'])

            if flag_needs_not_to_exist and indicator_blueprint_qs_index.exists():
                return True
            elif not flag_needs_not_to_exist and not indicator_blueprint_qs_index.exists():
                return False

            # # # Locations step testing
            for location in indicator["locations"]:
                location_qs_index = Location.objects.filter(name=location['name'], p_code=location['p_code'])

                if flag_needs_not_to_exist and location_qs_index.exists():
                    return True
                elif not flag_needs_not_to_exist and not location_qs_index.exists():
                    return False

            for disaggregation in indicator["disaggregation"]:

                # # # Disaggregations step testing
                disaggregation_qs_index = Disaggregation.objects.filter(name=disaggregation['name'])

                if flag_needs_not_to_exist and disaggregation_qs_index.exists():
                    return True
                elif not flag_needs_not_to_exist and not disaggregation_qs_index.exists():
                    return False

                for disaggregation_value in disaggregation["disaggregation_values"]:
                    # # # Disaggregation Values step testing
                    disaggregation_value_qs_index = DisaggregationValue.objects.filter(
                        value=disaggregation_value['value'])

                    if flag_needs_not_to_exist and disaggregation_value_qs_index.exists():
                        return True
                    elif not flag_needs_not_to_exist and not disaggregation_value_qs_index.exists():
                        return False

            # # # Reportable step testing
            reportable_qs_index = Reportable.objects.filter(external_id=indicator['id'])

            if flag_needs_not_to_exist and reportable_qs_index.exists():
                return True
            elif not flag_needs_not_to_exist and not reportable_qs_index.exists():
                return False

            # # # Reportable Location Goal step testing
            for location in indicator["locations"]:
                reportable_location_goal_qs_index = ReportableLocationGoal.objects.filter(
                    location__name=location['name'],
                    reportable=reportable_qs_index[0])

                if flag_needs_not_to_exist and reportable_location_goal_qs_index.exists():
                    return True
                elif not flag_needs_not_to_exist and not reportable_location_goal_qs_index.exists():
                    return False

    if flag_needs_not_to_exist:
        return False
    else:
        return True


class TestPDItem(BaseAPITestCase):

    def test_pd_item(self):

        (_workspace,
         _item) = (
            item_reference())

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

        pd = update_create_focal_points(_item['focal_points'], pd, _workspace, partner)

        self.assertTrue(person_fp_qs.exists())

        # Create sections
        section_qs = Section.objects.filter(external_id=_item['sections'][0]['id'])

        self.assertFalse(section_qs.exists())

        item, pd = update_create_section(_item, pd, _workspace)

        self.assertTrue(section_qs.exists())

        # Create Reporting Date Periods for QPR and HR report type section
        self.assertFalse(_for_loop_reporting_period_dates_qpr_n_hr(_item['reporting_requirements'], True))

        item = update_create_qpr_n_hr_date_periods(item, pd, _workspace)

        self.assertTrue(_for_loop_reporting_period_dates_qpr_n_hr(_item['reporting_requirements']))

        # Create Reporting Date Periods for SR report type section
        reporting_period_date_sr_qs = ReportingPeriodDates.objects.filter(external_id=_item['special_reports'][0]['id'])

        self.assertFalse(reporting_period_date_sr_qs.exists())

        item = update_create_sr_date_periods(item, pd, _workspace)

        self.assertTrue(reporting_period_date_sr_qs.exists())

        # Expected results loop section
        if item['status'] not in ("draft", "signed",):

            self.assertFalse(_for_loop_pd_result_links_and_llos(_item['reporting_requirements'], True))

            # Update LLOs and Reportable entities
            update_llos_and_reportables(pd)

            for d in item['expected_results']:

                # Create PDResultLink
                pdresultlink = update_create_expected_result_rl(d, _workspace, pd)

                # Create LLO
                d, llo = update_create_expected_result_llos(d, _workspace, pd, pdresultlink)

            self.assertFalse(_for_loop_pd_result_links_and_llos(_item['reporting_requirements']))
