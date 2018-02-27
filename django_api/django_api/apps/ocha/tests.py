import json
import os
from django.test import TestCase
from django.conf import settings

from ocha.import_serializers import PartnerProjectImportSerializer

SAMPLES_DIR = os.path.join(settings.APPS_DIR, 'ocha', 'samples')


class PartnerProjectSerializerTest(TestCase):

    def test_empty_organizations(self):
        with open(os.path.join(SAMPLES_DIR, 'V2_project_info.json')) as sample_file:
            external_project_data = json.load(sample_file)['data']
        external_project_data.pop('organizations')
        serializer = PartnerProjectImportSerializer(data=external_project_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('organizations', serializer.errors)

    def test_load_data(self):
        with open(os.path.join(SAMPLES_DIR, 'V2_project_info.json')) as sample_file:
            external_project_data = json.load(sample_file)['data']
        serializer = PartnerProjectImportSerializer(data=external_project_data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        partner_project = serializer.save()
        self.assertEqual(partner_project.title, external_project_data['name'].strip())
