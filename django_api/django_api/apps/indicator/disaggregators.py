"""
Disaggregated data handling.

Classes that handle the saving, sub-total caluclations etc. relating to
indicator location data being saved for any disaggregation types.
"""


from core.helpers import (
    generate_data_combination_entries,
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
        level_reported = indicator_location_data.level_reported

        ordered_dict = get_cast_dictionary_keys_as_tuple(
            indicator_location_data.disaggregation)

        ordered_dict_keys = list(ordered_dict.keys())

        if level_reported == 0:
            ordered_dict[tuple()][ValueType.DENOMINATOR] = 1
            ordered_dict[tuple()][ValueType.CALCULATED] = ordered_dict[tuple()][ValueType.VALUE]

        else:
            # Reset all subtotals
            for key in ordered_dict_keys:
                if len(key) == level_reported:
                    ordered_dict[key][ValueType.DENOMINATOR] = 1
                    ordered_dict[key][ValueType.CALCULATED] = ordered_dict[key][ValueType.VALUE]

                    packed_key = map(lambda item: tuple([item]), key)
                    subkey_combinations = generate_data_combination_entries(
                        packed_key,
                        entries_only=True,
                        key_type=tuple,
                        r=level_reported - 1
                    )

                    for subkey in subkey_combinations:
                        ordered_dict[subkey] = {
                            ValueType.CALCULATED: 0,
                            ValueType.DENOMINATOR: 1,
                            ValueType.VALUE: 0,
                        }

            ordered_dict_keys = list(ordered_dict.keys())

            # Calculating subtotals
            for key in ordered_dict_keys:
                if len(key) == level_reported:
                    packed_key = map(lambda item: tuple([item]), key)
                    subkey_combinations = generate_data_combination_entries(
                        packed_key,
                        entries_only=True,
                        key_type=tuple,
                        r=level_reported - 1
                    )

                    # It is always SUM at IndicatorLocationData level
                    for subkey in subkey_combinations:
                        # Ignore zero value entry from total calculation
                        if ordered_dict[key][ValueType.VALUE] != 0:
                            ordered_dict[subkey][ValueType.VALUE] += ordered_dict[key][ValueType.VALUE]

                        if ordered_dict[key][ValueType.CALCULATED] != 0:
                            ordered_dict[subkey][ValueType.CALCULATED] += ordered_dict[key][ValueType.CALCULATED]

        ordered_dict = get_cast_dictionary_keys_as_string(ordered_dict)

        indicator_location_data.disaggregation = ordered_dict
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
        level_reported = indicator_location_data.level_reported

        ordered_dict = get_cast_dictionary_keys_as_tuple(
            indicator_location_data.disaggregation)

        ordered_dict_keys = list(ordered_dict.keys())

        if level_reported != 0:
            # Reset all subtotals
            for key in ordered_dict_keys:
                if len(key) == level_reported:
                    packed_key = map(lambda item: tuple([item]), key)
                    subkey_combinations = generate_data_combination_entries(
                        packed_key,
                        entries_only=True,
                        key_type=tuple,
                        r=level_reported - 1
                    )

                    for subkey in subkey_combinations:
                        ordered_dict[subkey] = {
                            ValueType.CALCULATED: 0,
                            ValueType.DENOMINATOR: 0,
                            ValueType.VALUE: 0,
                        }

            # Calculating subtotals
            for key in ordered_dict_keys:
                if len(key) == level_reported:
                    packed_key = map(lambda item: tuple([item]), key)
                    subkey_combinations = generate_data_combination_entries(
                        packed_key,
                        entries_only=True,
                        key_type=tuple,
                        r=level_reported - 1
                    )

                    # It is always SUM at IndicatorLocationData level
                    for subkey in subkey_combinations:
                        # Ignore zero value entry from total calculation
                        if ordered_dict[key][ValueType.VALUE] != 0:
                            ordered_dict[subkey][ValueType.VALUE] += \
                                ordered_dict[key][ValueType.VALUE]

                        # Ignore zero value entry from total calculation
                        if ordered_dict[key][ValueType.DENOMINATOR] != 0:
                            ordered_dict[subkey][ValueType.DENOMINATOR] += \
                                ordered_dict[key][ValueType.DENOMINATOR]

        # Calculating all level_reported N c values
        for key in ordered_dict.keys():
            if ordered_dict[key][ValueType.VALUE] == 0 and ordered_dict[key][ValueType.DENOMINATOR] == 0:
                ordered_dict[key][ValueType.CALCULATED] = 0
            elif ordered_dict[key][ValueType.DENOMINATOR] == 0:
                raise Exception(
                    'Denominator is 0 when numerator is not for {}'.format(key))
            else:
                ordered_dict[key][ValueType.CALCULATED] = ordered_dict[key][ValueType.VALUE] / \
                    (ordered_dict[key][ValueType.DENOMINATOR] * 1.0)

        ordered_dict = get_cast_dictionary_keys_as_string(ordered_dict)

        indicator_location_data.disaggregation = ordered_dict
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
