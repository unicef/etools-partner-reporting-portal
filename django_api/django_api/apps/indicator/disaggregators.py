from itertools import combinations

from core.helpers import (
    generate_data_combination_entries,
    get_cast_dictionary_keys_as_tuple,
    get_cast_dictionary_keys_as_string,
)

from indicator.models import Reportable, IndicatorReport, IndicatorBlueprint


class BaseDisaggregator(object):
    """
    A class for disaggregation processing.
    Each staticmethod should accept a Python dictionary
    that represents a serialized IndicatorReport object.
    """
    @staticmethod
    def pre_process():
        raise NotImplementedError()

    @staticmethod
    def post_process():
        raise NotImplementedError()


class QuantityIndicatorDisaggregator(BaseDisaggregator):
    """
    A class for Quantity indicator type disaggregation processing.
    post_process will auto-calculate N - 1 level_reported subtotals
    """

    @staticmethod
    def pre_process():
        raise NotImplementedError()

    @staticmethod
    def post_process(indicator_location_data):
        level_reported = indicator_location_data.level_reported
        blueprint = indicator_location_data \
            .indicator_report.reportable.blueprint

        ordered_dict = get_cast_dictionary_keys_as_tuple(
            indicator_location_data.disaggregation)

        if level_reported != 0:
            # Reset all subtotals
            for key in ordered_dict:
                if len(key) < level_reported:
                    ordered_dict[key]["v"] = 0
                    ordered_dict[key]["d"] = 0
                    ordered_dict[key]["c"] = 0

            # Calculating subtotals
            for key in ordered_dict:
                if len(key) == level_reported:
                    packed_key = map(lambda item: tuple([item]), key)
                    subkey_combinations = generate_data_combination_entries(packed_key, entries_only=True, string_key=False, r=level_reported - 1)

                    # TODO: Handle different calculation method here. May need to refactor each calculation method as each method
                    if blueprint.calculation_formula == IndicatorBlueprint.SUM:
                        for subkey in subkey_combinations:
                            ordered_dict[subkey]["v"] += \
                                ordered_dict[key]["v"]

        ordered_dict = get_cast_dictionary_keys_as_string(ordered_dict)

        indicator_location_data.disaggregation = ordered_dict
        indicator_location_data.save()


class RatioIndicatorDisaggregator(BaseDisaggregator):
    """
    A class for Ratio indicator type disaggregation processing.
    """

    """
    post_process will perform the followings:
    1. Calculate N - 1 level_reported subtotals
    2. Calculate c value from v and d.
    """
    @staticmethod
    def pre_process():
        raise NotImplementedError()

    @staticmethod
    def post_process(data_dict):
        return data_dict


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
    def pre_process():
        raise NotImplementedError()

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
    def pre_process():
        raise NotImplementedError()

    @staticmethod
    def post_process(data_dict):
        return data_dict
