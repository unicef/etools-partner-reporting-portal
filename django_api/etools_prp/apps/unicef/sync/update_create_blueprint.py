import logging

from etools_prp.apps.indicator.models import IndicatorBlueprint
from etools_prp.apps.indicator.serializers import PMPIndicatorBlueprintSerializer
from etools_prp.apps.unicef.models import ProgrammeDocument
from etools_prp.apps.unicef.sync.utils import process_model

logger = logging.getLogger(__name__)


def update_create_blueprint(i: dict, pd: ProgrammeDocument) -> (dict, IndicatorBlueprint):
    # Create IndicatorBlueprint
    i['disaggregatable'] = True
    # TODO: Fix db schema to accommodate larger lengths
    i['title'] = i['title'][:255] if i['title'] else "unknown"

    if i['unit'] == '':
        if int(i['baseline']['d']) == 1:
            i['unit'] = 'number'
            i['display_type'] = 'number'

        elif int(i['baseline']['d']) != 1:
            i['unit'] = 'percentage'
            i['display_type'] = 'percentage'

    elif i['unit'] == 'number':
        i['display_type'] = 'number'

    elif i['unit'] == 'percentage':
        i['calculation_formula_across_periods'] = 'latest'

    blueprint = process_model(
        IndicatorBlueprint,
        PMPIndicatorBlueprintSerializer,
        i, {
            'external_id': i['blueprint_id'],
            'reportables__lower_level_outputs__cp_output__programme_document': pd.id
        }
    )

    return i, blueprint
