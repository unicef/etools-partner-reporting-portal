import json
from unittest.mock import call, MagicMock, patch

from django.db import IntegrityError
from django.test import TestCase

from etools_prp.apps.core.locations_sync import EToolsLocationSynchronizer
from etools_prp.apps.core.tests import factories


class TestEToolsLocationSynchronizer(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.workspace = factories.WorkspaceFactory(business_area_code="ABC123")
        cls.parent_loc = factories.LocationFactory(p_code='000')
        cls.parent_loc.workspaces.add(cls.workspace)
        cls.existing_loc = factories.LocationFactory(
            p_code='001', name='Existing Location', admin_level=1, parent=cls.parent_loc)
        cls.existing_loc.workspaces.add(cls.workspace)

        cls.fake_polygon = json.loads(factories.create_fake_multipolygon().geojson)

        cls.synchronizer = EToolsLocationSynchronizer(pk=cls.workspace.pk)

    @patch('etools_prp.apps.core.locations_sync.logger')
    def test_create_update_locations(self, mock_logger):
        # Mock data for testing
        list_data = [
            {
                'p_code': '001',
                'name': 'Existing Location',
                'point': 'POINT(0 0)',
                "geom": self.fake_polygon,
                'parent_p_code': '000',
                'admin_level': 1,
                'admin_level_name': 'Level 1',
                'id': 1
            },
            {
                'p_code': '0001',
                'name': 'Location 1',
                'point': 'POINT(0 0)',
                "geom": self.fake_polygon,
                'parent_p_code': '000',
                'admin_level': 1,
                'admin_level_name': 'Level 1',
                'id': 2
            },
            {
                'p_code': '1001',
                'name': None,
                'point': None,
                "geom": self.fake_polygon,
                'parent_p_code': '000',
                'admin_level': 1,
                'admin_level_name': 'Level 1',
                'id': 3
            }
        ]
        new, updated, skipped, error = self.synchronizer.create_update_locations(list_data)

        self.assertEqual(new, 1)  # 1 new locations should be created p_code 0001
        self.assertEqual(updated, 1)  # One location should be updated
        self.assertEqual(skipped, 1)  # One location should be skipped due to missing name
        self.assertEqual(error, 0)  # No errors expected
        first_call = mock_logger.info.call_args_list[0]
        self.assertEqual(first_call, call("Skipping row pcode 1001"))

    @patch('etools_prp.apps.core.locations_sync.get_location_model')
    @patch('etools_prp.apps.core.locations_sync.logger')
    def test_create_update_locations_integrity_error(self, mock_logger, mock_get_location_model):
        # Mock data for testing
        list_data = [
            {
                'p_code': '001',
                'name': 'Existing Location',
                'point': 'POINT(0 0)',
                "geom": self.fake_polygon,
                'parent_p_code': '000',
                'admin_level': 1,
                'admin_level_name': 'Level 1',
                'id': 1
            }
        ]

        # Mock bulk_update to raise IntegrityError
        mock_get_location_model.return_value.objects.bulk_update.side_effect = IntegrityError("Duplicate entry")

        # Call the method and expect an exception
        with self.assertRaises(IntegrityError):
            self.synchronizer.create_update_locations(list_data)

        # Verify logger was called
        mock_logger.exception.assert_called_with("Duplicates found on update")

    @patch('etools_prp.apps.core.locations_sync.PMP_API')
    @patch('etools_prp.apps.core.locations_sync.logger')
    def test_sync(self, mock_logger, mock_pmp_api):
        # Mock API response
        mock_api_instance = MagicMock()
        mock_api_instance.get_locations.return_value = {
            'results': [
                {
                    'p_code': '2001',
                    'name': 'Location 21',
                    'point': 'POINT(0 0)',
                    "geom": self.fake_polygon,
                    'parent_p_code': '000',
                    'admin_level': 2,
                    'admin_level_name': 'Level 1',
                    'id': 1
                }
            ],
            'next': None
        }
        mock_pmp_api.return_value = mock_api_instance

        self.synchronizer.sync()

        first_call = mock_api_instance.get_locations.call_args_list[0]
        first_call.assert_called_with(
            business_area_code=str(self.workspace.business_area_code),
            admin_level=0,
            url=None
        )
        # The api is called 10 times for each admin level between 0-9, each call being mock,
        # it creates 1 obj and update it 9 times
        status_logger = mock_logger.info.call_args_list[-3]
        self.assertEqual(
            status_logger,
            call("Etools Location sync status: {'new': 1, 'updated': 9, 'skipped': 0, 'error': 0}")
        )
        mock_logger.info.assert_called_with("Rebuilt")
