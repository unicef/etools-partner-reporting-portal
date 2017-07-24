import random
import datetime
from itertools import combinations

from indicator.models import (
    IndicatorBlueprint,
    Reportable,
    IndicatorReport,
)
from indicator.disaggregators import (
    QuantityIndicatorDisaggregator,
    RatioIndicatorDisaggregator,
)
from core.models import (
    Location,
)
from core.helpers import (
    generate_data_combination_entries,
)

from core.factories import (
    IndicatorLocationDataFactory,
    LocationFactory,
    QuantityIndicatorReportFactory,
    RatioIndicatorReportFactory,
    QuantityReportableToClusterObjectiveFactory,
    DisaggregationFactory,
    DisaggregationValueFactory,
)


def generate_0_num_disagg_data(reportable, indicator_type="quantity"):
    # IndicatorReport from QuantityReportableToLowerLevelOutput -
    # IndicatorLocationData
    if reportable.locations.count() == 0:
        LocationFactory(reportable=reportable)

    location = reportable.locations.first()
    disagg_idx = 0

    for idx, indicator_report_from_reportable in enumerate(reportable.indicator_reports.all()):
        if indicator_type == "quantity":
            disaggregation = {
                '()': {
                    'v': random.randint(50, 1000),
                    'd': 0,
                    'c': 0
                }
            }

        elif indicator_type == "ratio":
            disaggregation = {
                '()': {
                    'v': random.randint(50, 1000),
                    'd': random.randint(2000, 4000),
                    'c': 0
                }
            }

        # 0 num_disaggregation & 0 level_reported
        location_data = IndicatorLocationDataFactory(
            indicator_report=indicator_report_from_reportable,
            location=location,
            num_disaggregation=0,
            level_reported=0,
            disaggregation_reported_on=list(),
            disaggregation=disaggregation
        )


def generate_1_num_disagg_data(reportable, indicator_type="quantity"):
    # IndicatorReport from QuantityReportableToLowerLevelOutput -
    # IndicatorLocationData
    locations = Location.objects.all()

    for idx, indicator_report_from_reportable in enumerate(reportable.indicator_reports.all()):
        disagg_idx = 0

        # 1 num_disaggregation & 0 level_reported
        location = locations[disagg_idx]

        if indicator_type == "quantity":
            disaggregation = {
                '()': {
                    'v': random.randint(50, 1000),
                    'd': 0,
                    'c': 0
                }
            }

        elif indicator_type == "ratio":
            disaggregation = {
                '()': {
                    'v': random.randint(50, 1000),
                    'd': random.randint(2000, 4000),
                    'c': 0
                }
            }

        location_data = IndicatorLocationDataFactory(
            indicator_report=indicator_report_from_reportable,
            location=location,
            num_disaggregation=1,
            level_reported=0,
            disaggregation_reported_on=list(),
            disaggregation=disaggregation,
        )

        if indicator_type == "quantity":
            QuantityIndicatorDisaggregator.post_process(location_data)

        elif indicator_type == "ratio":
            RatioIndicatorDisaggregator.post_process(location_data)

        disagg_idx += 1

        # 1 num_disaggregation & 1 level_reported
        disaggregation_comb_1_pairs = list(combinations(list(
            indicator_report_from_reportable.disaggregations.values_list('id', flat=True)), 1))

        for pair in disaggregation_comb_1_pairs:
            location = locations[disagg_idx]

            location_data = IndicatorLocationDataFactory(
                indicator_report=indicator_report_from_reportable,
                location=location,
                num_disaggregation=1,
                level_reported=1,
                disaggregation_reported_on=pair,
                disaggregation=generate_data_combination_entries(
                    indicator_report_from_reportable.disaggregation_values(
                        id_only=True, filter_by_id__in=pair), indicator_type=indicator_type, r=1
                )
            )

            if indicator_type == "quantity":
                QuantityIndicatorDisaggregator.post_process(location_data)

            elif indicator_type == "ratio":
                RatioIndicatorDisaggregator.post_process(location_data)

            disagg_idx += 1


def generate_2_num_disagg_data(reportable, indicator_type="quantity"):
    # IndicatorReport from QuantityReportableToLowerLevelOutput -
    # IndicatorLocationData
    locations = Location.objects.all()

    for idx, indicator_report_from_reportable in enumerate(reportable.indicator_reports.all()):
        disagg_idx = 0

        # 2 num_disaggregation & 0 level_reported
        location = locations[disagg_idx]

        if indicator_type == "quantity":
            disaggregation = {
                '()': {
                    'v': random.randint(50, 1000),
                    'd': 0,
                    'c': 0
                }
            }

        elif indicator_type == "ratio":
            disaggregation = {
                '()': {
                    'v': random.randint(50, 1000),
                    'd': random.randint(2000, 4000),
                    'c': 0
                }
            }

        location_data = IndicatorLocationDataFactory(
            indicator_report=indicator_report_from_reportable,
            location=location,
            num_disaggregation=2,
            level_reported=0,
            disaggregation_reported_on=list(),
            disaggregation=disaggregation
        )

        if indicator_type == "quantity":
            QuantityIndicatorDisaggregator.post_process(location_data)

        elif indicator_type == "ratio":
            RatioIndicatorDisaggregator.post_process(location_data)

        disagg_idx += 1

        # 2 num_disaggregation & 1 level_reported
        disaggregation_comb_1_pairs = list(combinations(list(
            indicator_report_from_reportable.disaggregations.values_list('id', flat=True)), 1))

        for pair in disaggregation_comb_1_pairs:
            location = locations[disagg_idx]

            location_data = IndicatorLocationDataFactory(
                indicator_report=indicator_report_from_reportable,
                location=location,
                num_disaggregation=2,
                level_reported=1,
                disaggregation_reported_on=pair,
                disaggregation=generate_data_combination_entries(
                    indicator_report_from_reportable.disaggregation_values(
                        id_only=True, filter_by_id__in=pair), indicator_type=indicator_type, r=1
                )
            )

            if indicator_type == "quantity":
                QuantityIndicatorDisaggregator.post_process(location_data)

            elif indicator_type == "ratio":
                RatioIndicatorDisaggregator.post_process(location_data)

            disagg_idx += 1

        # 2 num_disaggregation & 2 level_reported
        disaggregation_comb_2_pairs = list(combinations(list(
            indicator_report_from_reportable.disaggregations.values_list('id', flat=True)), 2))

        for pair in disaggregation_comb_2_pairs:
            location = locations[disagg_idx]

            location_data = IndicatorLocationDataFactory(
                indicator_report=indicator_report_from_reportable,
                location=location,
                num_disaggregation=2,
                level_reported=2,
                disaggregation_reported_on=pair,
                disaggregation=generate_data_combination_entries(
                    indicator_report_from_reportable.disaggregation_values(
                        id_only=True, filter_by_id__in=pair), indicator_type=indicator_type, r=2
                )
            )

            if indicator_type == "quantity":
                QuantityIndicatorDisaggregator.post_process(location_data)

            elif indicator_type == "ratio":
                RatioIndicatorDisaggregator.post_process(location_data)

            disagg_idx += 1


def generate_3_num_disagg_data(reportable, indicator_type="quantity"):
    # IndicatorReport from QuantityReportableToLowerLevelOutput -
    # IndicatorLocationData
    locations = Location.objects.all()

    for idx, indicator_report_from_reportable in enumerate(reportable.indicator_reports.all()):
        disagg_idx = 0

        # 3 num_disaggregation & 0 level_reported
        location = locations[disagg_idx]

        if indicator_type == "quantity":
            disaggregation = {
                '()': {
                    'v': random.randint(50, 1000),
                    'd': 0,
                    'c': 0
                }
            }

        elif indicator_type == "ratio":
            disaggregation = {
                '()': {
                    'v': random.randint(50, 1000),
                    'd': random.randint(2000, 4000),
                    'c': 0
                }
            }

        location_data = IndicatorLocationDataFactory(
            indicator_report=indicator_report_from_reportable,
            location=location,
            num_disaggregation=3,
            level_reported=0,
            disaggregation_reported_on=list(),
            disaggregation=disaggregation
        )

        if indicator_type == "quantity":
            QuantityIndicatorDisaggregator.post_process(location_data)

        elif indicator_type == "ratio":
            RatioIndicatorDisaggregator.post_process(location_data)

        disagg_idx += 1

        # 3 num_disaggregation & 1 level_reported
        disaggregation_comb_1_pairs = list(combinations(list(
            indicator_report_from_reportable.disaggregations.values_list('id', flat=True)), 1))

        for pair in disaggregation_comb_1_pairs:
            location = locations[disagg_idx]

            location_data = IndicatorLocationDataFactory(
                indicator_report=indicator_report_from_reportable,
                location=location,
                num_disaggregation=3,
                level_reported=1,
                disaggregation_reported_on=pair,
                disaggregation=generate_data_combination_entries(
                    indicator_report_from_reportable.disaggregation_values(
                        id_only=True, filter_by_id__in=pair), indicator_type=indicator_type, r=1
                )
            )

            if indicator_type == "quantity":
                QuantityIndicatorDisaggregator.post_process(location_data)

            elif indicator_type == "ratio":
                RatioIndicatorDisaggregator.post_process(location_data)

            disagg_idx += 1

        # 3 num_disaggregation & 2 level_reported
        disaggregation_comb_2_pairs = list(combinations(list(
            indicator_report_from_reportable.disaggregations.values_list('id', flat=True)), 2))

        for pair in disaggregation_comb_2_pairs:
            location = locations[disagg_idx]

            location_data = IndicatorLocationDataFactory(
                indicator_report=indicator_report_from_reportable,
                location=location,
                num_disaggregation=3,
                level_reported=2,
                disaggregation_reported_on=pair,
                disaggregation=generate_data_combination_entries(
                    indicator_report_from_reportable.disaggregation_values(
                        id_only=True, filter_by_id__in=pair), indicator_type=indicator_type, r=2
                )
            )

            if indicator_type == "quantity":
                QuantityIndicatorDisaggregator.post_process(location_data)

            elif indicator_type == "ratio":
                RatioIndicatorDisaggregator.post_process(location_data)

            disagg_idx += 1

        location = locations[disagg_idx]

        # 3 num_disaggregation & 3 level_reported
        location_data = IndicatorLocationDataFactory(
            indicator_report=indicator_report_from_reportable,
            location=location,
            num_disaggregation=3,
            level_reported=3,
            disaggregation_reported_on=list(
                indicator_report_from_reportable.disaggregations.values_list(
                    'id', flat=True)),
            disaggregation=generate_data_combination_entries(
                indicator_report_from_reportable.disaggregation_values(
                    id_only=True), indicator_type=indicator_type, r=3
            )
        )

        if indicator_type == "quantity":
            QuantityIndicatorDisaggregator.post_process(location_data)

        elif indicator_type == "ratio":
            RatioIndicatorDisaggregator.post_process(location_data)

        disagg_idx += 1

        # Extra IndicatorLocationData for last IndicatorReport for 3
        # num_disaggregation with unique location
        if idx == reportable.indicator_reports.count() - 1:
            location = locations[disagg_idx]

            location_data = IndicatorLocationDataFactory(
                indicator_report=indicator_report_from_reportable,
                location=location,
                num_disaggregation=3,
                level_reported=3,
                disaggregation_reported_on=list(
                    indicator_report_from_reportable.disaggregations.values_list('id', flat=True)),
                disaggregation=generate_data_combination_entries(
                    indicator_report_from_reportable.disaggregation_values(
                        id_only=True), indicator_type=indicator_type, r=3
                )
            )

            if indicator_type == "quantity":
                QuantityIndicatorDisaggregator.post_process(location_data)

            elif indicator_type == "ratio":
                RatioIndicatorDisaggregator.post_process(location_data)


def generate_disaggregation_and_disaggregation_values(reportable, disaggregation_map, disaggregation_targets):
    if len(disaggregation_map.keys()) < len(disaggregation_targets):
        raise Exception("disaggregation_map has less # of disaggregation")

    # Disaggregation generation
    for target in disaggregation_targets:
        if target in disaggregation_map:
            disaggregation = DisaggregationFactory(
                name=target, reportable=reportable)

            for value in disaggregation_map[target]:
                disaggregation_value = DisaggregationValueFactory(
                    value=value, disaggregation=disaggregation)

        else:
            raise Exception(
                "disaggregation_map does not have key %s to create Disaggregation" % (target))


def generate_indicator_report_location_disaggregation_quantity_data(handler):
    # Adding extra IndicatorReport to each QuantityReportableToLowerLevelOutput
    locations = Location.objects.all()

    sample_disaggregation_value_map = {
        "height": ["tall", "medium", "short", "extrashort"],
        "age": ["1-2m", "3-4m", "5-6m", '7-10m', '11-13m', '14-16m'],
        "gender": ["male", "female", "other"],
    }

    if handler.__name__ == 'QuantityReportableToClusterObjectiveFactory':
        queryset = Reportable.objects.filter(
            cluster_objectives__reportables__isnull=False, blueprint__unit=IndicatorBlueprint.NUMBER).order_by('id')
    else:
        queryset = Reportable.objects.filter(
            lower_level_outputs__reportables__isnull=False, blueprint__unit=IndicatorBlueprint.NUMBER).order_by('id')

    for idx, reportable in enumerate(queryset):
        # -- Extra IndicatorReport and IndicatorLocationData --

        # ProgressReport - IndicatorReport from
        # QuantityReportableToLowerLevelOutput
        if handler.__name__ == 'QuantityIndicatorReportFactory':
            indicator_report = QuantityIndicatorReportFactory(reportable=reportable)
            indicator_report.progress_report = reportable.indicator_reports.first().progress_report
            indicator_report.save()

        # -- IndicatorLocationData --

        # -- 0 num_disaggregation generation for 3 entries --
        if idx % 8 == 0:
            print "NO Disaggregation (and DisaggregationValue) objects for {} {} created".format(handler.__name__, idx)

        # -- 1 num_disaggregation generation for 3 entries --
        elif idx % 8 == 1:
            generate_disaggregation_and_disaggregation_values(
                reportable,
                sample_disaggregation_value_map,
                disaggregation_targets=["height"])

            print "Disaggregation (and DisaggregationValue) objects for {} {} created".format(handler.__name__, idx)

        elif idx % 8 == 2:
            generate_disaggregation_and_disaggregation_values(
                reportable,
                sample_disaggregation_value_map,
                disaggregation_targets=["age"])

            print "Disaggregation (and DisaggregationValue) objects for {} {} created".format(handler.__name__, idx)

        elif idx % 8 == 3:
            generate_disaggregation_and_disaggregation_values(
                reportable,
                sample_disaggregation_value_map,
                disaggregation_targets=["gender"])

            print "Disaggregation (and DisaggregationValue) objects for {} {} created".format(handler.__name__, idx)

        # -- 2 num_disaggregation generation for 3 entries --
        elif idx % 8 == 4:
            generate_disaggregation_and_disaggregation_values(
                reportable,
                sample_disaggregation_value_map,
                disaggregation_targets=["height", "age"])

            print "Disaggregation (and DisaggregationValue) objects for {} {} created".format(handler.__name__, idx)

        elif idx % 8 == 5:
            generate_disaggregation_and_disaggregation_values(
                reportable,
                sample_disaggregation_value_map,
                disaggregation_targets=["height", "gender"])

            print "Disaggregation (and DisaggregationValue) objects for {} {} created".format(handler.__name__, idx)

        elif idx % 8 == 6:
            generate_disaggregation_and_disaggregation_values(
                reportable,
                sample_disaggregation_value_map,
                disaggregation_targets=["gender", "age"])

            print "Disaggregation (and DisaggregationValue) objects for {} {} created".format(handler.__name__, idx)

        # -- 3 num_disaggregation generation for 3 entries --
        elif idx % 8 == 7:
            generate_disaggregation_and_disaggregation_values(
                reportable,
                sample_disaggregation_value_map,
                disaggregation_targets=["age", "gender", "height"])

            print "Disaggregation (and DisaggregationValue) objects for {} {} created".format(handler.__name__, idx)

    for idx, reportable in enumerate(queryset):
        # -- 0 num_disaggregation generation for 3 entries --
        if reportable.disaggregation.count() == 0:
            generate_0_num_disagg_data(reportable, indicator_type="quantity")

        # -- 1 num_disaggregation generation for 3 entries --
        elif reportable.disaggregation.count() == 1:
            generate_1_num_disagg_data(reportable, indicator_type="quantity")

        # -- 2 num_disaggregation generation for 3 entries --
        elif reportable.disaggregation.count() == 2:
            generate_2_num_disagg_data(reportable, indicator_type="quantity")

        # -- 3 num_disaggregation generation for 3 entries --
        elif reportable.disaggregation.count() == 3:
            generate_3_num_disagg_data(reportable, indicator_type="quantity")

        # 0 num_disaggregation
        if reportable.disaggregation.count() != 0:
            if reportable.locations.count() != 0:
                first_reportable_location_id = reportable.locations.first().id

            else:
                first_reportable_location_id = None

            for location_id in list(reportable.indicator_reports.values_list('indicator_location_data__location', flat=True)):
                if not first_reportable_location_id or (first_reportable_location_id and first_reportable_location_id != location_id):
                    reportable.locations.add(
                        Location.objects.get(id=location_id))

        print "IndicatorReport and its Disaggregation data entries for {} {} created".format(handler.__name__, idx)

    # Making the rest of IndicatorReport objects not latest so that
    # IndicatorReport objects with location data are guaranteed to show up
    # first
    today = datetime.date.today()
    date = datetime.date(today.year - 1, today.month, today.day)

    if handler.__name__ == 'QuantityReportableToClusterObjectiveFactory':
        not_latest_queryset = IndicatorReport.objects.filter(
            reportable__cluster_objectives__reportables__isnull=False
        )
    else:
        not_latest_queryset = IndicatorReport.objects.filter(
            reportable__lower_level_outputs__reportables__isnull=False
        )

    not_latest_queryset.filter(indicator_location_data__isnull=True) \
        .update(time_period_start=date)

    not_latest_queryset.filter(
        indicator_location_data__disaggregation__isnull=True) \
        .update(time_period_start=date)


def generate_indicator_report_location_disaggregation_ratio_data():
    # Adding extra IndicatorReport to each QuantityReportableToLowerLevelOutput
    locations = Location.objects.all()

    sample_disaggregation_value_map = {
        "height": ["tall", "medium", "short", "extrashort"],
        "age": ["1-2m", "3-4m", "5-6m", '7-10m', '11-13m', '14-16m'],
        "gender": ["male", "female", "other"],
    }

    idx_offset = 20

    queryset = Reportable.objects.filter(
        lower_level_outputs__reportables__isnull=False, blueprint__unit=IndicatorBlueprint.PERCENTAGE).order_by('id')

    for idx, reportable in enumerate(queryset):
        # -- Extra IndicatorReport and IndicatorLocationData --

        # ProgressReport - IndicatorReport from
        # QuantityReportableToLowerLevelOutput
        indicator_report = RatioIndicatorReportFactory(reportable=reportable)
        indicator_report.progress_report = reportable.indicator_reports.first().progress_report
        indicator_report.save()

        # -- IndicatorLocationData --

        # -- 0 num_disaggregation generation for 3 entries --
        if idx % 8 == 0:
            print "NO Disaggregation (and DisaggregationValue) objects for RatioReportableToLowerLevelOutput {} created".format(idx)

        # -- 1 num_disaggregation generation for 3 entries --
        elif idx % 8 == 1:
            generate_disaggregation_and_disaggregation_values(
                reportable,
                sample_disaggregation_value_map,
                disaggregation_targets=["height"])

            print "Disaggregation (and DisaggregationValue) objects for RatioReportableToLowerLevelOutput {} created".format(idx)

        elif idx % 8 == 2:
            generate_disaggregation_and_disaggregation_values(
                reportable,
                sample_disaggregation_value_map,
                disaggregation_targets=["age"])

            print "Disaggregation (and DisaggregationValue) objects for RatioReportableToLowerLevelOutput {} created".format(idx)

        elif idx % 8 == 3:
            generate_disaggregation_and_disaggregation_values(
                reportable,
                sample_disaggregation_value_map,
                disaggregation_targets=["gender"])

            print "Disaggregation (and DisaggregationValue) objects for RatioReportableToLowerLevelOutput {} created".format(idx)

        # -- 2 num_disaggregation generation for 3 entries --
        elif idx % 8 == 4:
            generate_disaggregation_and_disaggregation_values(
                reportable,
                sample_disaggregation_value_map,
                disaggregation_targets=["height", "age"])

            print "Disaggregation (and DisaggregationValue) objects for RatioReportableToLowerLevelOutput {} created".format(idx)

        elif idx % 8 == 5:
            generate_disaggregation_and_disaggregation_values(
                reportable,
                sample_disaggregation_value_map,
                disaggregation_targets=["height", "gender"])

            print "Disaggregation (and DisaggregationValue) objects for RatioReportableToLowerLevelOutput {} created".format(idx)

        elif idx % 8 == 6:
            generate_disaggregation_and_disaggregation_values(
                reportable,
                sample_disaggregation_value_map,
                disaggregation_targets=["gender", "age"])

            print "Disaggregation (and DisaggregationValue) objects for RatioReportableToLowerLevelOutput {} created".format(idx)

        # -- 3 num_disaggregation generation for 3 entries --
        elif idx % 8 == 7:
            generate_disaggregation_and_disaggregation_values(
                reportable,
                sample_disaggregation_value_map,
                disaggregation_targets=["age", "gender", "height"])

            print "Disaggregation (and DisaggregationValue) objects for RatioReportableToLowerLevelOutput {} created".format(idx)

    for idx, reportable in enumerate(queryset):
        # -- 0 num_disaggregation generation for 3 entries --
        if reportable.disaggregation.count() == 0:
            generate_0_num_disagg_data(reportable, indicator_type="ratio")

        # -- 1 num_disaggregation generation for 3 entries --
        elif reportable.disaggregation.count() == 1:
            generate_1_num_disagg_data(reportable, indicator_type="ratio")

        # -- 2 num_disaggregation generation for 3 entries --
        elif reportable.disaggregation.count() == 2:
            generate_2_num_disagg_data(reportable, indicator_type="ratio")

        # -- 3 num_disaggregation generation for 3 entries --
        elif reportable.disaggregation.count() == 3:
            generate_3_num_disagg_data(reportable, indicator_type="ratio")

        # 0 num_disaggregation
        if reportable.disaggregation.count() != 0:
            if reportable.locations.count() != 0:
                first_reportable_location_id = reportable.locations.first().id

            else:
                first_reportable_location_id = None

            for location_id in list(reportable.indicator_reports.values_list('indicator_location_data__location', flat=True)):
                if not first_reportable_location_id or (first_reportable_location_id and first_reportable_location_id != location_id):
                    reportable.locations.add(
                        Location.objects.get(id=location_id))

        print "IndicatorReport and its Disaggregation data entries for RatioReportableToLowerLevelOutput {} created".format(idx)

    # Making the rest of IndicatorReport objects not latest so that
    # IndicatorReport objects with location data are guaranteed to show up
    # first
    today = datetime.date.today()
    date = datetime.date(today.year - 1, today.month, today.day)

    not_latest_queryset = IndicatorReport.objects.filter(
        reportable__lower_level_outputs__reportables__isnull=False
    )

    not_latest_queryset.filter(indicator_location_data__isnull=True) \
        .update(time_period_start=date)

    not_latest_queryset.filter(
        indicator_location_data__disaggregation__isnull=True) \
        .update(time_period_start=date)
