import aiohttp
import asyncio
import greenlet

import itertools

from ocha.constants import HPC_V1_ROOT_URL
from . import utilities


def fetch_json_urls_async(url_list):
    data_list = list()
    current_thread = greenlet.getcurrent()

    @asyncio.coroutine
    async def get_json(url, greenlet_instance, future):
        async with aiohttp.ClientSession(headers=utilities.get_headers()) as session:
            async with session.get(url) as response:
                result = await response.json()
                future.set_result(result)
                greenlet_instance.switch()

    for url in url_list:
        future = asyncio.Future()
        asyncio.Task(get_json(url, current_thread, future))
        current_thread.parent.switch()

        data_list.append(future.result())

    return data_list


def get_response_plans_for_countries(iso3_codes):
    urls_to_retrieve = [
        HPC_V1_ROOT_URL + 'plan/country/{}'.format(iso3) for iso3 in iso3_codes
    ]

    results = fetch_json_urls_async(urls_to_retrieve)

    return list(itertools.chain.from_iterable([
        r['data'] for r in results
    ]))
