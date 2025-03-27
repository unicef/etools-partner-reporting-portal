from etools_prp.apps.core.tests.base import BaseAPITestCase
from etools_prp.apps.unicef.models import Person
from etools_prp.apps.unicef.ppd_sync.update_create_person import (
    update_create_unicef_focal_points,
)
from etools_prp.apps.unicef.ppd_sync.update_create_partner import update_create_partner
from etools_prp.apps.unicef.ppd_sync.update_create_pd import update_create_pd
from etools_prp.apps.unicef.tests.tests_sync.ppd.conftest import item_reference


class TestCreateUpdateUnicefFocalPoints(BaseAPITestCase):

    def test_create_update_unicef_focal_points(self):

        (_workspace,
         _item) = (
            item_reference())

        _item, partner = update_create_partner(_item)

        _item, pd = update_create_pd(_item, _workspace)

        person_ufc_qs = Person.objects.filter(email=_item['unicef_focal_points'][0]['email'])

        pd = update_create_unicef_focal_points(_item['unicef_focal_points'], pd)

        self.assertTrue(person_ufc_qs.exists())
