from unittest.mock import Mock, patch

from django.contrib.admin.sites import AdminSite
from django.contrib.auth import get_user_model
from django.test import RequestFactory, TestCase

from etools_prp.apps.core.admin import LocationAdmin
from etools_prp.apps.core.models import Location, Workspace
from etools_prp.apps.core.tests.factories import LocationFactory, WorkspaceFactory


User = get_user_model()


class TestLocationAdminBulkDelete(TestCase):
    """Test async bulk delete functionality for LocationAdmin"""

    def setUp(self):
        self.site = AdminSite()
        self.admin = LocationAdmin(Location, self.site)
        self.factory = RequestFactory()
        self.user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        self.workspace = WorkspaceFactory()

    def test_small_bulk_delete_synchronous(self):
        """Test that small deletions (< 10) are handled synchronously"""
        # Create 5 locations
        locations = [LocationFactory() for _ in range(5)]
        queryset = Location.objects.filter(id__in=[loc.id for loc in locations])
        
        request = self.factory.post('/admin/core/location/')
        request.user = self.user
        request._messages = Mock()
        
        # Delete queryset
        self.admin.delete_queryset(request, queryset)
        
        # Verify locations are deleted
        self.assertEqual(Location.objects.filter(id__in=[loc.id for loc in locations]).count(), 0)

    @patch('etools_prp.apps.core.admin.bulk_delete_locations')
    def test_large_bulk_delete_async(self, mock_task):
        """Test that large deletions (>= 10) are handled asynchronously"""
        # Create 15 locations
        locations = [LocationFactory() for _ in range(15)]
        location_ids = [loc.id for loc in locations]
        queryset = Location.objects.filter(id__in=location_ids)
        
        request = self.factory.post('/admin/core/location/')
        request.user = self.user
        request._messages = Mock()
        
        # Mock the delay method
        mock_task.delay = Mock()
        
        # Delete queryset
        self.admin.delete_queryset(request, queryset)
        
        # Verify async task was called
        mock_task.delay.assert_called_once()
        call_args = mock_task.delay.call_args[0][0]
        self.assertEqual(len(call_args), 15)
        self.assertTrue(all(loc_id in call_args for loc_id in location_ids))

