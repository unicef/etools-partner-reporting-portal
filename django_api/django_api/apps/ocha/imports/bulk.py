import aiohttp
import asyncio

import itertools

from ocha.constants import HPC_V1_ROOT_URL


def fetch_json_urls_async(url_list):
    loop = asyncio.get_event_loop()
    client = aiohttp.ClientSession(loop=loop)

    async def get_json(client, url):
        async with client.get(url) as response:
            return await response.json()

    data_list = loop.run_until_complete(
        asyncio.gather(
            *[get_json(client, url) for url in url_list]
        )
    )

    async def close_client():
        return await client.close()

    loop.run_until_complete(close_client())

    return data_list


def get_response_plans_for_countries(iso3_codes):
    urls_to_retrieve = [
        HPC_V1_ROOT_URL + 'plan/country/{}'.format(iso3) for iso3 in iso3_codes
    ]

    results = fetch_json_urls_async(urls_to_retrieve)

    return list(itertools.chain.from_iterable([
        r['data'] for r in results
    ]))
