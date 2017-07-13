from itertools import combinations

from core.tests.base import BaseAPITestCase
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


class TestQuantityIndicatorDisaggregator(BaseAPITestCase):
    generate_fake_data_quantity = 40

    def test_post_process_location_sum_calc(self):
        number_type = IndicatorBlueprint.NUMBER
        sum_type = IndicatorBlueprint.SUM

        quantity_type_indicator = Reportable.objects.filter(
            blueprint__unit=number_type,
            blueprint__calculation_formula_across_locations=sum_type,
        ).first()

        indicator_location_data = IndicatorLocationData.objects.filter(
            indicator_report__reportable=quantity_type_indicator,
        ).first()

    def test_post_process_location_max_calc(self):
        number_type = IndicatorBlueprint.NUMBER
        max_type = IndicatorBlueprint.MAX

        quantity_type_indicator = Reportable.objects.filter(
            blueprint__unit=number_type,
            blueprint__calculation_formula_across_locations=max_type,
        ).first()

        indicator_location_data = IndicatorLocationData.objects.filter(
            indicator_report__reportable=quantity_type_indicator,
        ).first()

    def test_post_process_location_avg_calc(self):
        number_type = IndicatorBlueprint.NUMBER
        avg_type = IndicatorBlueprint.AVG

        quantity_type_indicator = Reportable.objects.filter(
            blueprint__unit=number_type,
            blueprint__calculation_formula_across_locations=avg_type,
        ).first()

        indicator_location_data = IndicatorLocationData.objects.filter(
            indicator_report__reportable=quantity_type_indicator,
        ).first()


class TestRatioIndicatorDisaggregator(BaseAPITestCase):
    generate_fake_data_quantity = 40

    def test_post_process_location_percentage_calc(self):
        number_type = IndicatorBlueprint.RATIO
        percentage_type = IndicatorBlueprint.PERCENTAGE

        quantity_type_indicator = Reportable.objects.filter(
            blueprint__unit=number_type,
            blueprint__calculation_formula_across_locations=percentage_type,
        ).first()

        indicator_location_data = IndicatorLocationData.objects.filter(
            indicator_report__reportable=quantity_type_indicator,
        ).first()
