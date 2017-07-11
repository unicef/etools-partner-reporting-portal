from django.urls import reverse
from rest_framework import status

from core.tests.base import BaseAPITestCase
from core.models import Location
from unicef.models import LowerLevelOutput, Section, ProgrammeDocument
from cluster.models import ClusterObjective
from indicator.models import Reportable, IndicatorReport, IndicatorLocationData, IndicatorBlueprint

from core.helpers import (
    get_cast_dictionary_keys_as_tuple,
)
from indicator.serializers import (
    IndicatorLocationDataUpdateSerializer
)
from indicator.models import (
    Reportable,
    IndicatorReport,
    IndicatorLocationData,
    Disaggregation,
    DisaggregationValue,
)

class TestPDReportsAPIView(BaseAPITestCase):
    generate_fake_data_quantity = 5

    def test_list_api(self):
        pd = ProgrammeDocument.objects.first()
        url = reverse('programme-document-reports', kwargs={'pd_id': pd.pk})
        response = self.client.get(url, format='json')

        self.assertTrue(status.is_success(response.status_code))

        pd = ProgrammeDocument.objects.get(pk=pd.id)
        pks = pd.reportable_queryset.values_list(
            'indicator_reports__pk', flat=True)

        first_ir = IndicatorReport.objects.filter(id__in=pks).first()
        filter_url = "%s?status=%s" % (
            url,
            first_ir.progress_report.get_status_display()
        )
        response = self.client.get(filter_url, format='json')
        self.assertTrue(status.is_success(response.status_code))

    def test_get_indicator_report(self):
        pd = ProgrammeDocument.objects.first()
        report_id = pd.reportable_queryset.values_list(
            'indicator_reports__pk', flat=True)[0]

        url = reverse('programme-document-reports-detail',
                      kwargs={'pd_id': pd.pk, 'report_id': report_id})
        response = self.client.get(url, format='json')
        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.data['id'], str(report_id))


class TestIndicatorListAPIView(BaseAPITestCase):
    generate_fake_data_quantity = 5

    def test_list_api(self):
        ir_id = IndicatorReport.objects.first().id
        url = reverse('indicator-data', kwargs={'ir_id': ir_id})
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)

        expected_reportable = Reportable.objects.filter(
            indicator_reports__id=ir_id,
            lower_level_outputs__isnull=False
        )
        self.assertEquals(
            len(response.data['outputs']),
            expected_reportable.count())

        expected_reportable_ids = expected_reportable.values_list(
            'id', flat=True)

        for resp_data in response.data['outputs']:
            self.assertTrue(resp_data['id'] in expected_reportable_ids)
            self.assertEquals(
                len(resp_data['indicator_reports']),
                expected_reportable.get(
                    lower_level_outputs__id=resp_data['llo_id']).indicator_reports.all().count()
            )

    def test_list_api_filter_by_locations(self):
        self.reports = Reportable.objects.filter(
            lower_level_outputs__reportables__isnull=False,
            locations__isnull=False
        ).distinct()

        location_ids = map(lambda item: str(
            item), self.reports.values_list('locations__id', flat=True))
        location_id_list_string = ','.join(location_ids)

        url = reverse('indicator-list-create-api')
        url += '?locations=' + location_id_list_string
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), len(self.reports))

    def test_list_api_filter_by_pd_ids(self):
        self.reports = Reportable.objects.filter(
            lower_level_outputs__reportables__isnull=False)

        pd_ids = map(
            lambda item: str(item),
            self.reports.values_list(
                'lower_level_outputs__indicator__programme_document__id', flat=True)
        )
        pd_id_list_string = ','.join(pd_ids)

        url = reverse('indicator-list-create-api')
        url += '?pds=' + pd_id_list_string
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['results']), len(self.reports))


class TestIndicatorReportListAPIView(BaseAPITestCase):
    generate_fake_data_quantity = 5

    def test_list_api_with_reportable_id(self):
        indicator_report = IndicatorReport.objects.last()

        url = reverse('indicator-report-list-api',
                      kwargs={'reportable_id': indicator_report.reportable.id})
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data),
                          indicator_report.reportable.indicator_reports.count())
        self.assertNotEquals(response.data[0]['indicator_location_data'][
                             0]['disaggregation'], {})

        def test_list_api_with_limit(self):
            indicator_report = IndicatorReport.objects.last()

            url = reverse('indicator-report-list-api',
                          kwargs={'reportable_id': indicator_report.reportable.id})
            url += '?limit=2'
            response = self.client.get(url, format='json')

            self.assertEquals(response.status_code, status.HTTP_200_OK)
            self.assertEquals(len(response.data), 2)


# TODO: Re-enable this test case at #35 branch
# class TestIndicatorLocationDataUpdateAPIView(BaseAPITestCase):
#     generate_fake_data_quantity = 5
#
#     def test_put_api(self):
#         indicator_location_data = IndicatorLocationData.objects.last()
#         data = [{
#             "id": 1047,
#             "location": {
#               "id": 257,
#               "title": "location_2",
#               "latitude": None,
#               "longitude": None,
#               "p_code": None
#             },
#             "disaggregation": {
#               "(1773,)": {
#                 "c": None,
#                 "d": None,
#                 "v": 58
#               },
#               "()": {
#                 "c": None,
#                 "d": None,
#                 "v": 169
#               },
#               "(1776,)": {
#                 "c": None,
#                 "d": None,
#                 "v": 93
#               },
#               "(1775,)": {
#                 "c": None,
#                 "d": None,
#                 "v": 127
#               },
#               "(1774,)": {
#                 "c": None,
#                 "d": None,
#                 "v": 150
#               }
#             },
#             "num_disaggregation": 3,
#             "level_reported": 1,
#             "disaggregation_reported_on": [
#               509
#             ]
#           },
#           {
#             "id": 1048,
#             "location": {
#               "id": 257,
#               "title": "location_2",
#               "latitude": None,
#               "longitude": None,
#               "p_code": None
#             },
#             "disaggregation": {
#               "(1778,)": {
#                 "c": None,
#                 "d": None,
#                 "v": 135
#               },
#               "(1781,)": {
#                 "c": None,
#                 "d": None,
#                 "v": 141
#               },
#               "(1779,)": {
#                 "c": None,
#                 "d": None,
#                 "v": 72
#               },
#               "(1780,)": {
#                 "c": None,
#                 "d": None,
#                 "v": 190
#               },
#               "()": {
#                 "c": None,
#                 "d": None,
#                 "v": 191
#               },
#               "(1782,)": {
#                 "c": None,
#                 "d": None,
#                 "v": 167
#               },
#               "(1777,)": {
#                 "c": None,
#                 "d": None,
#                 "v": 106
#               }
#             },
#             "num_disaggregation": 3,
#             "level_reported": 1,
#             "disaggregation_reported_on": [
#               510
#             ]
#           },
#           {
#             "id": 1049,
#             "location": {
#               "id": 257,
#               "title": "location_2",
#               "latitude": None,
#               "longitude": None,
#               "p_code": None
#             },
#             "disaggregation": {
#               "(1785,)": {
#                 "c": None,
#                 "d": None,
#                 "v": 195
#               },
#               "(1784,)": {
#                 "c": None,
#                 "d": None,
#                 "v": 132
#               },
#               "()": {
#                 "c": None,
#                 "d": None,
#                 "v": 103
#               },
#               "(1783,)": {
#                 "c": None,
#                 "d": None,
#                 "v": 63
#               }
#             },
#             "num_disaggregation": 3,
#             "level_reported": 1,
#             "disaggregation_reported_on": [
#               511
#             ]
#           },
#           {
#             "id": 1050,
#             "location": {
#               "id": 258,
#               "title": "location_3",
#               "latitude": None,
#               "longitude": None,
#               "p_code": None
#             },
#             "disaggregation": {
#               "()": {
#                 "c": None,
#                 "d": None,
#                 "v": 50
#               }
#             },
#             "num_disaggregation": 3,
#             "level_reported": 0,
#             "disaggregation_reported_on": []
#           }
#         ]
#
#         url = reverse('indicator-location-data-entries-put-api')
#         response = self.client.put(url, data, format='json')
#
#         self.assertEquals(response.status_code, status.HTTP_200_OK)
#         self.assertEquals(response.data, data)


class TestClusterIndicatorAPIView(BaseAPITestCase):

    generate_fake_data_quantity = 2

    def setUp(self):
        super(TestClusterIndicatorAPIView, self).setUp()
        self.reportable_count = Reportable.objects.count()
        self.blueprint_count = IndicatorBlueprint.objects.count()

        self.co = ClusterObjective.objects.first()
        self.url = reverse('cluster-indicator')
        self.data = {
            'cluster_objective_id': self.co.id,
            'means_of_verification': 'IMO/CC calculation',
            'locations': [
                {'id': Location.objects.first().id},
                {'id': Location.objects.last().id},
            ],
            'blueprint': {
                'title': 'of temporary classrooms',
                'unit': IndicatorBlueprint.NUMBER,
                'description': 'Average measure for the month',
                'calculation_formula_across_periods': IndicatorBlueprint.MAX,
                'calculation_formula_across_locations': IndicatorBlueprint.AVG,
                'display_type': IndicatorBlueprint.NUMBER,
                'disaggregatable': True,
            },
        }

    def test_create_indicator_cluster_reporting(self):
        response = self.client.post(self.url, data=self.data, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.status_code, status.HTTP_201_CREATED)
        self.assertEquals(Reportable.objects.count(), self.reportable_count+1)
        self.assertEquals(IndicatorBlueprint.objects.count(), self.blueprint_count+1)

        self.data['locations'].append(dict(failkey=1))
        response = self.client.post(self.url, data=self.data, format='json')
        self.assertFalse(status.is_success(response.status_code))
        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEquals(
            response.data,
            {"locations": "List of dict location or one dict location expected"}
        )

    def test_update_indicator_cluster_reporting(self):
        response = self.client.post(self.url, data=self.data, format='json')
        self.assertTrue(status.is_success(response.status_code))

        self.data.update({"id": response.data.get("reportable_id")})
        new_means_of_verification = 'IMO/CC calculation - updated'
        self.data['means_of_verification'] = new_means_of_verification
        new_title = 'of temporary classrooms - updated'
        self.data['blueprint']['title'] = new_title
        self.data['blueprint']['calculation_formula_across_locations'] = IndicatorBlueprint.MAX
        self.data['locations'] = [{'id': Location.objects.first().id}]
        response = self.client.put(self.url, data=self.data, format='json')

        self.assertFalse(status.is_success(response.status_code))
        expected_errors = set([
            'Modify or change the `calculation_formula_across_periods` is not allowed.',
            'Modify or change the `calculation_formula_across_locations` is not allowed.',
            'Modify or change the `display_type` is not allowed.'
        ])
        self.assertTrue(expected_errors.issubset(response.data['errors']))

        del self.data['blueprint']['calculation_formula_across_periods']
        del self.data['blueprint']['calculation_formula_across_locations']
        del self.data['blueprint']['display_type']
        self.data['locations'] = [{'id': Location.objects.first().id}]
        response = self.client.put(self.url, data=self.data, format='json')

        reportable = Reportable.objects.get(id=response.data['id'])
        self.assertEquals(reportable.means_of_verification, new_means_of_verification)
        self.assertEquals(reportable.blueprint.title, new_title)
        self.assertEquals(reportable.blueprint.calculation_formula_across_locations, IndicatorBlueprint.AVG)
        self.assertEquals(reportable.locations.count(), 1)
        self.assertEquals(
            reportable.locations.first().id,
            Location.objects.first().id
        )


class TestIndicatorLocationDataUpdateAPIView(BaseAPITestCase):
    generate_fake_data_quantity = 20

    def test_update_level_reported_0(self):
        indicator_location_data = IndicatorLocationData.objects.filter(
            level_reported=0, num_disaggregation=3).first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        update_data['disaggregation']['()']['v'] = 1000

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            response.data['disaggregation']['()']['v'],
            update_data['disaggregation']['()']['v'])

    def test_update_level_reported_1(self):
        indicator_location_data = IndicatorLocationData.objects.filter(
            level_reported=1, num_disaggregation=3).first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        level_reported_1_key = None
        tuple_disaggregation = get_cast_dictionary_keys_as_tuple(
            update_data['disaggregation'])

        for key in tuple_disaggregation:
            if len(key) == 1:
                level_reported_1_key = key
                break

        correct_total = update_data['disaggregation']['()']['v'] \
            - update_data['disaggregation'][str(level_reported_1_key)]['v']
        update_data['disaggregation'][str(level_reported_1_key)]['v'] = 0

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            response.data['disaggregation']['()']['v'],
            correct_total)

    def test_update_level_reported_2(self):
        indicator_location_data = IndicatorLocationData.objects.filter(
            level_reported=2, num_disaggregation=3).first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        level_reported_2_key = None
        tuple_disaggregation = get_cast_dictionary_keys_as_tuple(
            update_data['disaggregation'])

        for key in tuple_disaggregation:
            if len(key) == 2:
                level_reported_2_key = key
                break

        correct_total = update_data['disaggregation']['()']['v'] \
            - update_data['disaggregation'][str(level_reported_2_key)]['v']
        update_data['disaggregation'][str(level_reported_2_key)]['v'] = 0

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            response.data['disaggregation']['()']['v'],
            correct_total)

    def test_update_level_reported_3(self):
        indicator_location_data = IndicatorLocationData.objects.filter(
            level_reported=3, num_disaggregation=3).first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        level_reported_3_key = None
        tuple_disaggregation = get_cast_dictionary_keys_as_tuple(
            update_data['disaggregation'])

        for key in tuple_disaggregation:
            if len(key) == 3:
                level_reported_3_key = key
                break

        correct_total = update_data['disaggregation']['()']['v'] \
            - update_data['disaggregation'][str(level_reported_3_key)]['v']
        update_data['disaggregation'][str(level_reported_3_key)]['v'] = 0

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            response.data['disaggregation']['()']['v'],
            correct_total)

    def test_update_illegal_level_reported_validation(self):
        indicator_location_data = IndicatorLocationData.objects.filter(
            level_reported=3, num_disaggregation=3).first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data
        update_data['level_reported'] += 1

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            'level_reported cannot be higher than its num_disaggregation',
            response.data['non_field_errors'][0]
        )

    def test_update_wrong_disaggregation_reported_on_count_validation(self):
        indicator_location_data = IndicatorLocationData.objects.filter(
            level_reported=3, num_disaggregation=3).first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        update_data['level_reported'] -= 1

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            'disaggregation_reported_on list must have '
            + 'level_reported # of elements',
            response.data['non_field_errors'][0]
        )

    def test_update_wrong_num_disaggregation_count_validation(self):
        indicator_location_data = IndicatorLocationData.objects.filter(
            level_reported=3, num_disaggregation=3).first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        update_data['num_disaggregation'] += 1

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            u"num_disaggregation is not matched with "
            + "its IndicatorReport's Reportable disaggregation counts",
            response.data['non_field_errors'][0]
        )

    def test_update_wrong_disaggregation_reported_on_values_validation(self):
        indicator_location_data = IndicatorLocationData.objects.filter(
            level_reported=3, num_disaggregation=3).first()

        next_disaggregation_id = Disaggregation.objects.count() + 1

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        update_data['disaggregation_reported_on'].pop(0)
        update_data['disaggregation_reported_on'].append(next_disaggregation_id)

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            'disaggregation_reported_on list must have all '
            + 'its elements mapped to disaggregation ids',
            response.data['non_field_errors'][0]
        )

    def test_update_wrong_indicator_report_membership_validation(self):
        indicator_location_data = IndicatorLocationData.objects.filter(
            level_reported=3, num_disaggregation=3).first()
        different_indicator_report = IndicatorLocationData.objects \
            .exclude(
                indicator_report=indicator_location_data.indicator_report
            ).filter(
                level_reported=3, num_disaggregation=3
            ).first().indicator_report

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        update_data['indicator_report'] = different_indicator_report.id

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "IndicatorLocationData does not belong to ",
            response.data['non_field_errors'][0]
        )

    def test_update_less_disaggregation_entry_count(self):
        indicator_location_data = IndicatorLocationData.objects.filter(
            level_reported=3, num_disaggregation=3).first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        first_key = update_data['disaggregation'].keys()[0]
        update_data['disaggregation'].pop(first_key)

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "Submitted disaggregation data entries does not contain "
            + "all possible combination pair keys",
            response.data['non_field_errors'][0]
        )

    def test_update_extra_disaggregation_entry_count(self):
        indicator_location_data = IndicatorLocationData.objects.filter(
            level_reported=3, num_disaggregation=3).first()

        disaggregation_value_count = DisaggregationValue.objects.count()
        bad_key = tuple(
            [
                disaggregation_value_count,
                disaggregation_value_count + 1,
                disaggregation_value_count + 2
            ]
        )

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        update_data['disaggregation'][str(bad_key)] = {
            'c': 0,
            'd': 0,
            'v': 100
        }

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "Submitted disaggregation data entries contains "
            + "extra combination pair keys",
            response.data['non_field_errors'][0]
        )

    def test_update_higher_coordinate_space_key_validation(self):
        indicator_location_data = IndicatorLocationData.objects.filter(
            level_reported=3, num_disaggregation=3).first()

        next_disaggregation_value_id = DisaggregationValue.objects.count() + 1

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        level_reported_3_key = None
        tuple_disaggregation = get_cast_dictionary_keys_as_tuple(
            update_data['disaggregation'])

        for key in tuple_disaggregation:
            if len(key) == 3:
                level_reported_3_key = key
                break

        del update_data['disaggregation'][str(level_reported_3_key)]
        level_reported_3_key = list(level_reported_3_key)
        level_reported_3_key.append(next_disaggregation_value_id)
        update_data['disaggregation'][str(tuple(level_reported_3_key))] = {}

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "Disaggregation data coordinate "
            + "space cannot be higher than "
            + "specified level_reported",
            response.data['non_field_errors'][0]
        )

    def test_update_invalid_coordinate_space_key_validation(self):
        indicator_location_data = IndicatorLocationData.objects.filter(
            level_reported=3, num_disaggregation=3).first()

        next_disaggregation_value_id = DisaggregationValue.objects.count() + 1

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        level_reported_3_key = None
        tuple_disaggregation = get_cast_dictionary_keys_as_tuple(
            update_data['disaggregation'])

        for key in tuple_disaggregation:
            if len(key) == 3:
                level_reported_3_key = key
                break

        del update_data['disaggregation'][str(level_reported_3_key)]

        level_reported_3_key = list(level_reported_3_key[:-1])
        level_reported_3_key.append(next_disaggregation_value_id)
        update_data['disaggregation'][str(tuple(level_reported_3_key))] = {}

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "coordinate space does not "
            + "belong to disaggregation value id list",
            response.data['non_field_errors'][0]
        )

    def test_update_invalid_coordinate_space_key_format_validation(self):
        indicator_location_data = IndicatorLocationData.objects.filter(
            level_reported=3, num_disaggregation=3).first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        level_reported_3_key = None
        tuple_disaggregation = get_cast_dictionary_keys_as_tuple(
            update_data['disaggregation'])

        for key in tuple_disaggregation:
            if len(key) == 3:
                level_reported_3_key = key
                break

        value = update_data['disaggregation'][str(level_reported_3_key)]
        del update_data['disaggregation'][str(level_reported_3_key)]
        update_data['disaggregation']['bad key'] = value

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "key is not in tuple format",
            response.data['non_field_errors'][0]
        )

    def test_update_invalid_coordinate_space_value_format_validation(self):
        indicator_location_data = IndicatorLocationData.objects.filter(
            level_reported=3, num_disaggregation=3).first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        level_reported_3_key = None
        tuple_disaggregation = get_cast_dictionary_keys_as_tuple(
            update_data['disaggregation'])

        for key in tuple_disaggregation:
            if len(key) == 3:
                level_reported_3_key = key
                break

        update_data['disaggregation'][str(level_reported_3_key)] = {}

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "coordinate space value does not "
            + "have correct value key structure: c, d, v",
            response.data['non_field_errors'][0]
        )
