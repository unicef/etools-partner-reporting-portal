import logging

from django.db import IntegrityError

from carto.auth import APIKeyAuthClient
from carto.sql import SQLClient
from carto.exceptions import CartoException

from core.celery import app, FaultTolerantTask
from core.models import Location

logger = logging.getLogger('core.cartodb')


def get_carto_client(api_key, base_url):
    """
    Returns APIKeyAuthClient object for CartoDB Python SDK.

    Parameters:
    - api_key: string
    - base_url: string
    """
    return APIKeyAuthClient(api_key=api_key, base_url=base_url)


def create_location(pcode,
                    carto_table,
                    parent_instance,
                    site_name,
                    row,
                    num_not_added,
                    num_created,
                    num_updated):
    try:
        location = Location.objects.get(p_code=pcode)

    except Location.MultipleObjectsReturned:
        logger.warning("Multiple locations found for: {}, {} ({})".format(
            carto_table.location_type, site_name, pcode
        ))
        num_not_added += 1
        return False, num_not_added, num_created, num_updated

    except Location.DoesNotExist:
        # try to create the location
        create_args = {
            'p_code': pcode,
            'gateway': carto_table.location_type,
            'title': site_name,
            'carto_db_table': carto_table,
        }

        if parent_instance:
            create_args['parent'] = parent_instance

        if not row['the_geom']:
            return False, num_not_added, num_created, num_updated

        if 'Point' in row['the_geom']:
            create_args['point'] = row['the_geom']
        else:
            create_args['geom'] = row['the_geom']

        num_created += 1

        try:
            loc = Location.objects.create(**create_args)

        except IntegrityError as e:
            logger.info('Not Added: {}'.format(str(e)))
        else:
            logger.info('{}: {} ({})'.format(
                'Added',
                loc.title,
                carto_table.location_type.name
            ))

        return True, num_not_added, num_created, num_updated

    else:
        # names can be updated for existing locations with the same code
        location.title = site_name

        if not row['the_geom']:
            return False, num_not_added, num_created, num_updated

        if 'Point' in row['the_geom']:
            location.point = row['the_geom']

        else:
            location.geom = row['the_geom']

        try:
            location.save()

        except IntegrityError as e:
            logger.exception(
                'Error whilst saving location: {}'.format(site_name))
            return False, num_not_added, num_created, num_updated

        num_updated += 1

        logger.info('{}: {} ({})'.format(
            'Updated',
            location.title,
            carto_table.location_type.name
        ))

        return True, num_not_added, num_created, num_updated


@app.task(base=FaultTolerantTask)
def update_sites_from_cartodb(carto_table):
    """
    Creates or Retrieve Location objects based on
    given CartoDBTable model object.

    Parameters:
    - carto_table: CartoDBTable model object
    """
    client = get_carto_client(
        carto_table.api_key,
        carto_table.domain)

    sql = SQLClient(client)

    num_created = num_updated = num_not_added = 0

    try:
        # query for cartodb
        qry = 'select st_AsGeoJSON(the_geom) as the_geom,'

        if carto_table.parent:
            qry += ' name, pcode, parent_pcode from {}'.format(
                carto_table.table_name)

        else:
            qry += ' name, pcode from {}'.format(
                carto_table.table_name)

        sites = sql.send(qry)

    except CartoException:
        logging.exception("Carto exception occured", exc_info=True)

    else:
        for row in sites['rows']:
            pcode = str(row['pcode']).strip()
            site_name = row['name']

            if not site_name or site_name.isspace():
                logger.warning(
                    "No name for location with PCode: {}".format(pcode))
                num_not_added += 1
                continue

            site_name = site_name.encode('UTF-8')

            parent_instance = None

            # attempt to reference the parent of this location
            if carto_table.parent:
                try:
                    parent_instance = Location.objects.get(
                        p_code=row['parent_pcode'])

                except Exception as exp:
                    msg = "{} locations found for parent code: {}"

                    if exp is Location.MultipleObjectsReturned:
                        msg = msg.format('Multiple', parent_instance.pcode)

                    else:
                        if parent_instance:
                            msg = msg.format('No', parent_instance.pcode)
                        else:
                            msg = msg.format('No', 'None')

                    logger.warning(msg)
                    num_not_added += 1
                    continue

            # create the actual location or retrieve existing based on type and
            # code
            succ, num_not_added, num_created, num_updated = create_location(
                pcode,
                carto_table,
                parent_instance,
                site_name,
                row,
                num_not_added,
                num_created,
                num_updated
            )

    return "Table name {}: {} created, {} updated, {} skipped".format(
        carto_table.table_name,
        num_created,
        num_updated,
        num_not_added
    )
