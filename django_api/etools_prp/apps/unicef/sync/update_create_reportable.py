from django.contrib.contenttypes.models import ContentType

from celery.bootsteps import Blueprint

from etools_prp.apps.indicator.models import Reportable
from etools_prp.apps.indicator.serializers import PMPReportableSerializer
from etools_prp.apps.unicef.models import LowerLevelOutput, ProgrammeDocument
from etools_prp.apps.unicef.sync.utils import process_model
from etools_prp.apps.unicef.utils import convert_string_values_to_numeric


def update_create_reportable(i: dict, blueprint: Blueprint, disaggregations: list, llo: LowerLevelOutput, item: dict, pd: ProgrammeDocument) -> \
        (dict, Reportable, bool):

    i['is_unicef_hf_indicator'] = i['is_high_frequency']

    i['blueprint_id'] = blueprint.id if blueprint else None
    i['disaggregation_ids'] = [ds.id for ds in disaggregations]

    i['content_type'] = ContentType.objects.get_for_model(llo).id
    i['object_id'] = llo.id
    i['start_date'] = item['start_date']
    i['end_date'] = item['end_date']

    convert_string_values_to_numeric(i['target'])
    convert_string_values_to_numeric(i['baseline'])

    reportable = process_model(
        Reportable,
        PMPReportableSerializer,
        i, {
            'external_id': i['id'],
            'lower_level_outputs__cp_output__programme_document': pd.id
        }
    )
    reportable.active = i['is_active']

    reportable.save()

    return i, reportable
