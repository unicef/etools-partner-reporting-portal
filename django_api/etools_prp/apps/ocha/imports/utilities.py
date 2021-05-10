import base64
import logging
from time import sleep

from django.conf import settings
from django.core.cache import cache

import requests
from cluster.models import Cluster, ClusterObjective
from core.common import EXTERNAL_DATA_SOURCES
from core.models import Country, GatewayType, Location
from indicator.models import Disaggregation, DisaggregationValue, IndicatorBlueprint, Reportable, ReportableLocationGoal
from ocha.constants import HPC_V2_ROOT_URL
from ocha.utilities import convert_to_json_ratio_value, get_dict_from_list_by_key
from requests import RequestException
from requests.status_codes import codes

logger = logging.getLogger('ocha-sync')


class OCHAImportException(Exception):
    pass


RETRY_ON_STATUS_CODES = {
    codes.bad_gateway,
    codes.gateway_timeout,
}

MAX_URL_RETRIES = 2
CACHE_URL_FOR = 300  # Seconds


def get_headers():
    username = settings.OCHA_API_USER
    password = settings.OCHA_API_PASSWORD

    headers = {}
    if username and password:
        auth_pair_str = '%s:%s' % (username, password)
        headers['Authorization'] = 'Basic ' + \
                                   base64.b64encode(auth_pair_str.encode()).decode()
    return headers


def get_json_from_url(url, retry_counter=MAX_URL_RETRIES):
    cached_response = cache.get(url)
    if cached_response:
        return cached_response

    def retry():
        sleep(5)
        return get_json_from_url(url, retry_counter=retry_counter - 1)

    logger.debug('Getting {}, attempt: {}'.format(url, MAX_URL_RETRIES - retry_counter + 1))
    try:
        response = requests.get(
            url,
            timeout=20,
            headers=get_headers()
        )
    except RequestException:
        return retry()

    if response.status_code in RETRY_ON_STATUS_CODES and retry_counter > 0:
        return retry()
    elif not response.status_code == codes.ok:
        raise OCHAImportException('Invalid response status code: {}'.format(response.status_code))

    response_json = response.json()
    if not response_json['status'] == 'ok':
        raise OCHAImportException('Invalid json response status: {}'.format(response_json['status']))
    cache.set(url, response_json, CACHE_URL_FOR)

    return response_json


def save_location_list(location_list, source_type):
    if not location_list:
        logger.info('No locations for {}'.format(source_type))
        return

    if source_type == "response_plan":
        logger.info('Saving response plan locations...')
        id_key = 'id'

    elif source_type == "project":
        logger.info('Saving project locations...')
        id_key = 'external_id'

    elif source_type == "indicator":
        logger.info('Saving indicator locations...')
        id_key = 'name'

    locations = []

    for location_data in location_list:
        if id_key == 'external_id' or id_key == 'id':
            location = Location.objects.filter(
                external_source=EXTERNAL_DATA_SOURCES.HPC,
                external_id=location_data[id_key]
            ).first()
        else:
            location = Location.objects.filter(
                external_source=EXTERNAL_DATA_SOURCES.HPC,
                title=location_data[id_key]
            ).first()

        if not location:
            parent_loc = None

            if source_type == "indicator" and 'parent' in location_data:
                parent_loc = Location.objects.filter(
                    external_source=EXTERNAL_DATA_SOURCES.HPC,
                    title=location_data['parent']['name']
                ).first()

                if not parent_loc:
                    logger.warning('Couldn\'t find parent location for {}, skipping: {}'.format(
                        source_type, location_data
                    ))
                    continue

            elif source_type == "project" and 'parentId' in location_data:
                parent_loc = Location.objects.filter(
                    external_source=EXTERNAL_DATA_SOURCES.HPC,
                    external_id=location_data['parentId']
                ).first()

                if not parent_loc:
                    logger.warning('Couldn\'t find parent location for {}, skipping: {}'.format(
                        source_type, location_data
                    ))
                    continue

            if parent_loc:
                country = parent_loc.gateway.country

            elif 'adminLevel' in location_data \
                    and location_data['adminLevel'] == 0:
                country, _ = Country.objects.update_or_create(
                    iso3_code=location_data['iso3'],
                    defaults={
                        'name': location_data['name']
                    }
                )

            if not country:
                logger.warning('Couldn\'t find country for {}, skipping: {}'.format(
                    source_type, location_data
                ))
                continue

            if 'adminLevel' not in location_data:
                logger.warning('Couldn\'t find gateway for {}, skipping: {}'.format(
                    source_type, location_data
                ))
                continue

            gateway_name = '{}-Admin Level {}'.format(country.iso3_code, location_data['adminLevel'])
            logger.debug('Saving gateway type with name {}'.format(gateway_name))
            gateway, _ = GatewayType.objects.get_or_create(
                country=country,
                admin_level=location_data['adminLevel'],
                name=gateway_name,
            )

            loc_id = location_data['id'] if 'id' in location_data else location_data['external_id']
            loc_name = location_data['name'] if 'name' in location_data else location_data['title']

            location, _ = Location.objects.update_or_create(
                gateway=gateway,
                title=loc_name,
                defaults={
                    'external_source': EXTERNAL_DATA_SOURCES.HPC,
                    'external_id': loc_id,
                    'latitude': location_data.get('latitude', None),
                    'longitude': location_data.get('longitude', None),
                    'parent': parent_loc,
                }
            )
            logger.debug('Saved location {} as {}'.format(loc_name, location))

        locations.append(location)

    return locations


def save_disaggregations(disaggregation_categories, response_plan=None):
    category_to_group = get_disaggregation_category_to_group_map()

    disaggregations = []

    for category in disaggregation_categories:
        for category_id in category['ids']:
            if category_id in category_to_group:
                group_data = category_to_group[category_id]
                disaggregation, _ = Disaggregation.objects.update_or_create(
                    name=group_data['label'],
                    response_plan=response_plan
                )
                disaggregations.append(disaggregation)

                for category_data in group_data['disaggregationCategories']:
                    DisaggregationValue.objects.update_or_create(
                        value=category_data['label'],
                        disaggregation=disaggregation
                    )

    logger.debug('Saved {} disaggregations from {}'.format(
        len(disaggregations), disaggregation_categories
    ))

    return disaggregations


def save_cluster_objective(objective, child_activity=None):
    child_activity = child_activity or {}
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
            'title': objective['planEntityVersion']['value']['description'][:2048]
        }
    )
    logger.debug('Saved Cluster Objective: {}'.format(cluster_objective))
    save_reportables_for_cluster_objective_or_activity(cluster_objective, objective['attachments'])
    return cluster_objective


def save_reportables_for_cluster_objective_or_activity(objective_or_activity, attachments):
    logger.debug('Saving {} reportables for {}'.format(len(attachments), objective_or_activity))
    reportables = []
    for attachment in attachments:
        if not attachment['type'] == 'indicator':
            continue

        values = attachment['attachmentVersion']['value']['metrics']['values']['totals']
        disaggregated = attachment['attachmentVersion']['value']['metrics']['values'].get('disaggregated', {})

        blueprint, _ = IndicatorBlueprint.objects.update_or_create(
            external_id=attachment['id'],
            external_source=EXTERNAL_DATA_SOURCES.HPC,
            defaults={
                'title': attachment['attachmentVersion']['value']['description'],
                'disaggregatable': bool(disaggregated),
            }
        )

        target = get_dict_from_list_by_key(values, 'target').get('value', 0),
        baseline = get_dict_from_list_by_key(values, 'baseline').get('value', 0),
        in_need = get_dict_from_list_by_key(values, 'inNeed').get('value', 0),

        defaults = {
            'target': convert_to_json_ratio_value(target),
            'baseline': convert_to_json_ratio_value(baseline),
            'in_need': convert_to_json_ratio_value(in_need),
            'content_object': objective_or_activity,
            'blueprint': blueprint,
        }

        reportable, _ = Reportable.objects.update_or_create(
            external_id=attachment['id'],
            external_source=EXTERNAL_DATA_SOURCES.HPC,
            defaults={k: v for k, v in defaults.items() if v}
        )

        try:
            locations = save_location_list(
                attachment['attachmentVersion']['value']['metrics']['values']['disaggregated']['locations'],
                "indicator"
            )
            logger.debug('Saving {} locations for {}'.format(
                len(locations), reportable
            ))

            for location in locations:
                ReportableLocationGoal.objects.get_or_create(
                    reportable=reportable,
                    location=location
                )

            objective_or_activity.locations.add(*locations)
            for disaggregation in save_disaggregations(
                disaggregated.get('categories', []), response_plan=objective_or_activity.cluster.response_plan
            ):
                reportable.disaggregations.through.objects.get_or_create(
                    reportable_id=reportable.id,
                    disaggregation_id=disaggregation.id
                )
        except (KeyError, TypeError, AttributeError):
            logger.warning('No location info found for {}'.format(reportable))

        reportables.append(reportable)

    objective_or_activity.reportables.add(*reportables)


def get_disaggregation_category_to_group_map():
    source_url = HPC_V2_ROOT_URL + 'disaggregation-category-group'
    group_category_list = get_json_from_url(source_url)['data']

    mapping = {}

    for group in group_category_list:
        for category in group['disaggregationCategories']:
            mapping[category['id']] = group

    return mapping
