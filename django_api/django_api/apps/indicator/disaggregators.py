"""
Disaggregated data handling.

Classes that handle the saving, sub-total caluclations etc. relating to
indicator location data being saved for any disaggregation types.
"""


from core.helpers import (
    get_all_subkeys,
    calculate_sum,
    get_zero_dict,
    get_cast_dictionary_keys_as_tuple,
    get_cast_dictionary_keys_as_string,
)
from indicator.constants import ValueType


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


class QuantityIndicatorDisaggregator(BaseDisaggregator):
    """
    A class for Quantity indicator type disaggregation processing.
    post_process will auto-calculate N - 1 level_reported subtotals
    """
    @staticmethod
    def post_process(indicator_location_data):
        vt = ValueType.VALUE
        dt = ValueType.DENOMINATOR
        ct = ValueType.CALCULATED

        level_reported = indicator_location_data.level_reported
        # copy of idl.disaggregation with the keys converted tuples from the original string type
        disagg = get_cast_dictionary_keys_as_tuple(indicator_location_data.disaggregation)

        calc_data = {}
        for k in disagg.keys():
            if len(k) == level_reported:
                calc_data[k] = {
                    vt: disagg[k][vt],
                    ct: disagg[k][vt],
                    dt: 1
                }
                for sk in get_all_subkeys(k):
                    if sk not in calc_data:
                        calc_data[sk] = get_zero_dict("SUM")
                    calc_data[sk] = calculate_sum(calc_data[k], calc_data[sk])

        disaggregation = get_cast_dictionary_keys_as_string(calc_data)

        indicator_location_data.disaggregation = disaggregation
        indicator_location_data.save()

        indicator_report = indicator_location_data.indicator_report
        QuantityIndicatorDisaggregator.calculate_indicator_report_total(indicator_report)

    @staticmethod
    def calculate_indicator_report_total(indicator_report):
        # Importing here to avoid circular dependencies
        from indicator.models import IndicatorBlueprint

        # Reset the IndicatorReport total
        ir_total = {
            ValueType.CALCULATED: 0,
            ValueType.DENOMINATOR: 1,
            ValueType.VALUE: 0
        }

        ilds = indicator_report.indicator_location_data.all()
        loc_count = ilds.count()

        # IndicatorReport total calculation
        if indicator_report.calculation_formula_across_locations == IndicatorBlueprint.MAX \
                and loc_count > 0:
            max_total_loc = max(
                ilds,
                key=lambda item: item.disaggregation['()'][ValueType.VALUE]
            )

            ir_total = max_total_loc.disaggregation['()']
        else:
            for loc_data in ilds:
                loc_total = loc_data.disaggregation['()']

                ir_total[ValueType.VALUE] += loc_total[ValueType.VALUE]
                ir_total[ValueType.CALCULATED] += loc_total[ValueType.CALCULATED]

        if indicator_report.calculation_formula_across_locations == IndicatorBlueprint.AVG \
                and loc_count > 0:
            ir_total[ValueType.VALUE] = ir_total[ValueType.VALUE] / (loc_count * 1.0)
            ir_total[ValueType.CALCULATED] = ir_total[ValueType.CALCULATED] / (loc_count * 1.0)

        indicator_report.total = ir_total
        indicator_report.save()



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
        vt = ValueType.VALUE
        dt = ValueType.DENOMINATOR
        ct = ValueType.CALCULATED

        level_reported = indicator_location_data.level_reported

        disagg = get_cast_dictionary_keys_as_tuple(
            indicator_location_data.disaggregation)

        calc_data = {}
        for k in disagg.keys():
            if len(k) == level_reported:
                calc_data[k] = {
                    vt: disagg[k][vt],
                    ct: disagg[k][vt] / float(disagg[k][dt]) if disagg[k][dt] else 0,
                    dt: disagg[k][dt]
                }
                for sk in get_all_subkeys(k):
                    if sk not in calc_data:
                        calc_data[sk] = get_zero_dict("SUM")
                    calc_data[sk] = calculate_sum(calc_data[k], calc_data[sk])

        indicator_location_data.disaggregation = get_cast_dictionary_keys_as_string(calc_data)
        indicator_location_data.save()

        indicator_report = indicator_location_data.indicator_report

        RatioIndicatorDisaggregator.calculate_indicator_report_total(
            indicator_report)

    @staticmethod
    def calculate_indicator_report_total(indicator_report):
        # Importing here to avoid circular dependencies
        from indicator.models import IndicatorBlueprint

        # Reset the IndicatorReport total
        ir_total = {
            ValueType.CALCULATED: 0,
            ValueType.DENOMINATOR: 0,
            ValueType.VALUE: 0,
        }

        ilds = indicator_report.indicator_location_data.all()
        loc_count = ilds.count()

        for loc_data in ilds:
            loc_total = loc_data.disaggregation['()']

            ir_total[ValueType.VALUE] += loc_total[ValueType.VALUE]
            ir_total[ValueType.DENOMINATOR] += loc_total[ValueType.DENOMINATOR]

        if loc_count > 0:
            if ir_total[ValueType.DENOMINATOR]:
                ir_total[ValueType.CALCULATED] = ir_total[ValueType.VALUE] / (ir_total[ValueType.DENOMINATOR] * 1.0)

            if indicator_report.reportable.blueprint.display_type == IndicatorBlueprint.PERCENTAGE:
                ir_total[ValueType.CALCULATED] *= 100

        indicator_report.total = ir_total
        indicator_report.save()
