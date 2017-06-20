from itertools import combinations

from indicator.models import Reportable, IndicatorReport


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
    def post_process(data_dict, disaggregation_id_map):
        # TODO: Auto-calculate n - 1 level_reported combination total entries
        for location_data in data_dict['indicator_location_data']:
            num_disaggregation = location_data["num_disaggregation"]
            level_reported = location_data["level_reported"]
            disaggs_reported_on = location_data["disaggs_reported_on"]

        return data_dict


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
