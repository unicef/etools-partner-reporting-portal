import sys
import os
import random
from ast import literal_eval
from contextlib import contextmanager
from itertools import combinations, product
from collections import OrderedDict


@contextmanager
def suppress_stdout():
    """
    Turn off stdout (print to screen mode).
    Use it like:
        with suppress_stdout():
            do_something()
    """
    with open(os.devnull, "w") as devnull:
        old_stdout = sys.stdout
        sys.stdout = devnull
        try:
            yield
        finally:
            sys.stdout = old_stdout


def get_combination_pairs(array, r=3):
    """
    Returns an array of tuples where
    each tuple is a combination output of integer-coordinate space.

    array: An array of unique integers
    r: # of combinations from nCr
    """
    return list(combinations(array, r))


def generate_data_combination_entries(
    array, entries_only=False, key_type=str,
    indicator_type="quantity", r=3):
    if entries_only:
        output = []

    else:
        output = {}

    for idx in xrange(r):
        id_pairs = []

        if idx == 0:
            for id_list in array:
                id_pairs.extend(list(product(id_list)))

        elif idx == 1:
            combination_id_list_pairs = get_combination_pairs(array, r=2)

            for id_list_pair in combination_id_list_pairs:
                id_pairs.extend(list(product(*id_list_pair)))

        elif idx == 2:
            id_pairs = list(product(*array))

        for id_tuple in id_pairs:
            key = key_type(id_tuple)

            if entries_only:
                output.append(key)

            else:
                if indicator_type == "quantity":
                    output[key] = {
                        'v': random.randint(50, 1000),
                        'd': 0,
                        'c': 0
                    }

                elif indicator_type == "ratio":
                    output[key] = {
                        'v': random.randint(50, 1000),
                        'd': random.randint(2000, 4000),
                        'c': 0
                    }

    key = key_type(tuple())

    if entries_only:
        output.append(key)

    else:
        if indicator_type == "quantity":
            output[key] = {
                'v': random.randint(50, 1000),
                'd': 0,
                'c': 0
            }

        elif indicator_type == "ratio":
            output[key] = {
                'v': random.randint(50, 1000),
                'd': random.randint(2000, 4000),
                'c': 0
            }

    return output


def get_sorted_ordered_dict_by_keys(dictionary, reverse=True, key_func=None):
    """
    Returns a copy of passed-in dictionary as OrderedDict instance,
    after sorting the items by key.
    """
    if key_func:
        ordered_dict = OrderedDict(
            sorted(dictionary.items(), reverse=reverse, key=key_func))

    else:
        ordered_dict = OrderedDict(
            sorted(dictionary.items(), reverse=reverse))

    return ordered_dict


def get_cast_dictionary_keys_as_tuple(dictionary):
    """
    Returns a copy of passed-in dictionary as dict instance,
    after casting all of its keys as tuple.
    """
    casted_dictionary = dictionary.copy()
    keys = casted_dictionary.keys()

    for key in keys:
        casted_dictionary[literal_eval(key)] = casted_dictionary[key]
        casted_dictionary.pop(key)

    return casted_dictionary


def get_cast_dictionary_keys_as_string(dictionary):
    """
    Returns a copy of passed-in dictionary as dict instance,
    after casting all of its keys as string.
    """
    casted_dictionary = dictionary.copy()
    keys = casted_dictionary.keys()

    for key in keys:
        casted_dictionary[str(key)] = casted_dictionary[key]
        casted_dictionary.pop(key)

    return casted_dictionary
