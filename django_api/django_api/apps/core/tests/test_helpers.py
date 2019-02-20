from unittest import TestCase

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
        self.combination_entry_input = [[1, 2, 3], [1, 2, 4]]

    def test_get_combination_pairs(self):
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

        self.assertEquals(key_combinations, expected)


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

        self.assertEquals(list(sorted_dict.keys()), expected_key_list)

    def test_get_sorted_ordered_dict_by_keys_ascending(self):
        sorted_dict = get_sorted_ordered_dict_by_keys(
            self.entry_dict, reverse=False)

        expected_key_list = [(111,), (101,), (100,), ()]
        expected_key_list.reverse()

        self.assertEquals(list(sorted_dict.keys()), expected_key_list)

    def test_get_sorted_ordered_dict_by_keys_with_key_func(self):
        sorted_dict = get_sorted_ordered_dict_by_keys(
            self.entry_dict, key_func=len)

        expected_key_list = [(), (100,), (101,), (111,)]

        self.assertEquals(list(sorted_dict.keys()), expected_key_list)

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
