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
from etools_prp.apps.unicef.sync.update_create_blueprint import update_create_blueprint
from etools_prp.apps.unicef.sync.update_create_date_period import (
    update_create_qpr_n_hr_date_periods,
    update_create_sr_date_periods,
)
from etools_prp.apps.unicef.sync.update_create_disaggregation import update_create_disaggregations
from etools_prp.apps.unicef.sync.update_create_expected_result import (
    update_create_expected_result_llo,
    update_create_expected_result_rl,
)
from etools_prp.apps.unicef.sync.update_create_location import update_create_locations
from etools_prp.apps.unicef.sync.update_create_partner import update_create_partner
from etools_prp.apps.unicef.sync.update_create_pd import update_create_pd
from etools_prp.apps.unicef.sync.update_create_person import (
    update_create_agreement_auth_officers,
    update_create_focal_points,
    update_create_unicef_focal_points,
)
from etools_prp.apps.unicef.sync.update_create_reportable import update_create_reportable
from etools_prp.apps.unicef.sync.update_create_reportable_location_goal import update_create_reportable_location_goals
from etools_prp.apps.unicef.sync.update_create_section import update_create_sections
from etools_prp.apps.unicef.sync.update_llos_and_reportables import update_llos_and_reportables
from etools_prp.apps.unicef.tests.tests_sync.ppd.conftest import item_reference


def _for_loop_reporting_period_dates_qpr_n_hr(reporting_requirements, flag_needs_not_to_exist=False):
    """
    Flag here is destined to make sure that we get True or False according to our desire (assertTrue/False)
    1. So if we need items to exist, then we set Flag to False, and if we get non-existing item it returns False immediately
    2. Otherwise, flag set to True will fire True if provided item exists thus making assertTrue failing whole the test
    To make sure what you get in result see latest return statement of the function to see destined values of successful looping
    Generally:
        AssertFalse (not existing items) flag = True
        AssertTrue      (existing items) flag = False
    """
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
    """
    Flag here is destined to make sure that we get True or False according to our desire (assertTrue/False)
    1. So if we need items to exist, then we set Flag to False, and if we get non-existing item it returns False immediately
    2. Otherwise, flag set to True will fire True if provided item exists thus making assertTrue failing whole the test
    To make sure what you get in result see latest return statement of the function to see destined values of successful looping
    Generally:
        AssertFalse (not existing items) flag = True
        AssertTrue      (existing items) flag = False
    """
    for expected_result in expected_results:

        # # PD Result Link step testing
        pd_result_link_qs_index = PDResultLink.objects.filter(external_id=expected_result['result_link'])

        if flag_needs_not_to_exist and pd_result_link_qs_index.exists():
            return True
        elif not flag_needs_not_to_exist and not pd_result_link_qs_index.exists():
            return False

        # # LLO step testing
        llo_qs_index = LowerLevelOutput.objects.filter(external_id=expected_result['id'], active=True)

        if flag_needs_not_to_exist and llo_qs_index.exists():
            return True
        elif not flag_needs_not_to_exist and not llo_qs_index.exists():
            return False

    if flag_needs_not_to_exist:
        return False
    else:
        return True


def _for_loop_indicators(expected_results, flag_needs_not_to_exist=False):
    """
    Flag here is destined to make sure that we get True or False according to our desire (assertTrue/False)
    1. So if we need items to exist, then we set Flag to False, and if we get non-existing item it returns False immediately
    2. Otherwise, flag set to True will fire True if provided item exists thus making assertTrue failing whole the test
    To make sure what you get in result see latest return statement of the function to see destined values of successful looping
    Generally:
        AssertFalse (not existing items) flag = True
        AssertTrue      (existing items) flag = False
    """
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

            if flag_needs_not_to_exist and reportable_qs_index.exists():
                # # # Reportable Location Goal step testing
                for location in indicator["locations"]:
                    reportable_location_goal_qs_index = ReportableLocationGoal.objects.filter(
                        location__name=location['name'],
                        reportable=reportable_qs_index[0],
                        is_active=True)

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

        item, pd = update_create_sections(_item, pd, _workspace)

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

            self.assertFalse(_for_loop_pd_result_links_and_llos(_item['expected_results'], True))

            self.assertFalse(_for_loop_indicators(_item['expected_results'], True))

            # Update LLOs and Reportable entities
            update_llos_and_reportables(pd)

            for d in item['expected_results']:

                # Create PDResultLink
                pdresultlink = update_create_expected_result_rl(d, _workspace, pd)

                # Create LLO
                d, llo = update_create_expected_result_llo(d, _workspace, pd, pdresultlink)

                # Iterate over indicators
                for i in d['indicators']:

                    # Create Blueprint
                    i, blueprint = update_create_blueprint(i, pd)

                    # Create Locations
                    locations, locations_result = update_create_locations(i)

                    if locations_result is None:
                        continue

                    # Create Disaggregations
                    disaggregations = update_create_disaggregations(i, pd)

                    # Create Reportable
                    i, reportable = update_create_reportable(i, blueprint, disaggregations, llo, item, pd)

                    # Create Reportable Location Goals
                    update_create_reportable_location_goals(reportable, locations)

            self.assertTrue(_for_loop_pd_result_links_and_llos(_item['expected_results']))

            self.assertTrue(_for_loop_indicators(_item['expected_results']))
