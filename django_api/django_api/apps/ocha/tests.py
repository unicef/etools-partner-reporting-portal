import json
import os
from django.test import TestCase
from django.conf import settings

from ocha.import_serializers import V2PartnerProjectImportSerializer, V1FundingSourceImportSerializer, \
    V1ResponsePlanImportSerializer

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


class V1ResponsePlanImportSerializerTest(TestCase):

    def test_multi_country_emergency_data(self):
        with open(os.path.join(SAMPLES_DIR, 'V1_response_plan.json')) as sample_file:
            response_plan_data = json.load(sample_file)['data']
        serializer = V1ResponsePlanImportSerializer(data=response_plan_data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        response_plan = serializer.save()
        self.assertEqual(response_plan.title, 'Syria regional refugee and resilience plan (3RP) 2016')
        self.assertEqual(
            len(response_plan_data['locations']),
            response_plan.workspace.countries.count()
        )
        self.assertEqual(response_plan.workspace.title, 'Syrian Arab Republic - Civil Unrest (from 2012)')
        self.assertEqual(
            len(response_plan_data['governingEntities']),
            response_plan.clusters.count()
        )

    def test_single_country_emergency_data(self):
        with open(os.path.join(SAMPLES_DIR, 'V1_response_plan_single_country.json')) as sample_file:
            response_plan_data = json.load(sample_file)['data']
        serializer = V1ResponsePlanImportSerializer(data=response_plan_data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        response_plan = serializer.save()
        self.assertEqual(response_plan.title, 'occupied Palestinian territory 2016')
        self.assertEqual(
            len(response_plan_data['locations']),
            response_plan.workspace.countries.count()
        )
        self.assertEqual(response_plan.workspace.title, 'occupied Palestinian territory')
        self.assertEqual(
            len(response_plan_data['governingEntities']),
            response_plan.clusters.count()
        )

    def test_my_import(self):
        from ocha.import_utilities import import_response_plan
        print(import_response_plan(504))
