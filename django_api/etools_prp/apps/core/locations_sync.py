import logging
from datetime import datetime

from django.db import IntegrityError, transaction
from django.db.models import F, Value
from django.db.models.functions import Concat

from carto.exceptions import CartoException
from celery.utils.log import get_task_logger
from unicef_locations.exceptions import InvalidRemap
from unicef_locations.synchronizers import LocationSynchronizer
from unicef_locations.utils import get_location_model

from etools_prp.apps.core.api import PMP_API
from etools_prp.apps.core.common import EXTERNAL_DATA_SOURCES
from etools_prp.apps.core.models import Workspace
from etools_prp.apps.utils.query import has_related_records

logger = get_task_logger(__name__)


class PRPLocationSynchronizer(LocationSynchronizer):
    """eTools version of synchronizer with use the VisionSyncLog to store log execution"""

    def __init__(self, pk) -> None:
        super().__init__(pk)
        self.workspace = Workspace.objects.get(title__iexact=self.carto.display_name.partition("_")[0])
        self.qs = get_location_model().objects.filter(workspaces=self.workspace)

    def apply_remap(self, old2new):
        """
        Use remap table to swap p-codes
        """
        logging.info('Apply Remap')
        for old, new in old2new.items():
            if old != new:
                try:
                    old_location = self.qs.get(p_code=old, is_active=True)
                except get_location_model().DoesNotExist:
                    raise InvalidRemap(f'Old location {old} does not exist or is not active')
                except get_location_model().MultipleObjectsReturned:
                    locs = ', '.join([loc.name for loc in self.qs.filter(p_code=old)])
                    raise InvalidRemap(f'Multiple active Location exist for pcode {old}: {locs}')
                old_location.p_code = new
                old_location.save()
                logger.info(f'Update through remapping {old} -> {new}')

    def create_or_update_locations(self, batch_size=500):
        """
        Create or update locations based on p-code (only active locations are considerate)

        """
        logging.info('Create/Update new locations')
        rows = self.get_cartodb_locations()
        new, updated, skipped, error = 0, 0, 0, 0
        logging.info(f'Total Rows {len(rows)}')
        logging.info(f'Batch size {batch_size}')
        for idx in range(0, len(rows), batch_size):
            batch = rows[idx:idx + batch_size]
            logging.info(f'processing batch {idx+1}')
            batch = list(batch)
            indexed_batch = {str(item[self.carto.pcode_col]): item for item in batch}
            # first get all the pcodes intended to be updated from the rows
            all_new_pcodes = [r[self.carto.pcode_col] for r in batch]
            # get all records that exist for these pcodes that will need to be adjusted
            existing_loc_qs = self.qs.filter(p_code__in=all_new_pcodes, is_active=True)
            # from batch keep all rows that are new
            rows_to_create = [row for row in batch if row[self.carto.pcode_col]
                              not in existing_loc_qs.values_list("p_code", flat=True)]

            # get_all_parents and map them by p_code:
            parent_pcodes = []
            for row in batch:
                parent_pcode = row[self.carto.parent_code_col] if self.carto.parent_code_col in row else None
                if parent_pcode:
                    parent_pcodes.append(row[self.carto.parent_code_col])
            parents_qs = self.qs.filter(p_code__in=parent_pcodes, is_active=True)
            # parent location dict {pcode: item}
            parents = {r.p_code: r for r in parents_qs.all()}

            # make a list of tuples (row_from_carto, existing_location_object) to iterate over and update
            update_tuples = [(indexed_batch[loc.p_code], loc) for loc in existing_loc_qs.all()]
            locs_to_update = []
            for row, existing_loc in update_tuples:
                pcode = row[self.carto.pcode_col]
                name = row[self.carto.name_col]
                geom = row['the_geom']
                parent_code = row[self.carto.parent_code_col] if self.carto.parent_code_col in row else None
                if all([name, pcode, geom]):
                    geom_key = 'point' if 'Point' in geom else 'geom'
                    existing_loc.admin_level = self.carto.admin_level
                    existing_loc.admin_level_name = self.carto.admin_level_name
                    existing_loc.name = name
                    existing_loc.parent = parents.get(parent_code, None) if parent_code else None
                    setattr(existing_loc, geom_key, geom)
                    locs_to_update.append(existing_loc)
                    updated += 1
                else:
                    skipped += 1
                    logger.info(f"Skipping row pcode {pcode}")

            locs_to_create = []
            for row in rows_to_create:
                pcode = row[self.carto.pcode_col]
                name = row[self.carto.name_col]
                geom = row['the_geom']
                parent_code = row[self.carto.parent_code_col] if self.carto.parent_code_col in row else None
                geom_key = 'point' if 'Point' in geom else 'geom'
                if all([name, pcode, geom]):
                    values = {
                        'p_code': pcode,
                        'is_active': True,
                        'admin_level': self.carto.admin_level,
                        'admin_level_name': self.carto.admin_level_name,
                        'name': name,
                        geom_key: geom,
                        'parent': parents.get(parent_code, None) if parent_code else None
                    }
                    # set everything to 0 in the tree, we'll rebuild later
                    for key in ['lft', 'rght', 'level', 'tree_id']:
                        values[key] = 0
                    new_rec = get_location_model()(**values)
                    locs_to_create.append(new_rec)
                    new += 1
                else:
                    skipped += 1
                    logger.info(f"Skipping row pcode {pcode}")

            # update the records:
            try:
                get_location_model().objects.bulk_update(locs_to_update, fields=['p_code', 'is_active', 'admin_level',
                                                                                 'admin_level_name', 'name',
                                                                                 'geom', 'point', 'parent'])
            except IntegrityError as e:
                message = "Duplicates found on update"
                logger.exception(e)
                logger.exception(message)
                raise CartoException(message)

            try:
                newly_created = get_location_model().objects.bulk_create(locs_to_create)
            except IntegrityError as e:
                message = "Duplicates found on create"
                logger.exception(e)
                logger.exception(message)
                raise CartoException(message)
            else:
                for loc in newly_created:
                    loc.workspaces.add(self.workspace)

        logger.info("Rebuilding the tree, have patience -deferred for now. done separately")
        # get_location_model().objects.rebuild()
        # logger.info("Rebuilt")
        return new, updated, skipped, error

    def clean_upper_level(self):
        """
        Check upper level active locations with no reference
        - delete if is leaf
        - deactivate if all children are inactive (doesn't exist an active child)
        """
        logging.info('Clean upper level')
        qs = self.qs.filter(admin_level=self.carto.admin_level - 1, is_active=False)
        number_of_inactive_parents = qs.count()
        # by default has_related_records excludes self.
        # so we need to make sure that the locations have no children (only leaves)
        qs = qs.filter(children__isnull=True)
        has_related, affected = has_related_records(qs, get_location_model(), model_relations_to_ignore=[Workspace])
        # exclude all locations in use
        qs = qs.exclude(pk__in=affected)
        logging.info(f'deleting {qs.count()} records out of {number_of_inactive_parents} inactive locs')
        qs.delete()
        logging.info('Parents are now gone!')

    def handle_obsolete_locations(self, to_deactivate):
        """
        Handle obsolete locations:
        - deactivate referenced locations
        - delete non referenced locations
        """
        logging.info('Clean Obsolete Locations')
        loc_qs = self.qs.filter(p_code__in=to_deactivate)

        # then instead of using collector to chase cascading or other relations use helper
        has_related, affected = has_related_records(loc_qs, get_location_model(), model_relations_to_ignore=[Workspace])
        logger.info(f'Deactivating {affected}')
        if has_related:
            loc_qs.filter(pk__in=affected).update(is_active=False,
                                                  name=Concat(F("name"),
                                                              Value(f" [{datetime.today().strftime('%Y-%m-%d')}]")))
            logger.info('Deleting the rest')
        else:
            logger.info('Deleting all')
        # won't be able to delete the ones with children if the children are somehow related. our check does not
        # look for nested relations to self.
        # update all child locations for the "obsolete locations", leave them orphan; - with the understanding that
        # all previous parent relationships are stored in a separate db for reference or remapped adequately
        # on subsequent children updates.
        get_location_model().objects.filter(parent__in=loc_qs).update(parent=None)
        loc_qs.exclude(pk__in=affected).delete()


class EToolsLocationSynchronizer:
    """eTools Locations synchronizer for a given workspace"""

    def __init__(self, pk) -> None:
        self.workspace = Workspace.objects.get(pk=pk)
        self.qs = get_location_model().objects.filter(workspaces=self.workspace)

    @transaction.atomic
    def create_update_locations(self, list_data):
        new, updated, skipped, error = 0, 0, 0, 0
        indexed_batch = {str(item['p_code']): item for item in list_data}

        etools_pcodes = [loc['p_code'] for loc in list_data]
        existing_loc_qs = self.qs.filter(p_code__in=etools_pcodes, is_active=True)

        # get_all_parents and map them by p_code:
        parent_pcodes = [loc['parent_p_code'] for loc in list_data]
        parents_qs = self.qs.filter(p_code__in=parent_pcodes, is_active=True)
        # parent location dict {pcode: parent obj}
        parents = {r.p_code: r for r in parents_qs.all()}

        # make a list of tuples (row_from_carto, existing_location_object) to iterate over and update
        update_tuples = [(indexed_batch[loc.p_code], loc) for loc in existing_loc_qs.all()]
        locs_to_update = []
        for etools_loc, existing_loc in update_tuples:
            pcode = etools_loc['p_code']
            name = etools_loc['name']
            point = etools_loc['point'].__str__() if etools_loc['point'] else None
            geom = etools_loc['geom'].__str__() if etools_loc['geom'] else None
            parent_code = etools_loc['parent_p_code']
            if all([name, pcode, geom]):
                existing_loc.admin_level = etools_loc['admin_level']
                existing_loc.admin_level_name = etools_loc['admin_level_name']
                existing_loc.name = name
                existing_loc.parent = parents.get(parent_code, None) if parent_code else None
                existing_loc.geom = geom
                existing_loc.point = point
                locs_to_update.append(existing_loc)
                updated += 1
            else:
                skipped += 1
                logger.info(f"Skipping row pcode {pcode}")

        locs_to_create = [loc for loc in list_data if loc["p_code"] not in existing_loc_qs.values_list("p_code", flat=True)]
        locs_bulk_create = []
        for loc in locs_to_create:
            p_code = loc['p_code']
            name = loc['name']
            point = loc['point'].__str__() if loc['point'] else None
            geom = loc['geom'].__str__() if loc['geom'] else None
            parent_code = loc['parent_p_code']
            if all([name, p_code, geom]):
                values = {
                    'external_id': loc['id'],
                    'external_source': EXTERNAL_DATA_SOURCES.ETOOLS,
                    'p_code': p_code,
                    'is_active': True,
                    'admin_level': loc['admin_level'],
                    'admin_level_name': loc['admin_level_name'],
                    'name': name,
                    'geom': geom,
                    'point': point,
                    'parent': parents.get(parent_code, None) if parent_code else None
                }
                # set everything to 0 in the tree, we'll rebuild later
                for key in ['lft', 'rght', 'level', 'tree_id']:
                    values[key] = 0
                new_rec = get_location_model()(**values)
                locs_bulk_create.append(new_rec)
                new += 1
            else:
                skipped += 1
                logger.info(f"Skipping row pcode {p_code}")

        # update the records:
        try:
            get_location_model().objects.bulk_update(locs_to_update, fields=['p_code', 'is_active', 'admin_level',
                                                                             'admin_level_name', 'name',
                                                                             'geom', 'point', 'parent'])
        except IntegrityError as e:
            message = "Duplicates found on update"
            logger.exception(e)
            logger.exception(message)
            raise

        try:
            newly_created = get_location_model().objects.bulk_create(locs_bulk_create)
        except IntegrityError as e:
            message = "Duplicates found on create"
            logger.exception(e)
            logger.exception(message)
            raise
        else:
            for loc in newly_created:
                loc.workspaces.add(self.workspace)

        logger.info("Rebuilding the tree....")
        get_location_model().objects.rebuild()
        logger.info("Rebuilt")
        return new, updated, skipped, error

    def sync(self):
        api = PMP_API()
        status = {
            'new': 0,
            'updated': 0,
            'skipped': 0,
            'error': 0
        }
        try:
            for admin_level in range(0, 10):
                page_url = None
                has_next = True
                while has_next:
                    try:
                        list_data = api.get_locations(
                            business_area_code=str(self.workspace.business_area_code),
                            admin_level=admin_level,
                            url=page_url, limit=50
                        )
                        if list_data['results']:
                            new, updated, skipped, error = self.create_update_locations(list_data['results'])
                            status['new'] += new
                            status['updated'] += updated
                            status['skipped'] += skipped
                            status['error'] += error
                    except Exception as e:
                        logging.exception("API Endpoint error: %s" % e)
                        break
                    if list_data['next']:
                        logging.info("Found new page")
                        page_url = list_data['next']
                        has_next = True
                    else:
                        logging.info("End of workspace")
                        has_next = False
        except Exception as e:
            logger.error(str(e))
            raise

        logging.info(f'Etools Location sync status: {status}')
