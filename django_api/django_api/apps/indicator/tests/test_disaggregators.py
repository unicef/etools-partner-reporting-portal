from core.tests.base import BaseAPITestCase

from indicator.models import Reportable, IndicatorBlueprint
from indicator.disaggregators import (
    QuantityIndicatorDisaggregator,
    RatioIndicatorDisaggregator
)


class TestQuantityIndicatorDisaggregator5(BaseAPITestCase):
    generate_fake_data_quantity = 3

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

    def test_post_process_reporting_period_sum_calc(self):
        unit_type = IndicatorBlueprint.NUMBER
        calc_type = IndicatorBlueprint.SUM

        indicator = Reportable.objects.filter(
            blueprint__unit=unit_type,
            blueprint__calculation_formula_across_periods=calc_type,
        ).first()

        indicator_report = indicator.indicator_reports.first()
        report_total = 0

        for loc_data in indicator_report.indicator_location_data.all():
            QuantityIndicatorDisaggregator.post_process(loc_data)

        for report in indicator.indicator_reports.all():
            report_total += report.total['c']

        self.assertEquals(indicator.total['c'], report_total)

    def test_post_process_reporting_period_max_calc(self):
        unit_type = IndicatorBlueprint.NUMBER
        calc_type = IndicatorBlueprint.MAX

        indicator = Reportable.objects.filter(
            blueprint__unit=unit_type,
            blueprint__calculation_formula_across_periods=calc_type,
        ).first()

        indicator_report = indicator.indicator_reports.first()
        report_total = 0

        for loc_data in indicator_report.indicator_location_data.all():
            QuantityIndicatorDisaggregator.post_process(loc_data)

        for report in indicator.indicator_reports.all():
            if report.total['c'] > report_total:
                report_total = report.total['c']

        self.assertEquals(indicator.total['c'], report_total)

    def test_post_process_reporting_period_avg_calc(self):
        unit_type = IndicatorBlueprint.NUMBER
        calc_type = IndicatorBlueprint.AVG

        indicator = Reportable.objects.filter(
            blueprint__unit=unit_type,
            blueprint__calculation_formula_across_periods=calc_type,
        ).first()

        indicator_report = indicator.indicator_reports.first()
        report_total = 0

        for loc_data in indicator_report.indicator_location_data.all():
            QuantityIndicatorDisaggregator.post_process(loc_data)

        for report in indicator.indicator_reports.all():
            report_total += report.total['c']

        report_total /= (indicator.indicator_reports.count() * 1.0)

        self.assertEquals(indicator.total['c'], report_total)


class TestRatioIndicatorDisaggregator(BaseAPITestCase):
    generate_fake_data_quantity = 3

    def test_post_process_location_ratio_calc(self):
        unit_type = IndicatorBlueprint.PERCENTAGE
        calc_type = IndicatorBlueprint.RATIO

        indicator = Reportable.objects.filter(
            blueprint__unit=unit_type,
            blueprint__calculation_formula_across_locations=calc_type,
        ).first()

        indicator_report = indicator.indicator_reports.first()
        v_total = 0
        d_total = 0

        for loc_data in indicator_report.indicator_location_data.all():
            RatioIndicatorDisaggregator.post_process(loc_data)
            v_total += loc_data.disaggregation['()']['v']
            d_total += loc_data.disaggregation['()']['d']

        ratio_value = v_total / (d_total * 1.0)

        self.assertEquals(indicator_report.total['c'], ratio_value)

    def test_post_process_reporting_period_ratio_calc(self):
        unit_type = IndicatorBlueprint.PERCENTAGE
        calc_type = IndicatorBlueprint.RATIO

        indicator = Reportable.objects.filter(
            blueprint__unit=unit_type,
            blueprint__calculation_formula_across_periods=calc_type,
        ).first()

        indicator_report = indicator.indicator_reports.first()
        v_total = 0
        d_total = 0

        for loc_data in indicator_report.indicator_location_data.all():
            RatioIndicatorDisaggregator.post_process(loc_data)

        for report in indicator.indicator_reports.all():
            v_total += report.total['v']
            d_total += report.total['d']

        ratio_value = v_total / (d_total * 1.0)

        self.assertEquals(indicator.total['c'], ratio_value)
