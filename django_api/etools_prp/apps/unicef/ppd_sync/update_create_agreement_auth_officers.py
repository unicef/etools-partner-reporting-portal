import logging
from typing import Any

from django.contrib.auth.models import Group

from etools_prp.apps.core.common import PRP_ROLE_TYPES
from etools_prp.apps.core.models import Realm, Workspace
from etools_prp.apps.partner.models import Partner
from etools_prp.apps.unicef.models import ProgrammeDocument
from etools_prp.apps.unicef.ppd_sync.utils import save_person_and_user

logger = logging.getLogger(__name__)


def update_create_agreement_auth_officers(item: Any, pd: ProgrammeDocument, workspace: Workspace, partner: Partner) -> (Any, ProgrammeDocument):

    person_data_list = item['agreement_auth_officers']
    for person_data in person_data_list:
        person, user = save_person_and_user(person_data, create_user=True)
        if not person:
            continue

        person.active = True
        person.save()
        pd.unicef_officers.add(person)

        user.partner = partner
        user.save()

        obj, created = Realm.objects.get_or_create(
            user=user,
            group=Group.objects.get_or_create(name=PRP_ROLE_TYPES.ip_authorized_officer)[0],
            workspace=workspace,
            partner=partner
        )

        if created:
            obj.send_email_notification()

        is_active = person_data.get('active')

        if not created and obj.is_active and is_active is False:
            obj.is_active = is_active
            obj.save()

    return item, pd
