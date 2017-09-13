import logging

from django.db import IntegrityError

from carto.auth import APIKeyAuthClient
from carto.sql import SQLClient
from carto.exceptions import CartoException

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
                    sites_not_added,
                    sites_created,
                    sites_updated):
    try:
        location = Location.objects.get(p_code=pcode)

    except Location.MultipleObjectsReturned:
        logger.warning("Multiple locations found for: {}, {} ({})".format(
            carto_table.location_type, site_name, pcode
        ))
        sites_not_added += 1
        return False, sites_not_added, sites_created, sites_updated

    except Location.DoesNotExist:
        # try to create the location
        create_args = {
            'p_code': pcode,
            'gateway': carto_table.location_type,
            'name': site_name
        }

        if parent_instance:
            create_args['parent'] = parent_instance

        if not row['the_geom']:
            return False, sites_not_added, sites_created, sites_updated

        if 'Point' in row['the_geom']:
            create_args['point'] = row['the_geom']
        else:
            create_args['geom'] = row['the_geom']

        sites_created += 1

        try:
            location = Location.objects.create(**create_args)

        except IntegrityError as e:
            logger.info('Not Added: {}', e)

        logger.info('{}: {} ({})'.format(
            'Added',
            location.name,
            carto_table.location_type.name
        ))

        return True, sites_not_added, sites_created, sites_updated

    else:
        # names can be updated for existing locations with the same code
        location.name = site_name

        if not row['the_geom']:
            return False, sites_not_added, sites_created, sites_updated

        if 'Point' in row['the_geom']:
            location.point = row['the_geom']

        else:
            location.geom = row['the_geom']

        try:
            location.save()

        except IntegrityError as e:
            logger.exception(
                'Error whilst saving location: {}'.format(site_name))
            return False, sites_not_added, sites_created, sites_updated

        sites_updated += 1

        logger.info('{}: {} ({})'.format(
            'Updated',
            location.name,
            carto_table.location_type.name
        ))

        return True, sites_not_added, sites_created, sites_updated


def update_sites_from_cartodb(carto_table):
    """
    Creates or Retrieve Location objects based on
    given CartoDBTable model object.

    Parameters:
    - carto_table: CartoDBTable model object
    """
    client = get_carto_client(
        carto_table.api_key,
        carto_table.domain,
        carto_table.username)

    sql = SQLClient(client)

    sites_created = sites_updated = sites_not_added = 0

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
                sites_not_added += 1
                continue

            site_name = site_name.encode('UTF-8')

            parent_instance = None

            # attempt to reference the parent of this location
            if carto_table.parent:
                try:
                    parent_instance = Location.objects.get(
                        p_code=carto_table.parent.pcode)

                except Exception as exp:
                    msg = ""

                    if exp is parent_instance.MultipleObjectsReturned:
                        msg = "{} locations found for parent code: {}".format(
                            'Multiple' if exp is parent_instance.MultipleObjectsReturned else 'No',
                            parent_instance.pcode
                        )

                    else:
                        msg = exp.message

                    logger.warning(msg)
                    sites_not_added += 1
                    continue

            # create the actual location or retrieve existing based on type and
            # code
            succ, sites_not_added, sites_created, sites_updated = create_location(
                pcode,
                carto_table,
                parent_instance,
                site_name,
                row,
                sites_not_added,
                sites_created,
                sites_updated
            )

    return "Table name {}: {} sites created, {} sites updated, {} sites skipped".format(
        carto_table.table_name,
        sites_created,
        sites_updated,
        sites_not_added
    )
