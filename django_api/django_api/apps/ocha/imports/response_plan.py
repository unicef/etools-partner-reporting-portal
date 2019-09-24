import itertools

from cluster.models import ClusterActivity
from core.common import EXTERNAL_DATA_SOURCES
from ocha.constants import HPC_V1_ROOT_URL, RefCode
from ocha.imports.serializers import V1ResponsePlanImportSerializer
from ocha.imports.utilities import logger, get_json_from_url, save_cluster_objective, \
    save_reportables_for_cluster_objective_or_activity


def import_response_plan(external_plan_id, workspace=None, asynch=True):
    logger.debug('Importing Response Plan #{}'.format(external_plan_id))
    source_url = HPC_V1_ROOT_URL + 'rpm/plan/id/{}?format=json&content=entities'.format(external_plan_id)
    plan_data = get_json_from_url(source_url)['data']
    if workspace:
        plan_data['workspace_id'] = workspace.id

    plan_data['name'] = plan_data['planVersion']['name']
    plan_data['startDate'] = plan_data['planVersion']['startDate']
    plan_data['endDate'] = plan_data['planVersion']['endDate']

    plan_serializer = V1ResponsePlanImportSerializer(data=plan_data)
    plan_serializer.is_valid(raise_exception=True)
    response_plan = plan_serializer.save()

    # Do most of the work in background, otherwise it times out the request a lot
    from ocha.tasks import finish_response_plan_import
    (finish_response_plan_import.delay if asynch else finish_response_plan_import)(external_plan_id)

    return response_plan


def save_activities_and_objectives_for_response_plan(entities_response={}, measurements_response={}):
    logger.debug('Importing Activities and Objectives for Response Plan')

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
            activity_data = activity['planEntityVersion']['value']['support']

            # Cameroon data is different format
            # 'support': {'0': {'planEntityIds': []}}
            if isinstance(activity_data, dict):
                new_activity_data = list()
                for value in activity_data.values():
                    new_activity_data.append(value)

                activity_data = new_activity_data

            parent_objective_ids = list(itertools.chain(*[
                s['planEntityIds'] for s in activity_data
            ]))

            if len(parent_objective_ids) > 1:
                logger.warning(
                    'Activity \n`{}` supports \n{} \nobjectives. Only 1st one will be saved.'.format(
                        activity['planEntityVersion']['value']['description'],
                        [objectives[obj_id]['planEntityVersion']['value']['description'] for obj_id in parent_objective_ids]
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
                    'title': activity['planEntityVersion']['value']['description'][:2048]
                }
            )

            save_reportables_for_cluster_objective_or_activity(cluster_activity, activity['attachments'])

    for objective in objectives.values():
        save_cluster_objective(objective)


def get_plan_list_for_country(country_iso3):
    source_url = HPC_V1_ROOT_URL + 'plan/country/{}'.format(country_iso3)
    try:
        return get_json_from_url(source_url)['data']
    except Exception:
        logger.exception('Error trying to list plans for country')
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
