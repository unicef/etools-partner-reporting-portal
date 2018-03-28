import logging
from time import sleep

import itertools
import requests
from requests import RequestException
from requests.status_codes import codes

from cluster.models import Cluster, ClusterObjective, ClusterActivity
from core.common import EXTERNAL_DATA_SOURCES, CLUSTER_TYPES
from core.models import ResponsePlan
from indicator.models import Reportable, IndicatorBlueprint
from ocha.constants import HPC_V2_ROOT_URL, HPC_V1_ROOT_URL, RefCode
from ocha.imports.serializers import V2PartnerProjectImportSerializer, V1FundingSourceImportSerializer, \
    V1ResponsePlanImportSerializer
from ocha.utilities import get_dict_from_list_by_key

logger = logging.getLogger('ocha-sync')


class OCHAImportException(Exception):
    pass


RETRY_ON_STATUS_CODES = {
    codes.bad_gateway,
    codes.gateway_timeout,
}

MAX_URL_RETRIES = 2


def get_json_from_url(url, retry_counter=MAX_URL_RETRIES):
    def retry():
        sleep(5)
        return get_json_from_url(url, retry_counter=retry_counter - 1)

    logger.debug('Getting {}, attempt: {}'.format(url, MAX_URL_RETRIES - retry_counter + 1))
    try:
        response = requests.get(url, timeout=20)
    except RequestException:
        return retry()

    if response.status_code in RETRY_ON_STATUS_CODES and retry_counter > 0:
        return retry()
    elif not response.status_code == codes.ok:
        raise OCHAImportException('Invalid response status code: {}'.format(response.status_code))

    response_json = response.json()
    if not response_json['status'] == 'ok':
        raise OCHAImportException('Invalid json response status: {}'.format(response_json['status']))

    return response_json


def import_project_details(project, current_version_id):
    source_url = HPC_V2_ROOT_URL + 'project-version/{}/attachments'.format(current_version_id)
    attachments = get_json_from_url(source_url)['data']

    reportables = []

    for attachment in attachments:
        if attachment['attachment']['type'] == 'indicator':
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

            # TODO: Parent activity
            reportable, _ = Reportable.objects.update_or_create(
                external_source=EXTERNAL_DATA_SOURCES.HPC,
                external_id=attachment['attachment']['id'],
                defaults={
                    'blueprint': blueprint,
                    'target': target,
                    'in_need': in_need,
                    'baseline': baseline,
                }
            )
            reportables.append(reportable)

    project.reportables.add(*reportables)


def import_project(external_project_id, response_plan=None):
    source_url = HPC_V2_ROOT_URL + 'project/{}'.format(external_project_id)
    project_data = get_json_from_url(source_url)
    serializer = V2PartnerProjectImportSerializer(data=project_data['data'])
    serializer.is_valid(raise_exception=True)
    project = serializer.save()

    funding_url = HPC_V1_ROOT_URL + 'fts/flow?projectId={}'.format(external_project_id)
    funding_data = get_json_from_url(funding_url)
    try:
        funding_serializer = V1FundingSourceImportSerializer(data=funding_data['data'])
        funding_serializer.is_valid(raise_exception=True)
        funding_serializer.save()
    except Exception:
        logger.exception('No funding data found for project_id: {}'.format(external_project_id))

    clusters = []
    if not response_plan:
        for plan in project_data['data']['plans']:
            if not ResponsePlan.objects.filter(
                    external_source=EXTERNAL_DATA_SOURCES.HPC, external_id=plan['id']
            ).exists():
                import_response_plan(plan['id'])
    else:
        for global_cluster_data in project_data['data']['globalClusters']:
            # Don't save external_id for global clusters - it won't pass unique constraint
            cluster, _ = Cluster.objects.get_or_create(
                external_source=EXTERNAL_DATA_SOURCES.HPC,
                type=CLUSTER_TYPES.imported,
                imported_type=global_cluster_data['name'],
                response_plan=response_plan,
            )
            clusters.append(cluster)

    project_cluster_ids = [c['id'] for c in project_data['data']['governingEntities'] if c['entityPrototypeId'] == 9]

    # At this point all clusters should be in DB
    clusters.extend(Cluster.objects.filter(
        external_source=EXTERNAL_DATA_SOURCES.HPC,
        external_id__in=project_cluster_ids,
    ))
    project.clusters.add(*clusters)
    import_project_details(project, project_data['data']['currentPublishedVersionId'])

    return project


def import_response_plan(external_plan_id, workspace=None):
    logger.debug('Importing Response Plan #{}'.format(external_plan_id))
    source_url = HPC_V1_ROOT_URL + 'rpm/plan/id/{}?format=json&content=entities'.format(external_plan_id)
    plan_data = get_json_from_url(source_url)['data']
    if workspace:
        plan_data['workspace_id'] = workspace.id
    plan_serializer = V1ResponsePlanImportSerializer(data=plan_data)
    plan_serializer.is_valid(raise_exception=True)
    response_plan = plan_serializer.save()

    strategic_objectives_url = HPC_V1_ROOT_URL + 'rpm/plan/id/{}?format=json&content=measurements'.format(
        external_plan_id
    )
    strategic_objectives_data = get_json_from_url(strategic_objectives_url)['data']

    logger.debug('Importing Cluster Objectives and Activities for Response Plan #{}'.format(external_plan_id))
    save_activities_and_objectives_for_response_plan(
        entities_response=plan_data, measurements_response=strategic_objectives_data
    )

    return response_plan


def save_cluster_objective(objective, child_activity):
    cluster_id = objective.get('parentId') or child_activity.get('parentId')
    cluster = Cluster.objects.filter(
        external_source=EXTERNAL_DATA_SOURCES.HPC,
        external_id=cluster_id,
    ).first()
    if not cluster:
        logger.error('Cluster #{} not found, skipping objective #{}'.format(
            cluster_id, objective['id']
        ))
        return None

    cluster_objective, _ = ClusterObjective.objects.update_or_create(
        external_id=objective['id'],
        external_source=EXTERNAL_DATA_SOURCES.HPC,
        defaults={
            'cluster': cluster,
            'title': objective['value']['description'][:2048]
        }
    )

    save_reportables_for_cluster_objective_or_activity(cluster_objective, objective['attachments'])
    return cluster_objective


def save_reportables_for_cluster_objective_or_activity(objective_or_activity, attachments):
    logger.debug('Saving {} reportables for {}'.format(len(attachments), objective_or_activity))
    reportables = []
    for attachment in attachments:
        if not attachment['type'] == 'indicator':
            continue

        values = attachment['value']['metrics']['values']['totals']
        disaggregated = attachment['value']['metrics']['values'].get('disaggregated', {})

        blueprint, _ = IndicatorBlueprint.objects.update_or_create(
            external_id=attachment['id'],
            external_source=EXTERNAL_DATA_SOURCES.HPC,
            defaults={
                'title': attachment['value']['description'],
                'disaggregatable': bool(disaggregated),
            }
        )

        reportable, _ = Reportable.objects.update_or_create(
            external_id=attachment['id'],
            external_source=EXTERNAL_DATA_SOURCES.HPC,
            defaults={
                'target': get_dict_from_list_by_key(values, 'target').get('value', 0),
                'baseline': get_dict_from_list_by_key(values, 'baseline').get('value', 0),
                'in_need': get_dict_from_list_by_key(values, 'inNeed').get('value', 0),
                'content_object': objective_or_activity,
                'blueprint': blueprint,
            }
        )
        reportables.append(reportable)
    objective_or_activity.reportables.add(*reportables)


def save_activities_and_objectives_for_response_plan(entities_response={}, measurements_response={}):
    activities = []
    objectives = {}

    plan_entity_list = entities_response['planEntities'] + measurements_response['planEntities']
    for entity in plan_entity_list:
        if entity['entityPrototype']['refCode'] in {RefCode.CLUSTER_OBJECTIVE, RefCode.STRATEGIC_OBJECTIVE}:
            objectives[entity['id']] = entity
        elif entity['entityPrototype']['refCode'] == RefCode.CLUSTER_ACTIVITY:
            activities.append(entity)
    logger.debug('Found {} objectives and {} activities'.format(
        len(objectives), len(activities)
    ))

    for activity in activities:
        try:
            parent_objective_ids = list(itertools.chain(*[
                s['planEntityIds'] for s in activity['value']['support']
            ]))

            if len(parent_objective_ids) > 1:
                logger.warning(
                    'Activity \n`{}` supports \n{} \nobjectives. Only 1st one will be saved.'.format(
                        activity['value']['description'],
                        [objectives[obj_id]['value']['description'] for obj_id in parent_objective_ids]
                    )
                )
            parent_objective = objectives[parent_objective_ids[0]]
        except (KeyError, IndexError):
            logger.warning('Activity #{} has no objective info'.format(activity['id']))
            continue

        cluster_objective = save_cluster_objective(parent_objective, activity)
        if cluster_objective:
            cluster_activity, _ = ClusterActivity.objects.update_or_create(
                external_id=activity['id'],
                external_source=EXTERNAL_DATA_SOURCES.HPC,
                defaults={
                    'cluster_objective': cluster_objective,
                    'title': activity['value']['description'][:2048]
                }
            )
            save_reportables_for_cluster_objective_or_activity(cluster_activity, activity['attachments'])


def get_plan_list_for_country(country_iso3):
    source_url = HPC_V1_ROOT_URL + 'plan/country/{}'.format(country_iso3)
    try:
        return get_json_from_url(source_url)['data']
    except Exception:
        logger.exception('Error trying to list plans for country')
        return []


def get_project_list_for_plan(plan_id):
    source_url = HPC_V1_ROOT_URL + 'project/plan/{}'.format(plan_id)
    try:
        return get_json_from_url(source_url)['data']
    except Exception:
        logger.exception('Error trying to list projects for response plan')
        return []


def import_plans_for_country(country_iso3):
    plans = get_plan_list_for_country(country_iso3)
    logger.debug('Importing {} Response Plans for {}'.format(
        len(plans), country_iso3
    ))
    for plan in plans:
        try:
            import_response_plan(plan['id'])
        except Exception:
            logger.exception('Problem importing Response Plan #{}'.format(plan['id']))
