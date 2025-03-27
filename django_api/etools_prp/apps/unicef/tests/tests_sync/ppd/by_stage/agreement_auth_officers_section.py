from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.unicef.models import Person
from etools_prp.apps.unicef.ppd_sync.person_related.update_create_agreement_auth_officers import (
    update_create_agreement_auth_officers,
)
from etools_prp.apps.unicef.ppd_sync.person_related.update_create_unicef_focal_points import (
    update_create_unicef_focal_points,
)
from etools_prp.apps.unicef.ppd_sync.update_create_partner import update_create_partner
from etools_prp.apps.unicef.ppd_sync.update_create_pd import update_create_pd
from etools_prp.apps.unicef.tests.tests_sync.ppd.conftest import item_reference


class TestCreateUpdateAgreementAuthOfficers(BaseAPITestCase):

    def test_create_update_agreement_auth_officers(self):

        (_workspace,
         _item) = (
            item_reference())

        _item, partner = update_create_partner(_item)

        _item, pd = update_create_pd(_item, _workspace)

        pd = update_create_unicef_focal_points(_item['unicef_focal_points'], pd)

        person_aao_qs = Person.objects.filter(email=_item['agreement_auth_officers'][0]['email'])

        pd = update_create_agreement_auth_officers(_item['agreement_auth_officers'], pd, _workspace, partner)

        self.assertTrue(person_aao_qs.exists())
