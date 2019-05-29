import logging

from celery import shared_task

from cluster.models import Cluster
from core.common import EXTERNAL_DATA_SOURCES, CLUSTER_TYPES
from core.models import ResponsePlan
from ocha.constants import HPC_V1_ROOT_URL, HPC_V2_ROOT_URL
from ocha.imports.serializers import V1FundingSourceImportSerializer
from ocha.imports.utilities import get_json_from_url, save_location_list
from ocha.imports.response_plan import import_response_plan, save_activities_and_objectives_for_response_plan
from ocha.imports.project import import_project_details
from partner.models import PartnerProject, Partner

logger = logging.getLogger('ocha-sync')


@shared_task
def finish_response_plan_import(external_plan_id):
    source_url = HPC_V1_ROOT_URL + 'rpm/plan/id/{}?format=json&content=entities'.format(external_plan_id)
    plan_data = get_json_from_url(source_url)['data']
    save_location_list(plan_data.get('locations', []), save_children=True)

    strategic_objectives_url = HPC_V1_ROOT_URL + 'rpm/plan/id/{}?format=json&content=measurements'.format(
        external_plan_id
    )
    strategic_objectives_data = get_json_from_url(strategic_objectives_url)['data']

    logger.debug('Importing Cluster Objectives and Activities for Response Plan #{}'.format(external_plan_id))
    save_activities_and_objectives_for_response_plan(
        entities_response=plan_data, measurements_response=strategic_objectives_data
    )


@shared_task
def sync_partners(area):
    source_url = HPC_V1_ROOT_URL + 'organization'
    org_data = get_json_from_url(source_url)['data']

    # Prepare OCHA data dict
    orgs_dict = dict()
    for org in org_data:
        orgs_dict[str.upper(org['name'])] = org['id']
        if org['abbreviation']:
            orgs_dict[str.upper(org['abbreviation'])] = org['id']

    # Iterate over stored Partners and try assign proper organization id
    partners = Partner.objects.filter(country_code=area) if area else Partner.objects.all()
    for partner in partners:
        if str.upper(partner.title) in orgs_dict:
            # We have a match. Check if this is 1:1 match
            logger.debug('Match found for {}'.format(partner.title))
            if partners.filter(title=partner.title).count() == 1:
                logger.debug('Assigned OCHA external ID: {}'.format(orgs_dict[partner.title]))
                partner.ocha_external_id = orgs_dict[partner.title]
                partner.save()
            else:
                logger.debug('SKIPPING. Found more then one entity of {}'.format(partner.title))


@shared_task
def finish_partner_project_import(project_id, response_plan_id=None):
    project = PartnerProject.objects.get(pk=project_id)
    external_project_id = project.external_id

    source_url = HPC_V2_ROOT_URL + 'project/{}'.format(external_project_id)
    project_data = get_json_from_url(source_url)

    if not project_data:
        logger.warning('No project V2 data found for project_id: {}. Using V1 data'.format(external_project_id))
        return

    funding_url = HPC_V1_ROOT_URL + 'fts/flow?projectId={}'.format(external_project_id)
    funding_data = get_json_from_url(funding_url)

    try:
        funding_serializer = V1FundingSourceImportSerializer(data=funding_data['data'])
        funding_serializer.is_valid(raise_exception=True)
        funding_serializer.save()
    except Exception:
        logger.warning('No funding data found for project_id: {}'.format(external_project_id))

    clusters = []
    if not response_plan_id:
        for plan in project_data['data']['plans']:
            if not ResponsePlan.objects.filter(
                external_source=EXTERNAL_DATA_SOURCES.HPC, external_id=plan['id']
            ).exists():
                import_response_plan(plan['id'])
    else:
        response_plan = ResponsePlan.objects.get(pk=response_plan_id)
        for global_cluster_data in project_data['data']['globalClusters']:
            # Don't save external_id for global clusters - it won't pass unique constraint
            cluster, _ = Cluster.objects.get_or_create(
                external_source=EXTERNAL_DATA_SOURCES.HPC,
                type=CLUSTER_TYPES.imported,
                imported_type=global_cluster_data['name'],
                response_plan=response_plan,
            )
            clusters.append(cluster)

    project_cluster_ids = [c['id'] for c in project_data['data']['governingEntities'] if c['entityPrototypeId'] == 9]

    # At this point all clusters should be in DB
    clusters.extend(list(Cluster.objects.filter(
        external_source=EXTERNAL_DATA_SOURCES.HPC,
        external_id__in=project_cluster_ids,
    )))
    logger.debug('Adding {} clusters to project {} and it\'s partner.'.format(
        len(clusters), project
    ))
    project.clusters.add(*clusters)
    project.partner.clusters.add(*clusters)
    import_project_details(project, project_data['data']['currentPublishedVersionId'])
