import sys
import os
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
