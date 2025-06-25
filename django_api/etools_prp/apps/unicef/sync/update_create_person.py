from django.contrib.auth.models import Group

from etools_prp.apps.core.common import PRP_ROLE_TYPES
from etools_prp.apps.core.models import Realm, Workspace
from etools_prp.apps.partner.models import Partner
from etools_prp.apps.unicef.models import ProgrammeDocument
from etools_prp.apps.unicef.sync.utils import save_person_and_user


def update_create_unicef_focal_points(unicef_focal_points: dict, pd: ProgrammeDocument) -> ProgrammeDocument:

    pd.unicef_focal_point.all().update(active=False)

    # Create unicef_focal_points
    for unicef_focal_point_item in unicef_focal_points:
        unicef_focal_point, user = save_person_and_user(unicef_focal_point_item)
        if not unicef_focal_point:
            continue

        unicef_focal_point.active = True
        unicef_focal_point.save()

        pd.unicef_focal_point.add(unicef_focal_point)

    return pd


def update_create_agreement_auth_officers(agreement_auth_officers: dict, pd: ProgrammeDocument, workspace: Workspace, partner: Partner) -> ProgrammeDocument:

    pd.unicef_officers.all().update(active=False)

    # Create agreement_auth_officers
    for person_data in agreement_auth_officers:
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

    return pd


def update_create_partner_focal_points(focal_points: dict, pd: ProgrammeDocument, workspace: Workspace, partner: Partner) -> ProgrammeDocument:

    pd.partner_focal_point.all().update(active=False)

    # Create focal_points
    for person_data in focal_points:
        person, user = save_person_and_user(person_data, create_user=True)
        if not person:
            continue

        person.active = True
        person.save()
        pd.partner_focal_point.add(person)

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

    return pd
