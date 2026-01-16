from unittest import TestCase
from unittest.mock import MagicMock, patch

from etools_prp.apps.core.helpers import (
    generate_data_combination_entries,
    get_cast_dictionary_keys_as_string,
    get_cast_dictionary_keys_as_tuple,
    get_combination_pairs,
    get_sorted_ordered_dict_by_keys,
    update_ir_and_ilds_for_pr,
)
from etools_prp.apps.core.tests.factories import (
    ProgrammeDocumentFactory,
    ProgressReportFactory,
    ProgressReportIndicatorReportFactory,
    QPRReportingPeriodDatesFactory,
    QuantityReportableBaseFactory,
)
from etools_prp.apps.indicator.models import IndicatorReport, Reportable


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
        self.pd = ProgrammeDocumentFactory(
            title="Test PD", reference_number="TEST-PD-001"
        )
        self.reporting_period = QPRReportingPeriodDatesFactory(
            start_date="2024-01-01", end_date="2024-01-31", due_date="2024-02-07", pd=self.pd
        )
        self.progress_report = ProgressReportFactory(
            reporting_period=self.reporting_period, status="draft"
        )
        self.reportable1 = QuantityReportableBaseFactory(
            title="Reportable 1", active=True,
        )
        self.reportable2 = QuantityReportableBaseFactory(
            title="Reportable 2", active=True,
        )
        self.reportable3 = QuantityReportableBaseFactory(
            title="Reportable 3", active=True,
        )
        self.reportable_inactive = QuantityReportableBaseFactory(
            title="Inactive Reportable", active=False,
        )
        self.existing_ir1 = ProgressReportIndicatorReportFactory(
            reportable=self.reportable1, progress_report=self.progress_report,
            start_date="2024-01-01", end_date="2024-01-31", due_date="2024-02-07"
        )
        self.existing_ir2 = ProgressReportIndicatorReportFactory(
            reportable=self.reportable2, progress_report=self.progress_report,
            start_date="2024-01-01", end_date="2024-01-31", due_date="2024-02-07"
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
        self.assertEqual(new_ir.start_date, self.reporting_period.start_date)
        self.assertEqual(new_ir.end_date, self.reporting_period.end_date)
        self.assertEqual(new_ir.due_date, self.reporting_period.due_date)

    def test_update_ir_and_ilds_no_new_reportables(self):
        IndicatorReport.objects.create(
            reportable=self.reportable3, progress_report=self.progress_report,
            start_date="2024-01-01",
            end_date="2024-01-31",
            due_date="2024-02-07"
        )
        initial_count = IndicatorReport.objects.count()

        update_ir_and_ilds_for_pr(
            self.progress_report, self.active_reportables, self.reporting_period
        )
        final_count = IndicatorReport.objects.count()
        self.assertEqual(final_count, initial_count)

    def test_update_ir_and_ilds_only_active_indicator_reports_considered(self):
        """Test that only indicator reports with active reportables are considered"""
        IndicatorReport.objects.create(
            reportable=self.reportable_inactive,
            progress_report=self.progress_report,
            start_date="2024-01-01",
            end_date="2024-01-31",
            due_date="2024-02-07"
        )
        update_ir_and_ilds_for_pr(
            self.pd,
            self.progress_report,
            self.active_reportables,  # Doesn't include inactive reportable
            self.reporting_period
        )

        self.assertTrue(
            IndicatorReport.objects.filter(
                reportable=self.reportable3,
                progress_report=self.progress_report
            ).exists()
        )
        self.assertFalse(self.reportable_inactive in self.active_reportables)

    @patch('your_module.create_pr_ir_for_reportable')
    def test_create_pr_ir_for_reportable_called_with_correct_args(self, mock_create):
        """Test that create_pr_ir_for_reportable is called with correct arguments"""
        # Mock the return value
        mock_new_ir = IndicatorReport.objects.create(
            reportable=self.reportable3,
            progress_report=self.progress_report,
            start_date="2024-01-01",
            end_date="2024-01-31",
            due_date="2024-02-07"
        )
        mock_create.return_value = mock_new_ir

        # Act
        update_ir_and_ilds_for_pr(
            self.pd,
            self.progress_report,
            self.active_reportables,
            self.reporting_period
        )

        # Assert
        mock_create.assert_called_once_with(
            self.progress_report,
            self.reportable3,
            None,
            self.reporting_period.start_date,
            self.reporting_period.end_date,
            self.reporting_period.due_date
        )

    def test_indicator_report_saves_with_progress_report(self):
        """Test that indicator reports are saved with progress_report assigned"""

        # Mock create_pr_ir_for_reportable to verify save is called
        with patch('your_module.create_pr_ir_for_reportable') as mock_create:
            mock_new_ir = MagicMock(spec=IndicatorReport)
            mock_create.return_value = mock_new_ir

            # Act
            update_ir_and_ilds_for_pr(
                self.pd,
                self.progress_report,
                {self.reportable3},  # Just one to test
                self.reporting_period
            )

            # Assert
            # Verify progress_report is assigned before save
            mock_new_ir.progress_report = self.progress_report
            mock_new_ir.save.assert_called_once()

    def test_difference_operation_with_queryset(self):
        """Test the set difference operation between active_reportables and existing reportables"""

        # Get existing reportables through ORM
        active_irs = self.progress_report.indicator_reports.filter(reportable__active=True).all()
        existing_reportables = Reportable.objects.filter(indicator_reports__in=active_irs)

        # Calculate difference
        to_create = self.active_reportables.difference(existing_reportables)

        # Should only have reportable3
        self.assertEqual(len(to_create), 1)
        self.assertIn(self.reportable3, to_create)

        # Verify function creates indicator report for reportable3
        with patch('your_module.create_pr_ir_for_reportable') as mock_create:
            update_ir_and_ilds_for_pr(
                self.pd,
                self.progress_report,
                self.active_reportables,
                self.reporting_period
            )

            mock_create.assert_called_once_with(
                self.progress_report,
                self.reportable3,
                None,
                self.reporting_period.start_date,
                self.reporting_period.end_date,
                self.reporting_period.due_date
            )

    def test_empty_active_reportables(self):
        """Test with empty active reportables"""
        initial_count = IndicatorReport.objects.count()

        update_ir_and_ilds_for_pr(
            self.pd,
            self.progress_report,
            set(),  # Empty set
            self.reporting_period
        )

        # Assert - no new indicator reports
        final_count = IndicatorReport.objects.count()
        self.assertEqual(final_count, initial_count)

    def test_reportable_active_filter(self):
        """Test that only active reportables are considered from indicator_reports"""
        ir_inactive = IndicatorReport.objects.create(
            reportable=self.reportable_inactive,
            progress_report=self.progress_report,
            start_date="2024-01-01",
            end_date="2024-01-31",
            due_date="2024-02-07"
        )

        # The inactive reportable should not be included in active_irs
        active_irs = self.progress_report.indicator_reports.filter(reportable__active=True)

        # Verify inactive reportable is not in the queryset
        self.assertNotIn(ir_inactive, active_irs)

        # Verify active reportables are included
        self.assertIn(self.existing_ir1, active_irs)
        self.assertIn(self.existing_ir2, active_irs)
