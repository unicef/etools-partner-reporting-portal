import logging

from etools_prp.apps.unicef.models import ProgrammeDocument
from etools_prp.apps.unicef.ppd_sync.utils import save_person_and_user

logger = logging.getLogger(__name__)


def update_create_unicef_focal_points(unicef_focal_points: dict, pd: ProgrammeDocument) -> ProgrammeDocument:

    # Create unicef_focal_points
    for unicef_focal_point_item in unicef_focal_points:
        unicef_focal_point, user = save_person_and_user(unicef_focal_point_item)
        if not unicef_focal_point:
            continue

        unicef_focal_point.active = True
        unicef_focal_point.save()

        pd.unicef_focal_point.add(unicef_focal_point)

    pd.unicef_focal_point.all().update(active=False)

    return pd
