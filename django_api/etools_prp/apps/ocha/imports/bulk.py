import itertools

import requests

from etools_prp.apps.ocha.constants import HPC_V1_ROOT_URL

from . import utilities


def fetch_json_urls(url_list):
    data_list = list()

    def get_json(url):
        response = requests.get(url, headers=utilities.get_headers())
        return response.json()

    for url in url_list:
        result = get_json(url)
        data_list.append(result)

    return data_list


def get_response_plans_for_countries(iso3_codes):
    urls_to_retrieve = [
        HPC_V1_ROOT_URL + 'plan/country/{}'.format(iso3) for iso3 in iso3_codes
    ]

    results = fetch_json_urls(urls_to_retrieve)

    return list(itertools.chain.from_iterable([
        r['data'] for r in results
    ]))
