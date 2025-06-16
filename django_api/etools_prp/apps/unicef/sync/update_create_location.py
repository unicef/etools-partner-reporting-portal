import logging

from etools_prp.apps.core.models import Location, Workspace
from etools_prp.apps.core.serializers import PMPLocationSerializer
from etools_prp.apps.unicef.sync.utils import process_model

logger = logging.getLogger(__name__)


def update_create_locations(i: dict, workspace: Workspace) -> (list, bool):
    locations = list()
    for loc in i['locations']:
        # Create gateway for location
        # TODO: assign country after PMP add these
        # fields into API

        if loc['admin_level'] is None:
            logger.warning("Admin level empty! Skipping!")
            return locations, False

        if loc['p_code'] is None or not loc['p_code']:
            logger.warning("Location code empty! Skipping!")
            return locations, False

        if 'parent_pcode' in loc:
            parent = Location.objects.filter(p_code=loc['parent_pcode']).first()
            loc['parent'] = parent.pk if parent else None

        # Create location
        location = process_model(
            Location,
            PMPLocationSerializer,
            loc,
            {
                'name': loc['name'],
                'p_code': loc['p_code'],
                'admin_level': loc['admin_level']
            }
        )

        if workspace not in location.workspaces.all():
            location.workspaces.add(workspace)

        locations.append(location)

    return locations, True
