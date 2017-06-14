from itertools import combinations

from indicator.models import Reportable, IndicatorReport


class BaseDisaggregator(object):
    """
    A class for disaggregation processing. Each staticmethod should accept a Python dictionary that represents a serialized IndicatorReport object.
    """
    @staticmethod
    def pre_process():
        raise NotImplementedError()

    @staticmethod
    def post_process():
        raise NotImplementedError()


class QuantityIndicatorDisaggregator(BaseDisaggregator):

    """
    A class for Quantity indicator type disaggregation processing. pre_process will be skipped as the data denominator will always be 1.
    """
    @staticmethod
    def pre_process(data_dict):
        return data_dict

    @staticmethod
    def post_process(data_dict, disaggregation_id_map):
        # Iterate each IndicatorLocationData
        for location_data in data_dict['indicator_location_data']:
            num_disaggregation = location_data["num_disaggregation"]
            level_reported = location_data["level_reported"]
            disaggs_reported_on = location_data["disaggs_reported_on"]

        return data_dict


class RatioIndicatorDisaggregator(BaseDisaggregator):
    @staticmethod
    def pre_process(data_dict):
        return data_dict

    @staticmethod
    def post_process(data_dict):
        return data_dict


class LikertScaleIndicatorDisaggregator(BaseDisaggregator):
    @staticmethod
    def pre_process(data_dict):
        return data_dict

    @staticmethod
    def post_process(data_dict):
        return data_dict


class YesNoIndicatorDisaggregator(BaseDisaggregator):
    @staticmethod
    def pre_process(data_dict):
        return data_dict

    @staticmethod
    def post_process(data_dict):
        return data_dict
