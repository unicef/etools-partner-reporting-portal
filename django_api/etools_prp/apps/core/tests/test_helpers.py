from unittest import TestCase

from etools_prp.apps.core.common import INDICATOR_REPORT_STATUS, OVERALL_STATUS
from etools_prp.apps.core.helpers import (
    generate_data_combination_entries,
    get_cast_dictionary_keys_as_string,
    get_cast_dictionary_keys_as_tuple,
    get_combination_pairs,
    get_sorted_ordered_dict_by_keys,
    update_ir_and_ilds_for_pr,
)
from etools_prp.apps.core.tests import factories
from etools_prp.apps.indicator.models import IndicatorBlueprint, IndicatorReport, Reportable


class TestCombinatorics(TestCase):
    def setUp(self):
        self.entries = [1, 2, 3, 4, 5]
        self.combination_entry_input = [[1, 2, 3], [1, 2, 4]]

    def test_get_combination_pairs(self):
        self.assertEqual(get_combination_pairs(self.entries, r=0), [tuple()])

        r_1_result = [(1,), (2,), (3,), (4,), (5,)]

        self.assertEqual(get_combination_pairs(self.entries, r=1), r_1_result)

        r_2_result = [
            (1, 2),
            (1, 3),
            (1, 4),
            (1, 5),
            (2, 3),
            (2, 4),
            (2, 5),
            (3, 4),
            (3, 5),
            (4, 5)
        ]

        self.assertEqual(get_combination_pairs(self.entries, r=2), r_2_result)

        r_3_result = [
            (1, 2, 3),
            (1, 2, 4),
            (1, 2, 5),
            (1, 3, 4),
            (1, 3, 5),
            (1, 4, 5),
            (2, 3, 4),
            (2, 3, 5),
            (2, 4, 5),
            (3, 4, 5)
        ]

        self.assertEqual(get_combination_pairs(self.entries, r=3), r_3_result)

        r_4_result = [
            (1, 2, 3, 4),
            (1, 2, 3, 5),
            (1, 2, 4, 5),
            (1, 3, 4, 5),
            (2, 3, 4, 5)
        ]

        self.assertEqual(get_combination_pairs(self.entries, r=4), r_4_result)

        r_5_result = [(1, 2, 3, 4, 5)]

        self.assertEqual(get_combination_pairs(self.entries, r=5), r_5_result)

        self.assertEqual(get_combination_pairs(self.entries, r=6), [])

    def test_generate_data_combination_entries(self):
        key_combinations = generate_data_combination_entries(
            self.combination_entry_input,
            entries_only=True,
            key_type=tuple,
            indicator_type="quantity",
            r=2
        )

        key_combinations = sorted(set(key_combinations))

        expected = sorted([
            (3, 1),
            (1,),
            (3,),
            (3, 4),
            (2, 4),
            (2, 2),
            tuple(),
            (4,),
            (2, 1),
            (1, 2),
            (3, 2),
            (2,),
            (1, 4),
            (1, 1),
        ])

        self.assertEqual(key_combinations, expected)


class TestDictionaryHelpers(TestCase):
    def setUp(self):
        self.entry_dict = {
            (): 100,
            (100,): 100,
            (101,): 100,
            (101,): 100,
            (111,): 100,
        }

    def test_get_sorted_ordered_dict_by_keys(self):
        sorted_dict = get_sorted_ordered_dict_by_keys(self.entry_dict)

        expected_key_list = [(111,), (101,), (100,), ()]

        self.assertEqual(list(sorted_dict.keys()), expected_key_list)

    def test_get_sorted_ordered_dict_by_keys_ascending(self):
        sorted_dict = get_sorted_ordered_dict_by_keys(
            self.entry_dict, reverse=False)

        expected_key_list = [(111,), (101,), (100,), ()]
        expected_key_list.reverse()

        self.assertEqual(list(sorted_dict.keys()), expected_key_list)

    def test_get_sorted_ordered_dict_by_keys_with_key_func(self):
        sorted_dict = get_sorted_ordered_dict_by_keys(
            self.entry_dict, key_func=len)

        expected_key_list = [(), (100,), (101,), (111,)]

        self.assertEqual(list(sorted_dict.keys()), expected_key_list)

    def test_get_cast_dictionary_keys_as_string(self):
        converted_dict = get_cast_dictionary_keys_as_string(self.entry_dict)

        keys = converted_dict.keys()

        for key in keys:
            self.assertIsInstance(key, str)

    def test_get_cast_dictionary_keys_as_tuple(self):
        string_dict = get_cast_dictionary_keys_as_string(self.entry_dict)

        converted_dict = get_cast_dictionary_keys_as_tuple(string_dict)

        keys = converted_dict.keys()

        for key in keys:
            self.assertIsInstance(key, tuple)


class TestUpdateIRAndILDsForPR(TestCase):

    def setUp(self):
        self.pd = factories.ProgrammeDocumentFactory(
            title="Test PD", reference_number="TEST-PD-001"
        )
        self.cp_output = factories.PDResultLinkFactory(
            programme_document=self.pd,
        )
        self.llo = factories.LowerLevelOutputFactory(
            cp_output=self.cp_output,
        )
        self.reporting_period = factories.QPRReportingPeriodDatesFactory(
            start_date="2024-01-01", end_date="2024-01-31", due_date="2024-02-07", programme_document=self.pd
        )
        self.progress_report = factories.ProgressReportFactory(
            start_date=self.reporting_period.start_date, end_date=self.reporting_period.end_date, due_date=self.reporting_period.due_date,
            programme_document=self.pd, report_type='QPR', report_number=1
        )
        self.reportable1 = factories.QuantityReportableToLowerLevelOutputFactory(
            content_object=self.llo,
            blueprint=factories.QuantityTypeIndicatorBlueprintFactory(
                unit=IndicatorBlueprint.NUMBER,
                calculation_formula_across_locations=IndicatorBlueprint.SUM,
            )
        )
        self.reportable2 = factories.QuantityReportableToLowerLevelOutputFactory(
            content_object=self.llo,
            blueprint=factories.QuantityTypeIndicatorBlueprintFactory(
                unit=IndicatorBlueprint.NUMBER,
                calculation_formula_across_locations=IndicatorBlueprint.SUM,
            )
        )
        self.reportable3 = factories.QuantityReportableToLowerLevelOutputFactory(
            content_object=self.llo,
            blueprint=factories.QuantityTypeIndicatorBlueprintFactory(
                unit=IndicatorBlueprint.NUMBER,
                calculation_formula_across_locations=IndicatorBlueprint.SUM,
            )
        )
        self.reportable_inactive = factories.QuantityReportableToLowerLevelOutputFactory(
            content_object=self.llo, active=False,
            blueprint=factories.QuantityTypeIndicatorBlueprintFactory(
                unit=IndicatorBlueprint.NUMBER,
                calculation_formula_across_locations=IndicatorBlueprint.SUM,
            )
        )
        self.existing_ir1 = factories.ProgressReportIndicatorReportFactory(
            reportable=self.reportable1, progress_report=self.progress_report,
            report_status=INDICATOR_REPORT_STATUS.due, overall_status=OVERALL_STATUS.met
        )
        self.existing_ir2 = factories.ProgressReportIndicatorReportFactory(
            reportable=self.reportable2, progress_report=self.progress_report,
            report_status=INDICATOR_REPORT_STATUS.due, overall_status=OVERALL_STATUS.met
        )
        self.active_reportables = {
            self.reportable1,
            self.reportable2,
            self.reportable3
        }

    def test_update_ir_and_ilds_creates_new_indicator_reports(self):
        initial_count = IndicatorReport.objects.count()

        update_ir_and_ilds_for_pr(
            self.progress_report, self.active_reportables, self.reporting_period
        )
        final_count = IndicatorReport.objects.count()
        self.assertEqual(final_count, initial_count + 1)

        new_ir = IndicatorReport.objects.get(reportable=self.reportable3)
        self.assertEqual(new_ir.progress_report, self.progress_report)
        self.assertEqual(new_ir.time_period_start.strftime("%Y-%m-%d"), self.reporting_period.start_date)
        self.assertEqual(new_ir.time_period_end.strftime("%Y-%m-%d"), self.reporting_period.end_date)
        self.assertEqual(new_ir.due_date.strftime("%Y-%m-%d"), self.reporting_period.due_date)

    def test_update_ir_and_ilds_no_new_reportables(self):
        factories.ProgressReportIndicatorReportFactory(
            reportable=self.reportable3, progress_report=self.progress_report,
            report_status=INDICATOR_REPORT_STATUS.due, overall_status=OVERALL_STATUS.met
        )
        initial_count = IndicatorReport.objects.count()

        update_ir_and_ilds_for_pr(
            self.progress_report, self.active_reportables, self.reporting_period
        )
        final_count = IndicatorReport.objects.count()
        self.assertEqual(final_count, initial_count)

    def test_update_ir_and_ilds_only_active_indicator_reports_considered(self):
        """Test that only indicator reports with active reportables are considered"""
        factories.ProgressReportIndicatorReportFactory(
            reportable=self.reportable_inactive, progress_report=self.progress_report,
            report_status=INDICATOR_REPORT_STATUS.due, overall_status=OVERALL_STATUS.met
        )
        update_ir_and_ilds_for_pr(
            self.progress_report, self.active_reportables, self.reporting_period
        )
        self.assertTrue(
            IndicatorReport.objects.filter(
                reportable=self.reportable3,
                progress_report=self.progress_report
            ).exists()
        )
        self.assertFalse(self.reportable_inactive in self.active_reportables)

    def test_indicator_report_saves_with_progress_report(self):
        """Test that indicator reports are saved with progress_report assigned"""
        new_ir = factories.ProgressReportIndicatorReportFactory(
            reportable=self.reportable3, progress_report=self.progress_report,
            report_status=INDICATOR_REPORT_STATUS.due, overall_status=OVERALL_STATUS.met
        )
        update_ir_and_ilds_for_pr(
            self.progress_report, {self.reportable3}, self.reporting_period
        )
        self.assertEqual(new_ir.progress_report, self.progress_report)

    def test_difference_operation_with_queryset(self):
        """Test the set difference operation between active_reportables and existing reportables"""
        active_irs = self.progress_report.indicator_reports.filter(reportable__active=True).all()
        existing_reportables = Reportable.objects.filter(indicator_reports__in=active_irs)

        to_create = self.active_reportables.difference(existing_reportables)

        self.assertEqual(len(to_create), 1)
        self.assertIn(self.reportable3, to_create)

        update_ir_and_ilds_for_pr(
            self.progress_report, self.active_reportables, self.reporting_period
        )

        # mock_create.assert_called_once_with(
        #     self.progress_report,
        #     self.reportable3,
        #     None,
        #     self.reporting_period.start_date,
        #     self.reporting_period.end_date,
        #     self.reporting_period.due_date
        # )

    def test_empty_active_reportables(self):
        """Test with empty active reportables"""
        initial_count = IndicatorReport.objects.count()

        update_ir_and_ilds_for_pr(
            self.progress_report, set(), self.reporting_period
        )
        final_count = IndicatorReport.objects.count()
        self.assertEqual(final_count, initial_count)

    def test_reportable_active_filter(self):
        """Test that only active reportables are considered from indicator_reports"""
        ir_inactive = factories.ProgressReportIndicatorReportFactory(
            reportable=self.reportable_inactive, progress_report=self.progress_report,
            report_status=INDICATOR_REPORT_STATUS.due, overall_status=OVERALL_STATUS.met
        )

        # The inactive reportable should not be included in active_irs
        active_irs = self.progress_report.indicator_reports.filter(reportable__active=True)
        self.assertNotIn(ir_inactive, active_irs)
        self.assertIn(self.existing_ir1, active_irs)
        self.assertIn(self.existing_ir2, active_irs)
