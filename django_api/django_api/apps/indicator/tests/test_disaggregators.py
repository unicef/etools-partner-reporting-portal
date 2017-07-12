from itertools import combinations

from django.test import TestCase

from core.helpers import (
    generate_data_combination_entries,
    get_cast_dictionary_keys_as_tuple,
    get_cast_dictionary_keys_as_string,
)

from indicator.models import Reportable, IndicatorReport, IndicatorBlueprint
from indicator.disaggregators import (
    QuantityIndicatorDisaggregator,
    RatioIndicatorDisaggregator
)


class TestQuantityIndicatorDisaggregator(TestCase):

    def setUp(self):
        pass

    def test_post_process(self):
        pass


class TestRatioIndicatorDisaggregator(TestCase):

    def setUp(self):
        pass

    def test_post_process(self):
        pass
