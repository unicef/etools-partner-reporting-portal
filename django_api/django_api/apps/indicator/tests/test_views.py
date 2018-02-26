from ast import literal_eval as make_tuple
from datetime import date, timedelta
import random
import string

from django.urls import reverse
from django.conf import settings

from rest_framework import status

from core.models import Location
from core.helpers import (
    get_cast_dictionary_keys_as_tuple,
)
from core.common import OVERALL_STATUS, PROGRESS_REPORT_STATUS, REPORTABLE_FREQUENCY_LEVEL, INDICATOR_REPORT_STATUS
from core.factories import ProgressReportFactory
from core.tests.base import BaseAPITestCase
from cluster.models import ClusterObjective, ClusterActivity
from partner.models import PartnerProject, PartnerActivity
from unicef.models import (
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
    IndicatorBlueprint,
)


class TestPDReportsAPIView(BaseAPITestCase):

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


class TestIndicatorDataAPIView(BaseAPITestCase):
    generate_fake_data_quantity = 30

    def test_list_api(self):
        ir = IndicatorReport.objects.filter(
            reportable__lower_level_outputs__isnull=False).first()

        if not ir.progress_report:
            ir.progress_report = ProgressReportFactory(
                programme_document=ir.reportable.content_object.indicator.programme_document)
            ir.save()

        ir_id = ir.id
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

        # PD output filter (reportable id)
        reportable_id = response.data['outputs'][0]['id']
        url = url + ("?reportable_id=%d" % reportable_id)
        response = self.client.get(url, format='json')
        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(len(response.data['outputs']), 1)
        self.assertEquals(response.data['outputs'][0]['id'], reportable_id)

    def test_enter_indicator(self):
        ir = IndicatorReport.objects.filter(
            reportable__lower_level_outputs__isnull=False).first()

        if not ir.progress_report:
            ir.progress_report = ProgressReportFactory(
                programme_document=ir.reportable.content_object.indicator.programme_document)
            ir.save()

        self.assertEquals(ir.progress_report.partner_contribution_to_date, '')
        self.assertEquals(
            ir.progress_report.challenges_in_the_reporting_period, '')
        data = {
            'progress_report': {
                'id': ir.progress_report.id,
                'partner_contribution_to_date': 'update field',
                'challenges_in_the_reporting_period': 'new challanges',
                'proposed_way_forward': 'update field',
                'programme_document_id': ir.progress_report.programme_document.id,
            }
        }

        url = reverse('indicator-data', kwargs={'ir_id': ir.id})
        response = self.client.put(url, data=data, format='json')
        updated_ir = IndicatorReport.objects.get(id=ir.id)
        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            response.data['progress_report']['partner_contribution_to_date'],
            u'update field')
        self.assertEquals(
            updated_ir.progress_report.partner_contribution_to_date,
            u'update field')
        self.assertEquals(
            updated_ir.progress_report.challenges_in_the_reporting_period,
            u'new challanges')

        del data['progress_report']
        response = self.client.put(url, data=data, format='json')
        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_submit_indicator(self):
        ir = IndicatorReport.objects.filter(
            reportable__lower_level_outputs__isnull=False,
            report_status=INDICATOR_REPORT_STATUS.sent_back).first()

        if not ir.progress_report:
            ir.progress_report = ProgressReportFactory(
                programme_document=ir.reportable.content_object.indicator.programme_document)
            ir.save()

        url = reverse('indicator-data', kwargs={'ir_id': ir.id})
        response = self.client.post(url, format='json')
        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(
            response.data['submission_date'],
            date.today().strftime(
                settings.PRINT_DATA_FORMAT))
        self.assertEquals(response.data['is_draft'], False)
        self.assertEquals(
            response.data['progress_report_status'],
            PROGRESS_REPORT_STATUS.submitted)


class TestIndicatorListAPIView30(BaseAPITestCase):
    generate_fake_data_quantity = 30

    def test_list_api_filter_by_locations(self):
        self.reports = Reportable.objects.filter(
            lower_level_outputs__reportables__isnull=False,
            locations__isnull=False
        ).distinct()

        location_ids = map(lambda item: str(
            item), self.reports.values_list('locations__id', flat=True))
        location_id_list_string = ','.join(location_ids)

        url = reverse('indicator-list-api', kwargs={'content_object': 'llo'})
        url += '?locations=' + location_id_list_string
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(self.reports), len(response.data['results']))

    def test_list_api_filter_by_pd_ids(self):
        self.reports = Reportable.objects.filter(
            lower_level_outputs__reportables__isnull=False)

        pd_ids = map(
            lambda item: str(item),
            self.reports.values_list(
                'lower_level_outputs__cp_output__programme_document__id', flat=True)
        )
        pd_id_list_string = ','.join(pd_ids)

        url = reverse('indicator-list-api', kwargs={'content_object': 'llo'})
        url += '?pds=' + pd_id_list_string
        response = self.client.get(url, format='json')

        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(self.reports), len(response.data['results']))


class TestIndicatorDataReportableAPIView(BaseAPITestCase):

    def test_overall_narrative(self):
        ir = IndicatorReport.objects.first()
        url = reverse(
            'indicator-data-reportable',
            kwargs={
                'ir_id': ir.id,
                'reportable_id': ir.reportable.id})

        new_overall_status = OVERALL_STATUS.met
        data = dict(overall_status=new_overall_status)
        response = self.client.patch(url, data=data, format='json')
        self.assertEquals(response.status_code, status.HTTP_200_OK)
        self.assertEquals(response.data['overall_status'], new_overall_status)

        updated_ir = IndicatorReport.objects.get(id=ir.id)
        self.assertEquals(updated_ir.overall_status, new_overall_status)

        new_narrative_assessment = "new narrative_assessment"
        data = dict(narrative_assessment=new_narrative_assessment)
        response = self.client.patch(url, data=data, format='json')
        self.assertEquals(response.status_code, status.HTTP_200_OK)
        updated_ir = IndicatorReport.objects.get(id=ir.id)
        self.assertEquals(
            updated_ir.narrative_assessment,
            new_narrative_assessment)


class TestIndicatorReportListAPIView(BaseAPITestCase):

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


class TestClusterIndicatorAPIView(BaseAPITestCase):

    generate_fake_data_quantity = 3

    def setUp(self):
        super(TestClusterIndicatorAPIView, self).setUp()
        self.reportable_count = Reportable.objects.count()
        self.blueprint_count = IndicatorBlueprint.objects.count()

        self.co = ClusterObjective.objects.first()
        self.url = reverse('cluster-indicator')
        self.data = {
            'object_id': self.co.id,
            'object_type': 'ClusterObjective',
            'means_of_verification': 'IMO/CC calculation',
            'frequency': REPORTABLE_FREQUENCY_LEVEL.weekly,
            'locations': [
                {'id': Location.objects.first().id},
                {'id': Location.objects.last().id},
            ],
            'blueprint': {
                'title': 'of temporary classrooms',
                'calculation_formula_across_periods': IndicatorBlueprint.MAX,
                'calculation_formula_across_locations': IndicatorBlueprint.AVG,
                'display_type': IndicatorBlueprint.NUMBER,
            },
            'disaggregation': [
                {'name': 'Age', 'values': ['0-5m', '5-12m', '1-3y', '4-7y']},
                {'name': 'Gender', 'values': ['Male', 'Female', 'Other']}
            ]
        }

    def test_create_indicator_cluster_objective_reporting(self):
        response = self.client.post(self.url, data=self.data, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.status_code, status.HTTP_201_CREATED)
        self.assertEquals(
            Reportable.objects.count(),
            self.reportable_count + 1)
        self.assertEquals(
            IndicatorBlueprint.objects.count(),
            self.blueprint_count + 1)

        reportable = Reportable.objects.get(id=response.data['id'])
        self.assertEquals(
            reportable.frequency,
            REPORTABLE_FREQUENCY_LEVEL.weekly)

        rep_dis = Disaggregation.objects.filter(reportable=response.data['id'])
        self.assertTrue(rep_dis.first().name in ['Gender', 'Age'])
        self.assertTrue(rep_dis.last().name in ['Gender', 'Age'])
        first_dis_vals = DisaggregationValue.objects.filter(
            disaggregation=rep_dis.first())
        last_dis_vals = DisaggregationValue.objects.filter(
            disaggregation=rep_dis.last())
        self.assertTrue(
            first_dis_vals.first().value in self.data['disaggregation'][0]['values'])
        self.assertTrue(
            last_dis_vals.first().value in self.data['disaggregation'][1]['values'])

        self.data['locations'].append(dict(failkey=1))
        response = self.client.post(self.url, data=self.data, format='json')
        self.assertFalse(status.is_success(response.status_code))
        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEquals(
            response.data,
            {"locations": "List of dict location or one dict location expected"}
        )

    def test_create_percentage_indicator_reporting(self):
        self.data['blueprint'].pop('calculation_formula_across_periods')
        self.data['blueprint'].pop('calculation_formula_across_locations')
        self.data['blueprint']['display_type'] = IndicatorBlueprint.PERCENTAGE
        response = self.client.post(self.url, data=self.data, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.status_code, status.HTTP_201_CREATED)
        self.assertEquals(
            Reportable.objects.count(),
            self.reportable_count + 1)
        self.assertEquals(
            IndicatorBlueprint.objects.count(),
            self.blueprint_count + 1)

        reportable = Reportable.objects.get(id=response.data['id'])
        self.assertEquals(
            reportable.blueprint.display_type,
            IndicatorBlueprint.PERCENTAGE)

    def test_create_indicator_disaggregation_max_length_reporting(self):
        max_length = DisaggregationValue._meta.get_field('value').max_length
        over_max_val = "".join(
            random.sample(
                string.ascii_uppercase,
                max_length + 1))
        self.data['disaggregation'][1]['values'][0] = over_max_val
        response = self.client.post(self.url, data=self.data, format='json')

        self.assertFalse(status.is_success(response.status_code))
        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEquals(Reportable.objects.count(), self.reportable_count)
        self.assertEquals(
            IndicatorBlueprint.objects.count(),
            self.blueprint_count)
        self.assertEquals(
            response.data,
            {"disaggregation": "Disaggregation Value expected max %s chars" % max_length}
        )

    def test_create_csdates_indicator_cluster_activities_reporting(self):
        cs_dates = [
            date.today().strftime(settings.INPUT_DATA_FORMAT),
            (date.today() + timedelta(days=3)).strftime(settings.INPUT_DATA_FORMAT),
            (date.today() + timedelta(days=6)).strftime(settings.INPUT_DATA_FORMAT),
            (date.today() + timedelta(days=9)).strftime(settings.INPUT_DATA_FORMAT),
        ]
        ca = ClusterActivity.objects.first()
        self.data['object_id'] = ca.id
        self.data['object_type'] = 'ClusterActivity'
        self.data['cs_dates'] = cs_dates
        self.data['frequency'] = REPORTABLE_FREQUENCY_LEVEL.custom_specific_dates
        response = self.client.post(self.url, data=self.data, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.status_code, status.HTTP_201_CREATED)
        self.assertEquals(
            Reportable.objects.count(),
            self.reportable_count + 1)
        self.assertEquals(
            IndicatorBlueprint.objects.count(),
            self.blueprint_count + 1)

        reportable = Reportable.objects.get(id=response.data['id'])
        self.assertEquals(reportable.frequency,
                          REPORTABLE_FREQUENCY_LEVEL.custom_specific_dates)
        self.assertEquals(len(reportable.cs_dates), len(cs_dates))

    def test_create_indicator_partner_project_reporting(self):
        pp = PartnerProject.objects.first()
        self.data['object_id'] = pp.id
        self.data['object_type'] = 'PartnerProject'
        response = self.client.post(self.url, data=self.data, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.status_code, status.HTTP_201_CREATED)
        self.assertEquals(
            Reportable.objects.count(),
            self.reportable_count + 1)
        self.assertEquals(
            IndicatorBlueprint.objects.count(),
            self.blueprint_count + 1)

    def test_create_indicator_partner_activities_reporting(self):
        pa = PartnerActivity.objects.filter(project__isnull=False).first()
        self.data['object_id'] = pa.id
        self.data['object_type'] = 'PartnerActivity'
        response = self.client.post(self.url, data=self.data, format='json')

        self.assertTrue(status.is_success(response.status_code))
        self.assertEquals(response.status_code, status.HTTP_201_CREATED)
        self.assertEquals(
            Reportable.objects.count(),
            self.reportable_count + 1)
        self.assertEquals(
            IndicatorBlueprint.objects.count(),
            self.blueprint_count + 1)

    def test_create_indicator_fake_object_type_reporting(self):
        self.data['object_id'] = 1
        self.data['object_type'] = 'fake'
        response = self.client.post(self.url, data=self.data, format='json')
        self.assertFalse(status.is_success(response.status_code))
        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEquals(
            response.data['object_type'],
            ['Not valid data. Expected value is ClusterObjective, ClusterActivity, PartnerProject, PartnerActivity.']
        )
        self.assertEquals(Reportable.objects.count(), self.reportable_count)
        self.assertEquals(
            IndicatorBlueprint.objects.count(),
            self.blueprint_count)

    def test_update_indicator_cluster_reporting(self):
        response = self.client.post(self.url, data=self.data, format='json')
        self.assertTrue(status.is_success(response.status_code))

        self.data.update({"id": response.data.get("id")})
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
        self.assertEquals(
            reportable.means_of_verification,
            new_means_of_verification)
        self.assertEquals(reportable.blueprint.title, new_title)
        self.assertEquals(
            reportable.blueprint.calculation_formula_across_locations,
            IndicatorBlueprint.AVG)
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
        update_data['disaggregation_reported_on'].append(
            next_disaggregation_id)

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

    def test_update_not_all_level_reported_disaggregation_entry_count(self):
        indicator_location_data = IndicatorLocationData.objects.filter(
            level_reported=3, num_disaggregation=3).first()

        update_data = IndicatorLocationDataUpdateSerializer(
            indicator_location_data).data

        level_reported_key = list(filter(
            lambda item: len(make_tuple(item)) ==
            indicator_location_data.level_reported,
            update_data['disaggregation'].keys()))[0]
        update_data['disaggregation'].pop(level_reported_key)

        url = reverse('indicator-location-data-entries-put-api')
        response = self.client.put(url, update_data, format='json')

        self.assertEquals(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEquals(
            "Submitted disaggregation data entries do not contain "
            + "all level %d combination pair keys" % (indicator_location_data.level_reported),
            str(response.data['non_field_errors'][0])
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
            str(response.data['non_field_errors'][0])
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
