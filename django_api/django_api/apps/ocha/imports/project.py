from cluster.models import ClusterActivity
from core.common import EXTERNAL_DATA_SOURCES
from indicator.models import IndicatorBlueprint, Reportable, ReportableLocationGoal
from ocha.constants import HPC_V2_ROOT_URL, HPC_V1_ROOT_URL
from ocha.imports.serializers import V2PartnerProjectImportSerializer
from ocha.imports.utilities import get_json_from_url, save_location_list, logger, save_disaggregations
from ocha.utilities import get_dict_from_list_by_key, convert_to_json_ratio_value


def import_project_details(project, current_version_id):
    source_url = HPC_V2_ROOT_URL + 'project-version/{}/attachments'.format(current_version_id)
    attachments = get_json_from_url(source_url)['data']

    reportables = []

    for attachment in attachments:
        if attachment['attachment']['type'] == 'indicator':
            parent = ClusterActivity.objects.filter(
                external_source=EXTERNAL_DATA_SOURCES.HPC,
                external_id=attachment['attachment']['objectId'],
            ).first()

            # Some indicators seem to reference Cluster directly,
            # we do not have that option in our schema, skipping
            if not parent:
                continue

            blueprint, _ = IndicatorBlueprint.objects.update_or_create(
                external_source=EXTERNAL_DATA_SOURCES.HPC,
                external_id=attachment['attachment']['id'],
                defaults={
                    'title': attachment['attachment']['value']['description'],
                }
            )

            totals = attachment['attachment']['value']['metrics']['values']['totals']
            disaggregated = attachment['attachment']['value']['metrics']['values']['disaggregated']

            target = get_dict_from_list_by_key(totals, 'Target', key='name.en')['value']
            in_need = get_dict_from_list_by_key(totals, 'In Need', key='name.en')['value']
            baseline = get_dict_from_list_by_key(totals, 'Baseline', key='name.en')['value']

            locations = save_location_list(disaggregated['locations'])
            defaults = {
                'blueprint': blueprint,
                'target': convert_to_json_ratio_value(target),
                'baseline': convert_to_json_ratio_value(baseline),
                'in_need': convert_to_json_ratio_value(in_need),
                'content_object': parent,
            }

            reportable, _ = Reportable.objects.update_or_create(
                external_source=EXTERNAL_DATA_SOURCES.HPC,
                external_id=attachment['attachment']['id'],
                defaults={k: v for k, v in defaults.items() if v}
            )

            for location in locations:
                ReportableLocationGoal.objects.get_or_create(
                    reportable=reportable,
                    location=location
                )

            for disaggregation in save_disaggregations(
                disaggregated.get('categories', []), response_plan=project.response_plan
            ):
                reportable.disaggregations.through.objects.get_or_create(
                    reportable_id=reportable.id,
                    disaggregation_id=disaggregation.id
                )

            reportables.append(reportable)

    logger.debug('Saving {} reportables for {}'.format(
        len(reportables), project
    ))
    project.reportables.add(*reportables)


def import_project(external_project_id, response_plan=None):
    source_url = HPC_V2_ROOT_URL + 'project/{}'.format(external_project_id)
    project_data = get_json_from_url(source_url)
    serializer = V2PartnerProjectImportSerializer(data=project_data['data'])
    serializer.is_valid(raise_exception=True)
    project = serializer.save()

    from ocha.tasks import finish_partner_project_import
    finish_partner_project_import.delay(
        project.pk, response_plan_id=getattr(response_plan, 'id', None)
    )

    return project


def get_project_list_for_plan(plan_id):
    source_url = HPC_V1_ROOT_URL + 'project/plan/{}'.format(plan_id)
    try:
        return get_json_from_url(source_url)['data']
    except Exception:
        logger.exception('Error trying to list projects for response plan')
        return []
