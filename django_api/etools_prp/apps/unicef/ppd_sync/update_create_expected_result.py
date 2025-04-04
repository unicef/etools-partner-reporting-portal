from etools_prp.apps.core.models import Workspace
from etools_prp.apps.unicef.models import LowerLevelOutput, PDResultLink, ProgrammeDocument
from etools_prp.apps.unicef.ppd_sync.utils import process_model
from etools_prp.apps.unicef.serializers import PMPLLOSerializer, PMPPDResultLinkSerializer


def update_create_expected_result_rl(expected_result_item: dict, workspace: Workspace, pd: ProgrammeDocument) -> PDResultLink:

    # Create PDResultLink
    _result_link_item = expected_result_item['cp_output']

    _result_link_item['programme_document'] = pd.id
    _result_link_item['result_link'] = expected_result_item['result_link']
    _result_link_item['external_business_area_code'] = workspace.business_area_code

    pd_result_link = process_model(
        PDResultLink, PMPPDResultLinkSerializer,
        _result_link_item, {
            'external_id': _result_link_item['result_link'],
            'external_cp_output_id': _result_link_item['id'],
            'programme_document': pd.id,
            'external_business_area_code': workspace.business_area_code,
        }
    )

    return pd_result_link


def update_create_expected_result_llos(expected_result_item: dict, workspace: Workspace, pd: ProgrammeDocument, pd_result_link: PDResultLink)\
        -> (dict, LowerLevelOutput):

    # Create LLO
    expected_result_item['cp_output'] = pd_result_link.id
    expected_result_item['external_business_area_code'] = workspace.business_area_code

    llo = process_model(
        LowerLevelOutput, PMPLLOSerializer, expected_result_item,
        {
            'external_id': expected_result_item['id'],
            'cp_output__programme_document': pd.id,
            'external_business_area_code': workspace.business_area_code,
        }
    )

    # Mark LLO as active
    llo.active = True
    llo.save()

    return expected_result_item, llo
