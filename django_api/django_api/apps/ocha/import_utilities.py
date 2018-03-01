import logging
from time import sleep

import requests
from requests.status_codes import codes

from cluster.models import Cluster, ClusterObjective, ClusterActivity
from core.common import EXTERNAL_DATA_SOURCES
from ocha.constants import HPC_V2_ROOT_URL, HPC_V1_ROOT_URL
from ocha.import_serializers import V2PartnerProjectImportSerializer, V1FundingSourceImportSerializer, \
    V1ResponsePlanImportSerializer

logger = logging.getLogger('ocha-sync')


class OCHAImportException(Exception):
    pass


RETRY_ON_STATUS_CODES = {
    codes.bad_gateway,
    codes.gateway_timeout,
}


def get_json_from_url(url, retry_counter=2):
    response = requests.get(url)

    if response.status_code in RETRY_ON_STATUS_CODES and retry_counter > 0:
        sleep(5)
        return get_json_from_url(url, retry_counter=retry_counter - 1)
    elif not response.status_code == codes.ok:
        raise OCHAImportException('Invalid response status code: {}'.format(response.status_code))

    response_json = response.json()
    if not response_json['status'] == 'ok':
        raise OCHAImportException('Invalid json response status: {}'.format(response_json['status']))

    return response_json


def import_project(external_project_id):
    source_url = HPC_V2_ROOT_URL + 'project/{}'.format(external_project_id)
    project_data = get_json_from_url(source_url)
    serializer = V2PartnerProjectImportSerializer(data=project_data['data'])
    serializer.is_valid(raise_exception=True)
    project = serializer.save()
    project.external_url = source_url
    project.save()

    funding_url = HPC_V1_ROOT_URL + 'fts/flow?projectId={}'.format(external_project_id)
    funding_data = get_json_from_url(funding_url)
    try:
        funding_serializer = V1FundingSourceImportSerializer(data=funding_data['data'])
        funding_serializer.is_valid(raise_exception=True)
        funding_sources = funding_serializer.save()
        for fs in funding_sources:
            fs.external_url = funding_url
            fs.save()
    except Exception:
        logger.exception('No funding data found for project_id: {}'.format(external_project_id))

    return project


def import_response_plan(external_plan_id, workspace_id=None):
    source_url = HPC_V1_ROOT_URL + 'rpm/plan/id/{}?format=json&content=entities'.format(external_plan_id)
    plan_data = get_json_from_url(source_url)['data']
    if workspace_id:
        plan_data['workspace_id'] = workspace_id
    plan_serializer = V1ResponsePlanImportSerializer(data=plan_data)
    plan_serializer.is_valid(raise_exception=True)
    response_plan = plan_serializer.save()

    strategic_objectives_url = HPC_V1_ROOT_URL + 'rpm/plan/id/{}?format=json&content=measurements'.format(
        external_plan_id
    )
    strategic_objectives_data = get_json_from_url(strategic_objectives_url)['data']

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

    return ClusterObjective.objects.update_or_create(
        external_id=objective['id'],
        external_source=EXTERNAL_DATA_SOURCES.HPC,
        defaults={
            'cluster': cluster,
            'title': objective['value']['description'][:2048]
        }
    )[0]


def save_activities_and_objectives_for_response_plan(entities_response={}, measurements_response={}):
    activities = []
    objectives = []

    plan_entity_list = entities_response['planEntities'] + measurements_response['planEntities']
    for pe in plan_entity_list:
        if pe['value']['type']['en']['singular'] in {'Strategic Objective', 'Cluster Objective'}:
            objectives.append(pe)
        elif pe['value']['type']['en']['singular'] == 'Cluster Activity':
            activities.append(pe)

    for activity in activities:
        try:
            # Current schema limitation is that activity can only have one parent objective
            # TODO: Either schema change or some data duplication
            plan_entity_id = activity['value']['support'][0]['planEntityIds'][0]
        except (KeyError, IndexError):
            logger.warning('Activity #{} has no objective info'.format(activity['id']))

        parent_objective = list(filter(
            lambda obj: obj['id'] == plan_entity_id,
            objectives
        ))[0]

        cluster_objective = save_cluster_objective(parent_objective, activity)

        a, _ = ClusterActivity.objects.update_or_create(
            external_id=activity['id'],
            external_source=EXTERNAL_DATA_SOURCES.HPC,
            cluster_objective=cluster_objective,
            defaults={
                'title': activity['value']['description'][:2048]
            }
        )


def get_plan_list_for_country(country_iso3):
    source_url = HPC_V1_ROOT_URL + 'plan/country/{}'.format(country_iso3)
    try:
        get_json_from_url(source_url)['data']
    except Exception:
        logger.exception('Error trying to list plans for country')
