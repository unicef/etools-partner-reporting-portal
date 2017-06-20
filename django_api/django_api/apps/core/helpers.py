import sys
import os
import random
from contextlib import contextmanager
from itertools import combinations


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
    Returns an array of tuples where each tuple is a combination output of integer-coordinate space.

    array: An array of unique integers
    r: # of combinations from nCr
    """
    return list(combinations(array, r))


def generate_data_combination_entries(array, entries_only=False, r=3):
    if entries_only:
        output = []

    else:
        output = {}

    for idx in xrange(1, r + 1):
        id_pairs = get_combination_pairs(array, idx)

        for id_tuple in id_pairs:
            if entries_only:
                output.append(str(id_tuple))

            else:
                output[str(id_tuple)] = {
                    'v': random.randint(50, 1000),
                    'd': None,
                    'c': None
                }

    if entries_only:
        output.append(str(tuple()))

    else:
        output[str(tuple())] = {
            'v': random.randint(50, 1000),
            'd': None,
            'c': None
        }

    return output
