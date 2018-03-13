import aiohttp
import asyncio

from ocha.constants import HPC_V1_ROOT_URL


def fill_cluster_names_for_plan_list(plan_list):
    loop = asyncio.get_event_loop()
    client = aiohttp.ClientSession(loop=loop)

    async def get_json(client, url):
        async with client.get(url) as response:
            return await response.json()

    urls_to_retrieve = [
        HPC_V1_ROOT_URL + 'rpm/plan/id/{}?content=entities'.format(plan['id']) for plan in plan_list
    ]

    results = loop.run_until_complete(
        asyncio.gather(
            *[get_json(client, e) for e in urls_to_retrieve]
        )
    )
    plan_details = {}

    for result in results:
        plan_details[result['data']['id']] = result['data']

    for plan in plan_list:
        details = plan_details[plan['id']]
        if 'governingEntities' in details:
            cluster_names = [
                ge['name'] for ge in details['governingEntities'] if ge['entityPrototype']['refCode'] == 'CL'
            ]
        else:
            cluster_names = []

        plan['clusterNames'] = cluster_names
