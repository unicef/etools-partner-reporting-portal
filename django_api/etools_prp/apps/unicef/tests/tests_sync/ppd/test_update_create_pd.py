from etools_prp.apps.core.tests import factories
from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.unicef.models import ProgrammeDocument
from etools_prp.apps.unicef.ppd_sync.update_create_pd import update_create_pd


class TestItemUpdateCreatePD(BaseAPITestCase):
    def test_get_pd(self):
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
                    'signed_date': '2020-12-31',
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

        update_create_pd(data, workspace)

        self.assertTrue(pd_qs.exists())
