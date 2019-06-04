from cluster.models import ClusterActivity
from core.common import EXTERNAL_DATA_SOURCES
from indicator.models import IndicatorBlueprint, Reportable, ReportableLocationGoal
from ocha.constants import HPC_V2_ROOT_URL, HPC_V1_ROOT_URL
from ocha.imports.serializers import V2PartnerProjectImportSerializer
from ocha.imports.utilities import get_json_from_url, save_location_list, logger, save_disaggregations
from ocha.utilities import get_dict_from_list_by_key, convert_to_json_ratio_value
from partner.models import PartnerActivity


def import_project_details(project, current_version_id):
    source_url = HPC_V2_ROOT_URL + 'projectVersion/{}/attachments'.format(current_version_id)
    attachments = get_json_from_url(source_url)['data']

    if not attachments:
        logger.warning('No project attachment V2 data found for project_id: {}. Skipping reportables and location data'.format(current_version_id))
        return

    reportables = []

    for attachment in attachments:
        if attachment['attachment']['type'] == 'indicator':
            cluster_activity = ClusterActivity.objects.filter(
                external_source=EXTERNAL_DATA_SOURCES.HPC,
                external_id=attachment['attachment']['objectId'],
            ).first()

            blueprint, _ = IndicatorBlueprint.objects.update_or_create(
                external_source=EXTERNAL_DATA_SOURCES.HPC,
                external_id=attachment['attachment']['id'],
                defaults={
                    'title': attachment['attachment']['value']['description'],
                }
            )

            totals = attachment['attachment']['value']['metrics']['values']['totals']

            target = get_dict_from_list_by_key(totals, 'Target', key='name.en')['value']
            in_need = get_dict_from_list_by_key(totals, 'In Need', key='name.en')['value']
            baseline = get_dict_from_list_by_key(totals, 'Baseline', key='name.en')['value']

            defaults = {
                'blueprint': blueprint,
                'target': convert_to_json_ratio_value(target),
                'baseline': convert_to_json_ratio_value(baseline),
                'in_need': convert_to_json_ratio_value(in_need),
                'content_object': project,
            }

            reportable, _ = Reportable.objects.update_or_create(
                external_source=EXTERNAL_DATA_SOURCES.HPC,
                external_id=attachment['attachment']['id'],
                defaults={k: v for k, v in defaults.items() if v}
            )

            try:
                disaggregated = attachment['attachment']['value']['metrics']['values']['disaggregated']
                for disaggregation in save_disaggregations(
                        disaggregated.get('categories', []), response_plan=project.response_plan
                ):
                    reportable.disaggregations.through.objects.get_or_create(
                        reportable_id=reportable.id,
                        disaggregation_id=disaggregation.id
                    )

                locations = save_location_list(disaggregated['locations'], "indicator")
                for location in locations:
                    ReportableLocationGoal.objects.get_or_create(reportable=reportable, location=location)
            except (KeyError, TypeError, AttributeError):
                locations = []

            if cluster_activity:
                from indicator.models import create_pa_reportables_from_ca
                partner_activity, _ = PartnerActivity.objects.update_or_create(
                    project=project,
                    cluster_activity=cluster_activity,
                    defaults={
                        'title': cluster_activity.title,
                        'start_date': project.start_date,
                        'end_date': project.end_date,
                        'partner': project.partner,
                    }
                )
                partner_activity.locations.add(*locations)
                create_pa_reportables_from_ca(partner_activity, cluster_activity)

                project.reportables.add(reportable)
                project.locations.add(*locations)

            reportables.append(reportable)

    logger.debug('Saved {} reportables for {}'.format(
        len(reportables), project
    ))


def import_project(external_project_id, partner_id, response_plan=None, async=True):
    source_url = HPC_V2_ROOT_URL + 'project/{}'.format(external_project_id)
    project_data = get_json_from_url(source_url)['data']
    # Grab project details from projectVersion array of dict
    current_project_data = None

    for project in project_data['projectVersions']:
        if project_data['currentPublishedVersionId'] == project['id']:
            current_project_data = project
            break

    current_project_data['partner'] = partner_id
    if 'code' in project_data:
        current_project_data['code'] = project_data['code']

    additional_information = list()
    if 'contacts' in current_project_data:
        for contact in current_project_data['contacts']:
            if "website" in contact and contact['website']:
                additional_information.append(contact['website'])
    current_project_data['additional_information'] = ", ".join(additional_information)

    current_project_data['cluster_ids'] = list()
    if 'governingEntities' in current_project_data:
        for cluster in current_project_data['governingEntities']:
            current_project_data['cluster_ids'].append(cluster['id'])

    serializer = V2PartnerProjectImportSerializer(data=current_project_data)
    serializer.is_valid(raise_exception=True)
    project = serializer.save()

    from ocha.tasks import finish_partner_project_import
    (finish_partner_project_import.delay if async else finish_partner_project_import)(
        project.pk, external_project_id, response_plan_id=getattr(response_plan, 'id', None)
    )

    return project


def get_project_list_for_plan(plan_id):
    source_url = HPC_V1_ROOT_URL + 'project/plan/{}'.format(plan_id)
    try:
        return get_json_from_url(source_url)['data']
    except Exception:
        logger.exception('Error trying to list projects for response plan')
        return []
