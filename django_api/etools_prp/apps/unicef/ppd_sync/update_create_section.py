from typing import Any

from etools_prp.apps.core.models import Workspace
from etools_prp.apps.unicef.models import ProgrammeDocument, Section
from etools_prp.apps.unicef.ppd_sync.utils import process_model
from etools_prp.apps.unicef.serializers import PMPSectionSerializer


def update_create_section(item: Any, pd: ProgrammeDocument, workspace: Workspace) -> (Any, ProgrammeDocument):

    section_data_list = item['sections']
    for section_data in section_data_list:
        section_data['external_business_area_code'] = workspace.business_area_code
        section = process_model(
            Section, PMPSectionSerializer, section_data, {
                'external_id': section_data['id'],
                'external_business_area_code': workspace.business_area_code,
            }
        )
        pd.sections.add(section)

    return item, pd
