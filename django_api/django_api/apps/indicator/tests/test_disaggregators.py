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
        unit_type = IndicatorBlueprint.NUMBER
        calc_type = IndicatorBlueprint.SUM

        indicator = Reportable.objects.filter(
            blueprint__unit=unit_type,
            blueprint__calculation_formula_across_locations=calc_type,
        ).first()

        indicator_report = indicator.indicator_reports.first()
        loc_total = 0

        for loc_data in indicator_report.indicator_location_data.all():
            QuantityIndicatorDisaggregator.post_process(loc_data)
            loc_total += loc_data.disaggregation['()']['c']

        self.assertEquals(indicator_report.total['c'], loc_total)

    def test_post_process_location_max_calc(self):
        unit_type = IndicatorBlueprint.NUMBER
        calc_type = IndicatorBlueprint.MAX

        indicator = Reportable.objects.filter(
            blueprint__unit=unit_type,
            blueprint__calculation_formula_across_locations=calc_type,
        ).first()

        indicator_report = indicator.indicator_reports.first()
        max_value = 0

        for loc_data in indicator_report.indicator_location_data.all():
            QuantityIndicatorDisaggregator.post_process(loc_data)

            if loc_data.disaggregation['()']['c'] > max_value:
                max_value = loc_data.disaggregation['()']['c']

        self.assertEquals(indicator_report.total['c'], max_value)

    def test_post_process_location_avg_calc(self):
        unit_type = IndicatorBlueprint.NUMBER
        calc_type = IndicatorBlueprint.AVG

        indicator = Reportable.objects.filter(
            blueprint__unit=unit_type,
            blueprint__calculation_formula_across_locations=calc_type,
        ).first()

        indicator_report = indicator.indicator_reports.first()
        avg_value = 0

        for loc_data in indicator_report.indicator_location_data.all():
            QuantityIndicatorDisaggregator.post_process(loc_data)
            avg_value += loc_data.disaggregation['()']['c']

        avg_value /= (indicator_report.indicator_location_data.count() * 1.0)

        self.assertEquals(indicator_report.total['c'], avg_value)


class TestRatioIndicatorDisaggregator(BaseAPITestCase):
    generate_fake_data_quantity = 40

    def test_post_process_location_percentage_calc(self):
        unit_type = IndicatorBlueprint.RATIO
        calc_type = IndicatorBlueprint.PERCENTAGE

        indicator = Reportable.objects.filter(
            blueprint__unit=unit_type,
            blueprint__calculation_formula_across_locations=calc_type,
        ).first()

        indicator_report = indicator.indicator_reports.first()
        loc_total = 0

        for loc_data in indicator_report.indicator_location_data.all():
            QuantityIndicatorDisaggregator.post_process(loc_data)
            loc_total += loc_data.disaggregation['()']['c']

        self.assertEquals(indicator_report.total['c'], loc_total)
