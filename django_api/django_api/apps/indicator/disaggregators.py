"""
Disaggregated data handling.

Classes that handle the saving, sub-total caluclations etc. relating to
indicator location data being saved for any disaggregation types.
"""


from core.helpers import (
    generate_data_combination_entries,
    get_cast_dictionary_keys_as_tuple,
    get_cast_dictionary_keys_as_string,
)

from indicator.models import Reportable, IndicatorReport, IndicatorBlueprint


class BaseDisaggregator(object):
    """
    A class for disaggregation processing.
    Each staticmethod should accept a Python dictionary that represents a
    serialized IndicatorLocationData object.
    """
    @staticmethod
    def post_process(indicator_location_data):
        """
        Main goals of this function call are to:
        #1 calculate all the sub-totals needed for the indicator location
        data, based on level reported.
        #2 Update the total on the indicator report itself.
        """
        raise NotImplementedError()


# TODO: Write functional test case for QuantityIndicatorDisaggregator
class QuantityIndicatorDisaggregator(BaseDisaggregator):
    """
    A class for Quantity indicator type disaggregation processing.
    post_process will auto-calculate N - 1 level_reported subtotals
    """
    @staticmethod
    def post_process(indicator_location_data):
        level_reported = indicator_location_data.level_reported

        ordered_dict = get_cast_dictionary_keys_as_tuple(
            indicator_location_data.disaggregation)

        ordered_dict_keys = list(ordered_dict.keys())

        if level_reported == 0:
            ordered_dict[tuple()]["d"] = 1
            ordered_dict[tuple()]["c"] = ordered_dict[tuple()]["v"]

        else:
            # Reset all subtotals
            for key in ordered_dict_keys:
                if len(key) == level_reported:
                    ordered_dict[key]["d"] = 1
                    ordered_dict[key]["c"] = ordered_dict[key]["v"]

                    packed_key = map(lambda item: tuple([item]), key)
                    subkey_combinations = generate_data_combination_entries(
                        packed_key,
                        entries_only=True,
                        key_type=tuple,
                        r=level_reported - 1
                    )

                    for subkey in subkey_combinations:
                        ordered_dict[subkey] = {
                            'c': 0,
                            'd': 1,
                            'v': 0,
                        }

            ordered_dict_keys = list(ordered_dict.keys())

            # Calculating subtotals
            for key in ordered_dict_keys:
                if len(key) == level_reported:
                    packed_key = map(lambda item: tuple([item]), key)
                    subkey_combinations = generate_data_combination_entries(
                        packed_key,
                        entries_only=True,
                        key_type=tuple,
                        r=level_reported - 1
                    )

                    # It is always SUM at IndicatorLocationData level
                    for subkey in subkey_combinations:
                        ordered_dict[subkey]["v"] += \
                            ordered_dict[key]["v"]

                        ordered_dict[subkey]["c"] += \
                            ordered_dict[key]["c"]

        ordered_dict = get_cast_dictionary_keys_as_string(ordered_dict)

        indicator_location_data.disaggregation = ordered_dict
        indicator_location_data.save()

        # Reset the IndicatorReport total
        ir_total = {
            'c': 0,
            'd': 0,
            'v': 0,
        }
        ir_total['d'] = 1

        indicator_report = indicator_location_data.indicator_report

        # IndicatorReport total calculation
        if indicator_report.calculation_formula_across_locations == IndicatorBlueprint.MAX:
            max_total_loc = max(
                indicator_report.indicator_location_data.all(),
                key=lambda item: item.disaggregation['()']['v'])

            ir_total = max_total_loc.disaggregation['()']

        else:
            for loc_data in indicator_report.indicator_location_data.all():
                loc_total = loc_data.disaggregation['()']

                ir_total['v'] += loc_total['v']
                ir_total['c'] += loc_total['c']

        if indicator_report.calculation_formula_across_locations == IndicatorBlueprint.AVG:
            loc_count = indicator_report.indicator_location_data.count()

            ir_total['v'] = ir_total['v'] / (loc_count * 1.0)
            ir_total['c'] = ir_total['c'] / (loc_count * 1.0)

        indicator_report.total = ir_total
        indicator_report.save()


# TODO: Write functional test case for RatioIndicatorDisaggregator
class RatioIndicatorDisaggregator(BaseDisaggregator):
    """
    A class for Ratio indicator type disaggregation processing.
    """

    @staticmethod
    def post_process(indicator_location_data):
        """
        post_process will perform the followings:
        1. Calculate SUM of all v and d for all level_reported.
        2. Calculate c value from v and d for all level_reported entries.
        """
        level_reported = indicator_location_data.level_reported

        ordered_dict = get_cast_dictionary_keys_as_tuple(
            indicator_location_data.disaggregation)

        ordered_dict_keys = list(ordered_dict.keys())

        if level_reported != 0:
            # Reset all subtotals
            for key in ordered_dict_keys:
                if len(key) == level_reported:
                    packed_key = map(lambda item: tuple([item]), key)
                    subkey_combinations = generate_data_combination_entries(
                        packed_key,
                        entries_only=True,
                        key_type=tuple,
                        r=level_reported - 1
                    )

                    for subkey in subkey_combinations:
                        ordered_dict[subkey] = {
                            'c': 0,
                            'd': 0,
                            'v': 0,
                        }

            # Calculating subtotals
            for key in ordered_dict_keys:
                if len(key) == level_reported:
                    packed_key = map(lambda item: tuple([item]), key)
                    subkey_combinations = generate_data_combination_entries(
                        packed_key,
                        entries_only=True,
                        key_type=tuple,
                        r=level_reported - 1
                    )

                    # It is always SUM at IndicatorLocationData level
                    for subkey in subkey_combinations:
                        ordered_dict[subkey]["v"] += \
                            ordered_dict[key]["v"]

                        ordered_dict[subkey]["d"] += \
                            ordered_dict[key]["d"]

        # Calculating all level_reported N c values
        for key in ordered_dict_keys:
            if ordered_dict[key]["v"] == 0 and ordered_dict[key]["d"] == 0:
                ordered_dict[key]["c"] = 0
            elif ordered_dict[key]["d"] == 0:
                raise Exception(
                    'Denominator is 0 when numerator is not for {}'.format(key))
            else:
                ordered_dict[key]["c"] = ordered_dict[key]["v"] / \
                    (ordered_dict[key]["d"] * 1.0)

        ordered_dict = get_cast_dictionary_keys_as_string(ordered_dict)

        indicator_location_data.disaggregation = ordered_dict
        indicator_location_data.save()

        # Reset the IndicatorReport total
        ir_total = {
            'c': 0,
            'd': 0,
            'v': 0,
        }

        indicator_report = indicator_location_data.indicator_report

        for loc_data in indicator_report.indicator_location_data.all():
            loc_total = loc_data.disaggregation['()']

            ir_total['v'] += loc_total['v']
            ir_total['d'] += loc_total['d']

        ir_total["c"] = ir_total["v"] / (ir_total["d"] * 1.0)

        indicator_report.total = ir_total
        indicator_report.save()


class LikertScaleIndicatorDisaggregator(BaseDisaggregator):
    """
    A class for Likert scale indicator type disaggregation processing.
    """

    """
    post_process will perform the followings:
    1. Calculate N - 1 level_reported subtotals
    2. Calculate c value from v and d.
    """
    @staticmethod
    def post_process(data_dict):
        return data_dict


class YesNoIndicatorDisaggregator(BaseDisaggregator):
    """
    A class for Yes/No indicator type disaggregation processing.
    """

    """
    post_process will perform the followings:
    1. Calculate N - 1 level_reported subtotals
    2. Calculate c value from v and d.
    """
    @staticmethod
    def post_process(data_dict):
        return data_dict
