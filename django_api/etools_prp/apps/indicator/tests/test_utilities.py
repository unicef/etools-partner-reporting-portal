from django.test import TestCase

from etools_prp.apps.indicator.utilities import format_total_value_to_string


class TestFormatTotalValueToString(TestCase):
    def test_sum_empty(self):
        total = {}
        self.assertEqual(format_total_value_to_string(total, False, None), "0")

    def test_sum(self):
        total = {"c": 10000, "d": 20000, "v": 30000}
        self.assertEqual(
            format_total_value_to_string(total, False, None),
            "30,000",
        )

    def test_percentage_empty(self):
        total = {}
        self.assertEqual(format_total_value_to_string(total, True, None), "0%")

    def test_percentage(self):
        total = {"c": 10000, "d": 20000, "v": 30000}
        self.assertEqual(
            format_total_value_to_string(total, True, None),
            "150%",
        )

    def test_percentage_missing_denominator(self):
        total = {"c": 100, "v": 300}
        self.assertEqual(
            format_total_value_to_string(total, True, None),
            "30,000%",
        )

    def test_percentage_zero_denominator(self):
        total = {"c": 100, "d": 0, "v": 300}
        self.assertEqual(
            format_total_value_to_string(total, True, None),
            "0%",
        )

    def test_ratio_empty(self):
        total = {}
        self.assertEqual(
            format_total_value_to_string(total, True, "ratio"),
            "0/1",
        )

    def test_ratio(self):
        total = {"c": 10000, "d": 20000, "v": 30000}
        self.assertEqual(
            format_total_value_to_string(total, True, "ratio"),
            "30000/20000",
        )

    def test_ratio_missing_denominator(self):
        total = {"c": 100, "v": 300}
        self.assertEqual(
            format_total_value_to_string(total, True, "ratio"),
            "300/1",
        )

    def test_string_denominator_value_percentage(self):
        total = {"d": "100", "v": "30"}
        self.assertEqual(
            format_total_value_to_string(total, True, None),
            "30%",
        )

    def test_string_denominator_value_ratio(self):
        total = {"d": "100", "v": "300"}
        self.assertEqual(
            format_total_value_to_string(total, True, "ratio"),
            "300/100",
        )
