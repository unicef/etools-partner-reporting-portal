from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.unicef.models import ProgrammeDocument
from etools_prp.apps.unicef.ppd_sync.update_create_partner import update_create_partner
from etools_prp.apps.unicef.ppd_sync.update_create_pd import update_create_pd
from etools_prp.apps.unicef.tests.tests_sync.ppd.conftest import item_reference


class TestCreateUpdatePD(BaseAPITestCase):

    def test_create_update_pd(self):

        (_workspace,
         _item) = (
            item_reference())

        _item, partner = update_create_partner(_item)

        pd_qs = ProgrammeDocument.objects.filter(external_id=_item['id'],
                                                 workspace=_workspace,
                                                 external_business_area_code=_workspace.business_area_code)

        _item, pd = update_create_pd(_item, _workspace)

        self.assertTrue(pd_qs.exists())
