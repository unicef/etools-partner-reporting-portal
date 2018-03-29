import logging
from time import sleep

import requests
from requests import RequestException
from requests.status_codes import codes

from cluster.models import Cluster, ClusterObjective
from core.common import EXTERNAL_DATA_SOURCES
from core.models import Country, GatewayType, Location
from indicator.models import Reportable, IndicatorBlueprint
from ocha.constants import HPC_V2_ROOT_URL
from ocha.imports.bulk import fetch_json_urls_async
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


def save_location_list(location_list):
    location_ids = [l['id'] for l in location_list if 'id' in l]
    source_urls = [
        HPC_V2_ROOT_URL + 'location/{}'.format(lid) for lid in location_ids
    ]
    location_data_list = fetch_json_urls_async(source_urls)

    location_country_map = {}

    location_data_list = sorted(location_data_list, key=lambda l: l['data']['adminLevel'])

    locations = []
    for location_data in location_data_list:
        if location_data['data']['adminLevel'] == 0:
            country, _ = Country.objects.update_or_create(
                country_short_code=location_data['data']['iso3'],
                defaults={
                    'name': location_data['data']['name']
                }
            )
            for child in location_data['data']['children']:
                location_country_map[child['id']] = country
        elif location_data['data']['id'] in location_country_map:
            country = location_country_map[location_data['data']['id']]
            for child in location_data['data']['children']:
                location_country_map[child['id']] = country
        else:
            logger.warning(
                'Couldn\'t find country for {}, skipping'.format(location_data['data']['id'])
            )

        gateway_name = '{} - Admin Level {}'.format(country.country_short_code, location_data['data']['adminLevel'])
        gateway, _ = GatewayType.objects.get_or_create(
            country=country,
            admin_level=location_data['data']['adminLevel'],
            defaults={
                'name': gateway_name
            }
        )

        location, _ = Location.objects.update_or_create(
            external_source=EXTERNAL_DATA_SOURCES.HPC,
            external_id=location_data['data']['id'],
            defaults={
                'title': location_data['data']['name'],
                'p_code': location_data['data']['pcode'],
                'latitude': location_data['data'].get('latitude'),
                'longitude': location_data['data'].get('longitude'),
                'gateway': gateway,
            }
        )
        locations.append(location)

    return locations


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
