from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.partner.models import Partner
from etools_prp.apps.unicef.models import Person, ProgrammeDocument, ReportingPeriodDates, Section
from etools_prp.apps.unicef.pgd_sync.update_create_date_period import (
    update_create_qpr_n_hr_date_periods,
    update_create_sr_date_periods,
)
from etools_prp.apps.unicef.pgd_sync.update_create_gd import update_create_gd
from etools_prp.apps.unicef.pgd_sync.update_create_partner import update_create_partner
from etools_prp.apps.unicef.pgd_sync.update_create_person import (
    update_create_agreement_auth_officers,
    update_create_focal_points,
    update_create_unicef_focal_points,
)
from etools_prp.apps.unicef.pgd_sync.update_create_section import update_create_sections
from etools_prp.apps.unicef.tests.tests_sync.pgd.conftest import item_reference


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


class TestGDItem(BaseAPITestCase):

    def test_gd_item(self):

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

        _item, pd = update_create_gd(_item, _workspace)

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
