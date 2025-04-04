from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.partner.models import Partner
from etools_prp.apps.unicef.models import Person, ProgrammeDocument, ReportingPeriodDates, Section
from etools_prp.apps.unicef.ppd_sync.update_create_date_period import (
    update_create_qpr_n_hr_date_periods,
    update_create_sr_date_periods,
)
from etools_prp.apps.unicef.ppd_sync.update_create_partner import update_create_partner
from etools_prp.apps.unicef.ppd_sync.update_create_pd import update_create_pd
from etools_prp.apps.unicef.ppd_sync.update_create_person import (
    update_create_agreement_auth_officers,
    update_create_focal_points,
    update_create_unicef_focal_points,
)
from etools_prp.apps.unicef.ppd_sync.update_create_section import update_create_section
from etools_prp.apps.unicef.tests.tests_sync.ppd.conftest import item_reference


def _for_loop_reporting_period_dates_qpr_n_hr(reporting_requirements, flag_needs_not_to_exist=False):
    for reporting_requirement in reporting_requirements:

        reporting_period_date_qpr_n_hr_qs_index = ReportingPeriodDates.objects.filter(external_id=reporting_requirement['id'])

        if flag_needs_not_to_exist:
            if reporting_period_date_qpr_n_hr_qs_index.exists():
                return True
        else:
            if not reporting_period_date_qpr_n_hr_qs_index.exists():
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

        # Create Reporting Date Periods for QPR and HR report type
        self.assertFalse(_for_loop_reporting_period_dates_qpr_n_hr(_item['reporting_requirements'], True))

        item = update_create_qpr_n_hr_date_periods(item, pd, _workspace)

        self.assertTrue(_for_loop_reporting_period_dates_qpr_n_hr(_item['reporting_requirements'], False))

        # Create Reporting Date Periods for SR report type
        reporting_period_date_sr_qs = ReportingPeriodDates.objects.filter(external_id=_item['special_reports'][0]['id'])

        self.assertFalse(reporting_period_date_sr_qs.exists())

        item = update_create_sr_date_periods(item, pd, _workspace)

        self.assertTrue(reporting_period_date_sr_qs.exists())
