import logging

from etools_prp.apps.indicator.models import Disaggregation, DisaggregationValue, Reportable
from etools_prp.apps.indicator.serializers import PMPDisaggregationSerializer, PMPDisaggregationValueSerializer
from etools_prp.apps.unicef.models import ProgrammeDocument
from etools_prp.apps.unicef.ppd_sync.utils import process_model

logger = logging.getLogger(__name__)


def update_create_disaggregation(i: dict, pd: ProgrammeDocument) -> list:
    # If indicator is not cluster, create
    # Disaggregation otherwise use parent
    # Disaggregation

    disaggregations = list()
    if i['is_cluster_indicator']:
        # Get Disaggregation
        try:
            disaggregations = list(
                Reportable.objects.get(
                    id=i['cluster_indicator_id']).disaggregations.all())
        except Reportable.DoesNotExist:
            disaggregations = list()
    else:
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
