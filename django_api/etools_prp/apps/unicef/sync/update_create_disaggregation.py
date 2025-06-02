import logging

from etools_prp.apps.indicator.models import Disaggregation, DisaggregationValue
from etools_prp.apps.indicator.serializers import PMPDisaggregationSerializer, PMPDisaggregationValueSerializer
from etools_prp.apps.unicef.models import ProgrammeDocument
from etools_prp.apps.unicef.sync.utils import process_model

logger = logging.getLogger(__name__)


def update_create_disaggregations(i: dict, pd: ProgrammeDocument) -> list:
    disaggregations = list()

    # Create Disaggregation
    for dis in i['disaggregation']:
        dis['active'] = True
        disaggregation = process_model(
            Disaggregation, PMPDisaggregationSerializer,
            dis, {
                'name': dis['name'],
                'reportable__lower_level_outputs__cp_output__programme_document__workspace': pd.workspace.id
            }
        )
        disaggregations.append(disaggregation)

        # Create Disaggregation Values
        for dv in dis['disaggregation_values']:
            dv['disaggregation'] = disaggregation.id
            process_model(
                DisaggregationValue,
                PMPDisaggregationValueSerializer,
                dv,
                {
                    'disaggregation_id': disaggregation.id,
                    'value': dv['value'],
                }
            )

    return disaggregations
