from itertools import combinations

from core.helpers import (
    get_sorted_ordered_dict_by_keys,
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
        # TODO: Auto-calculate n - 1 level_reported combination total entries
        num_disaggregation = indicator_location_data.num_disaggregation
        level_reported = indicator_location_data.level_reported
        blueprint = indicator_location_data \
            .indicator_report.reportable.blueprint

        ordered_dict = get_cast_dictionary_keys_as_tuple(
            indicator_location_data.disaggregation)

        ordered_dict = get_sorted_ordered_dict_by_keys(
            ordered_dict, reverse=True)

        if level_reported != 0:
            # Reset all subtotals
            for key in ordered_dict:
                if len(key) < level_reported:
                    ordered_dict[key]["v"] = 0
                    ordered_dict[key]["d"] = 0
                    ordered_dict[key]["c"] = 0

            # Calculating subtotals
            for key in ordered_dict:
                if len(key) != 0:
                    subtotal_key = key[:-1]

                    if blueprint.calculation_formula == IndicatorBlueprint.SUM:
                        ordered_dict[subtotal_key]["v"] += \
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
