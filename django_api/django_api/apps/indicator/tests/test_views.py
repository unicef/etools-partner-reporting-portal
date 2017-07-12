from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from core.management.commands._privates import generate_fake_data
from core.helpers import suppress_stdout

from account.models import User

from core.factories import (
    ProgrammeDocumentFactory,
    ReportableToLowerLevelOutputFactory,
    ProgressReportFactory,
    IndicatorLocationDataFactory,
    SectionFactory
)
from core.helpers import (
    get_cast_dictionary_keys_as_tuple,
)
from core.common import OVERALL_STATUS
from core.tests.base import BaseAPITestCase
from unicef.models import (
    LowerLevelOutput,
    Section,
    ProgrammeDocument
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

    def test_enter_indicator(self):
        ir = IndicatorReport.objects.first()
        expected_reportable = Reportable.objects.filter(
            indicator_reports__id=ir.id,
            lower_level_outputs__isnull=False
        )
        self.assertEquals(ir.progress_report.partner_contribution_to_date, '')
        self.assertEquals(ir.progress_report.challenges_in_the_reporting_period, '')
        data = {
            'progress_report': {
                'id': ir.progress_report.id,
                'partner_contribution_to_date': 'update field',
                'challenges_in_the_reporting_period': 'new challanges',
                'proposed_way_forward': 'update field',
                'funds_received_to_date': 'updated funds',
                'programme_document_id': ir.progress_report.programme_document.id,
            },
            'indicator_report': [

            ]
        }

        url = reverse('indicator-data', kwargs={'ir_id': ir.id})
        response = self.client.put(url, data=data, format='json')
        updated_ir = IndicatorReport.objects.get(id=ir.id)
        self.assertEquals(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEquals(updated_ir.progress_report.partner_contribution_to_date, u'update field')
        self.assertEquals(updated_ir.progress_report.challenges_in_the_reporting_period, u'new challanges')

        del data['progress_report']
        response = self.client.put(url, data=data, format='json')
        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)


class TestIndicatorDataReportableAPIView(BaseAPITestCase):

    def test_overall_narrative(self):
        ir = IndicatorReport.objects.first()
        url = reverse('indicator-data-reportable', kwargs={'ir_id': ir.id, 'reportable_id': ir.reportable.id})

        new_overall_status = OVERALL_STATUS.met
        data = dict(overall_status=new_overall_status)
        response = self.client.patch(url, data=data, format='json')
        self.assertEquals(response.status_code, status.HTTP_204_NO_CONTENT)
        updated_ir = IndicatorReport.objects.get(id=ir.id)
        self.assertEquals(updated_ir.overall_status, new_overall_status)

        new_narrative_assessemnt = "new narrative_assessemnt"
        data = dict(narrative_assessemnt=new_narrative_assessemnt)
        response = self.client.patch(url, data=data, format='json')
        self.assertEquals(response.status_code, status.HTTP_204_NO_CONTENT)
        updated_ir = IndicatorReport.objects.get(id=ir.id)
        self.assertEquals(updated_ir.narrative_assessemnt, new_narrative_assessemnt)


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
            - update_data['disaggregation'][unicode(level_reported_1_key)]['v']
        update_data['disaggregation'][unicode(level_reported_1_key)]['v'] = 0

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
            - update_data['disaggregation'][unicode(level_reported_2_key)]['v']
        update_data['disaggregation'][unicode(level_reported_2_key)]['v'] = 0

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
            - update_data['disaggregation'][unicode(level_reported_3_key)]['v']
        update_data['disaggregation'][unicode(level_reported_3_key)]['v'] = 0

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
            u'level_reported cannot be higher than its num_disaggregation',
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
            u'disaggregation_reported_on list must have '
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
            u'disaggregation_reported_on list must have all '
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

        update_data['disaggregation'][unicode(bad_key)] = {
            u'c': None,
            u'd': None,
            u'v': 100
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

        del update_data['disaggregation'][unicode(level_reported_3_key)]
        level_reported_3_key = list(level_reported_3_key)
        level_reported_3_key.append(next_disaggregation_value_id)
        update_data['disaggregation'][unicode(tuple(level_reported_3_key))] = {}

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

        del update_data['disaggregation'][unicode(level_reported_3_key)]

        level_reported_3_key = list(level_reported_3_key[:-1])
        level_reported_3_key.append(next_disaggregation_value_id)
        update_data['disaggregation'][unicode(tuple(level_reported_3_key))] = {}

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

        value = update_data['disaggregation'][unicode(level_reported_3_key)]
        del update_data['disaggregation'][unicode(level_reported_3_key)]
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

        update_data['disaggregation'][unicode(level_reported_3_key)] = {}

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "coordinate space value does not "
            + "have correct value key structure: c, d, v",
            response.data['non_field_errors'][0]
        )
