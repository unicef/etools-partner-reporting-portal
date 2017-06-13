from itertools import combinations


def get_combination_pairs(array, r=3):
    """
    Returns an array of tuples where each tuple is a combination output of integer-coordinate space.

    array: An array of unique integers
    r: # of combinations from nCr
    """
    return list(combinations(array, r))
