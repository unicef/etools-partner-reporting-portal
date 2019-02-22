import math
import random
import sys
import os
from ast import literal_eval
from calendar import monthrange
from collections import OrderedDict
from contextlib import contextmanager
from datetime import date, timedelta
from itertools import combinations, product

from core.common import (
    PD_FREQUENCY_LEVEL,
)


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

    for idx in range(r):
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
                        'd': 1,
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
                'd': 1,
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
    casted_dictionary = dict()

    for key in dictionary.copy().keys():
        casted_dictionary[literal_eval(key)] = dictionary[key]

    return casted_dictionary


def get_cast_dictionary_keys_as_string(dictionary):
    """
    Returns a copy of passed-in dictionary as dict instance,
    after casting all of its keys as string.
    """
    casted_dictionary = dict()

    for key in dictionary.copy().keys():
        casted_dictionary[str(key)] = dictionary[key]

    return casted_dictionary


def get_num_of_days_in_a_month(year, month):
    return monthrange(year, month)[1]


def get_current_quarter_for_a_month(month):
    return int(math.ceil(float(month) / 3))


# Modified a bit from https://stackoverflow.com/a/37708216/2363915
def get_first_date_of_a_quarter(year, quarter=1):
    assert quarter >= 1

    first_month_of_quarter = 3 * quarter - 2

    date_of_first_day_of_quarter = date(year, first_month_of_quarter, 1)

    return date_of_first_day_of_quarter


def get_last_date_of_a_quarter(year, quarter=1):
    assert quarter >= 1

    last_month_of_quarter = 3 * quarter

    date_of_last_day_of_quarter = date(
        year, last_month_of_quarter,
        get_num_of_days_in_a_month(year, last_month_of_quarter))

    return date_of_last_day_of_quarter


def calculate_end_date_given_start_date(start_date, frequency, cs_dates=None):
    end_date = None

    if frequency == PD_FREQUENCY_LEVEL.weekly:
        end_date = start_date + timedelta(6)

    elif frequency == PD_FREQUENCY_LEVEL.monthly:
        num_of_days = get_num_of_days_in_a_month(
            start_date.year, start_date.month)

        end_date = date(
            start_date.year, start_date.month, num_of_days)

    elif frequency == PD_FREQUENCY_LEVEL.quarterly:
        quarter = get_current_quarter_for_a_month(
            start_date.month)

        end_date = get_last_date_of_a_quarter(
            start_date.year, quarter=quarter)

    elif frequency == PD_FREQUENCY_LEVEL.custom_specific_dates:
        for idx, cs_date in enumerate(cs_dates):
            if cs_date > start_date:
                end_date = cs_date - timedelta(days=1)
                break

    return end_date


def find_missing_frequency_period_dates_for_indicator_report(indicator, latest_indicator_report_date, frequency):
    # PD_FREQUENCY_LEVEL can be used interchangeably
    today = date.today()
    indicator_start_date = None
    indicator_end_date = None

    if indicator.content_type.model in ["clusterobjective", "clusteractivity"]:
        indicator_start_date = indicator.content_object.cluster.response_plan.start
        indicator_end_date = indicator.content_object.cluster.response_plan.end

    if indicator.content_type.model in ["partnerproject", "partneractivity", "lowerleveloutput"]:
        indicator_start_date = indicator.content_object.start_date
        indicator_end_date = indicator.content_object.end_date

    # Override start date if indicator has its own start date
    if indicator.start_date_of_reporting_period:
        indicator_start_date = indicator.start_date_of_reporting_period

    date_to_compare = latest_indicator_report_date if latest_indicator_report_date else indicator_start_date
    date_list = []

    # Only add 1 day to date_to_compare if it came from latest_indicator_report_date
    # in order to set next date period correctly
    if latest_indicator_report_date:
        date_to_compare += timedelta(1)

    # For now, we only generate missing dates for the past.
    if today > date_to_compare and indicator_end_date > date_to_compare:
        # day_delta as a flag to decrement day_delta_counter for next date
        # day_delta_counter as a date day integer to indicate next date
        if today > indicator_end_date:
            day_delta = (indicator_end_date - date_to_compare).days
            date_to_subtract_from = indicator_end_date
        else:
            day_delta = (today - date_to_compare).days
            date_to_subtract_from = today

        day_delta_counter = day_delta

        # Keep adding missing date until we get caught up with day_delta
        while day_delta_counter > 0:
            can_add = True

            missing_date = date_to_subtract_from - timedelta(day_delta_counter)

            # If this is generating monthly report first time, adjust the date_to_subtract_from to prevent
            # duplicate pro-rata dates
            if frequency == PD_FREQUENCY_LEVEL.monthly and not latest_indicator_report_date and date_list:
                missing_date = missing_date.replace(day=1)

            if frequency == PD_FREQUENCY_LEVEL.weekly:
                # Check if we should proceed to next date
                if day_delta >= 7:
                    # If day_delta_counter has more week date to create
                    if day_delta_counter >= 7:
                        day_delta_counter -= 7

                    # We have exhausted day_delta_counter successfully. Exiting
                    else:
                        day_delta_counter = 0

                else:
                    break

            elif frequency == PD_FREQUENCY_LEVEL.monthly:
                # Get the # of days in target month
                num_of_days = get_num_of_days_in_a_month(
                    missing_date.year, missing_date.month)

                # Check if we should proceed to next date
                if day_delta >= num_of_days:
                    # If day_delta_counter has more months to create
                    if day_delta_counter >= num_of_days:
                        day_delta_counter -= num_of_days

                    # We have exhausted day_delta_counter successfully. Exiting
                    else:
                        day_delta_counter = 0

                else:
                    # For handling a case to start in the middle of month, add this missing date
                    # only if new date is later than start date
                    if indicator_start_date <= missing_date and can_add:
                        date_list.append(missing_date)

                    break

            elif frequency == PD_FREQUENCY_LEVEL.quarterly:
                quarter = get_current_quarter_for_a_month(missing_date.month)
                end_quarter_date = get_last_date_of_a_quarter(
                    missing_date.year, quarter=quarter)

                quarter_day_delta = (end_quarter_date - missing_date).days

                # See if we got more days to go but we are at the last day of
                # the quarter
                if quarter_day_delta == 0:
                    # If current missing date is in same month as today's
                    # month, then we know we have exhausted day_delta_counter
                    # successfully. Exiting
                    if missing_date.month == today.month:
                        day_delta_counter = 0

                    else:
                        day_delta_counter -= 1
                        can_add = False

                # Check if we should proceed to next date
                elif day_delta >= quarter_day_delta:
                    # If day_delta_counter has more days to create
                    if day_delta_counter >= quarter_day_delta:
                        day_delta_counter -= quarter_day_delta

                    # We have exhausted day_delta_counter successfully. Exiting
                    else:
                        day_delta_counter = 0

                else:
                    break

            # Only add new date if it's later than start date
            if indicator_start_date <= missing_date and can_add:
                date_list.append(missing_date)

    return date_list
