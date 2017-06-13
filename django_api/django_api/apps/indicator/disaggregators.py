class BaseDisaggregator(object):
    @staticmethod
    def pre_process():
        raise NotImplementedError()

    @staticmethod
    def post_process():
        raise NotImplementedError()


class QuantityIndicatorDisaggregator(BaseDisaggregator):
    @staticmethod
    def pre_process(data_dict):
        return data_dict

    @staticmethod
    def post_process(data_dict):
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
