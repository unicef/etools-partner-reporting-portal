import json
import os
from django.test import TestCase
from django.conf import settings

from ocha.import_serializers import V2PartnerProjectImportSerializer, V1FundingSourceImportSerializer

SAMPLES_DIR = os.path.join(settings.APPS_DIR, 'ocha', 'samples')


class V2PartnerProjectSerializerTest(TestCase):

    def test_empty_organizations(self):
        with open(os.path.join(SAMPLES_DIR, 'V2_project_info.json')) as sample_file:
            external_project_data = json.load(sample_file)['data']
        external_project_data.pop('organizations')
        serializer = V2PartnerProjectImportSerializer(data=external_project_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('organizations', serializer.errors)

    def test_load_data(self):
        with open(os.path.join(SAMPLES_DIR, 'V2_project_info.json')) as sample_file:
            external_project_data = json.load(sample_file)['data']
        serializer = V2PartnerProjectImportSerializer(data=external_project_data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        partner_project = serializer.save()
        self.assertEqual(partner_project.title, external_project_data['name'].strip())
        self.assertEqual(partner_project.code, external_project_data['code'].strip())

        with open(os.path.join(SAMPLES_DIR, 'V1_cash_flow.json')) as sample_file:
            external_project_data = json.load(sample_file)['data']
        serializer = V1FundingSourceImportSerializer(data=external_project_data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        funding_source = serializer.save()
        self.assertIsNotNone(funding_source)
