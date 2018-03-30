import logging

from celery import shared_task

from ocha.constants import HPC_V1_ROOT_URL
from ocha.imports.utilities import get_json_from_url, save_activities_and_objectives_for_response_plan

logger = logging.getLogger('ocha-sync')


@shared_task
def finish_response_plan_import(external_plan_id):
    source_url = HPC_V1_ROOT_URL + 'rpm/plan/id/{}?format=json&content=entities'.format(external_plan_id)
    plan_data = get_json_from_url(source_url)['data']

    strategic_objectives_url = HPC_V1_ROOT_URL + 'rpm/plan/id/{}?format=json&content=measurements'.format(
        external_plan_id
    )
    strategic_objectives_data = get_json_from_url(strategic_objectives_url)['data']

    logger.debug('Importing Cluster Objectives and Activities for Response Plan #{}'.format(external_plan_id))
    save_activities_and_objectives_for_response_plan(
        entities_response=plan_data, measurements_response=strategic_objectives_data
    )
