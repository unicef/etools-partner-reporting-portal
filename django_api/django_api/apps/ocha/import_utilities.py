import logging

import requests
from requests.status_codes import codes

from ocha.constants import HPC_V2_ROOT_URL, HPC_V1_ROOT_URL
from ocha.import_serializers import V2PartnerProjectImportSerializer, V1FundingSourceImportSerializer


logger = logging.getLogger('ocha-sync')


class OCHAImportException(Exception):
    pass


def get_json_from_url(url):
    response = requests.get(url)
    if not response.status_code == codes.ok:
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
