import sys
import os
import random
from ast import literal_eval
from contextlib import contextmanager
from itertools import combinations, product
from collections import OrderedDict

from django.test import TestCase

from core.helpers import (
    get_combination_pairs,
    generate_data_combination_entries,
    get_sorted_ordered_dict_by_keys,
    get_cast_dictionary_keys_as_tuple,
    get_cast_dictionary_keys_as_string,
)


class TestCombinatorics(TestCase):
    def setUp(self):
        self.entries = [1, 2, 3, 4, 5]

    def get_combination_pairs(self):
        self.assertEquals(get_combination_pairs(self.entries, r=0), [tuple()])

        r_1_result = [(1,), (2,), (3,), (4,), (5,)]

        self.assertEquals(get_combination_pairs(self.entries, r=1), r_1_result)

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

        self.assertEquals(get_combination_pairs(self.entries, r=2), r_2_result)

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

        self.assertEquals(get_combination_pairs(self.entries, r=3), r_3_result)

        r_4_result = [
            (1, 2, 3, 4),
            (1, 2, 3, 5),
            (1, 2, 4, 5),
            (1, 3, 4, 5),
            (2, 3, 4, 5)
        ]

        self.assertEquals(get_combination_pairs(self.entries, r=4), r_4_result)

        r_5_result = [(1, 2, 3, 4, 5)]

        self.assertEquals(get_combination_pairs(self.entries, r=5), r_5_result)

        self.assertEquals(get_combination_pairs(self.entries, r=6), [])

    def generate_data_combination_entries(self):
        self.entries = [[1, 2, 3], [1, 2, 4]]

        key_combinations = generate_data_combination_entries(
            packed_key,
            entries_only=True,
            key_type=tuple,
            indicator_type="quantity",
            r=level_reported - 1
        )

        key_combinations = list(set(key_combinations))

        expected = [
            '(3, 1)',
            '(1,)',
            '(3,)',
            '(3, 4)',
            '(2, 4)',
            '(2, 2)',
            '()',
            '(4,)',
            '(2, 1)',
            '(1, 2)',
            '(3, 2)',
            '(2,)',
            '(1, 4)',
            '(1, 1)'
        ]

        self.assertEquals(key_combinations, expected)

class TestDictionaryHelpers(TestCase):
    def get_sorted_ordered_dict_by_keys(self):
        pass

    def get_cast_dictionary_keys_as_tuple(self):
        pass

    def get_cast_dictionary_keys_as_string(self):
        pass
