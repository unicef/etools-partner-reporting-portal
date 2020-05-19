from core.helpers import generate_data_combination_entries
from core.tests import factories
from indicator.models import Disaggregation, ReportingEntity

unicef_re = ReportingEntity.objects.get(title="UNICEF")
cluster_re = ReportingEntity.objects.get(title="Cluster")


# def generate_0_num_disagg_data(reportable, indicator_type="quantity"):
#     # IndicatorReport from QuantityReportable object -
#     # IndicatorLocationData
#     if reportable.locations.count() == 0:
#         table = CartoDBTable.objects.first()

#         location = LocationFactory(
#             gateway=table.location_type,
#             carto_db_table=table,
#         )
#         LocationWithReportableLocationGoalFactory(
#             location=location,
#             reportable=reportable,
#         )

#     location = reportable.locations.first()

#     for indicator_report_from_reportable in reportable.indicator_reports.all():
#         if indicator_type == "quantity":
#             disaggregation = {
#                 '()': {
#                     'v': random.randint(50, 1000),
#                     'd': 0,
#                     'c': 0
#                 }
#             }

#         elif indicator_type == "ratio":
#             disaggregation = {
#                 '()': {
#                     'v': random.randint(50, 1000),
#                     'd': random.randint(2000, 4000),
#                     'c': 0
#                 }
#             }

#         # 0 num_disaggregation & 0 level_reported
#         factories.IndicatorLocationDataFactory(
#             indicator_report=indicator_report_from_reportable,
#             location=location,
#             num_disaggregation=0,
#             level_reported=0,
#             disaggregation_reported_on=list(),
#             disaggregation=disaggregation
#         )


# def generate_1_num_disagg_data(reportable, indicator_type="quantity"):
#     # IndicatorReport from QuantityReportable object -
#     # IndicatorLocationData
#     locations = Location.objects.all()

#     for indicator_report_from_reportable in reportable.indicator_reports.all():
#         disagg_idx = 0

#         # 1 num_disaggregation & 0 level_reported
#         location = locations[disagg_idx]

#         if indicator_type == "quantity":
#             disaggregation = {
#                 '()': {
#                     'v': random.randint(50, 1000),
#                     'd': 0,
#                     'c': 0
#                 }
#             }

#         elif indicator_type == "ratio":
#             disaggregation = {
#                 '()': {
#                     'v': random.randint(50, 1000),
#                     'd': random.randint(2000, 4000),
#                     'c': 0
#                 }
#             }

#         location_data = factories.IndicatorLocationDataFactory(
#             indicator_report=indicator_report_from_reportable,
#             location=location,
#             num_disaggregation=1,
#             level_reported=0,
#             disaggregation_reported_on=list(),
#             disaggregation=disaggregation,
#         )

#         if indicator_type == "quantity":
#             QuantityIndicatorDisaggregator.post_process(location_data)

#         elif indicator_type == "ratio":
#             RatioIndicatorDisaggregator.post_process(location_data)

#         disagg_idx += 1

#         # 1 num_disaggregation & 1 level_reported
#         disaggregation_comb_1_pairs = list(combinations(list(
#             indicator_report_from_reportable.disaggregations.values_list('id', flat=True)), 1))

#         for pair in disaggregation_comb_1_pairs:
#             location = locations[disagg_idx]

#             location_data = factories.IndicatorLocationDataFactory(
#                 indicator_report=indicator_report_from_reportable,
#                 location=location,
#                 num_disaggregation=1,
#                 level_reported=1,
#                 disaggregation_reported_on=pair,
#                 disaggregation=generate_data_combination_entries(
#                     indicator_report_from_reportable.disaggregation_values(
#                         id_only=True, filter_by_id__in=pair), indicator_type=indicator_type, r=1
#                 )
#             )

#             if indicator_type == "quantity":
#                 QuantityIndicatorDisaggregator.post_process(location_data)

#             elif indicator_type == "ratio":
#                 RatioIndicatorDisaggregator.post_process(location_data)

#             disagg_idx += 1


# def generate_2_num_disagg_data(reportable, indicator_type="quantity"):
#     # IndicatorReport from QuantityReportable object -
#     # IndicatorLocationData
#     locations = Location.objects.all()

#     for indicator_report_from_reportable in reportable.indicator_reports.all():
#         disagg_idx = 0

#         # 2 num_disaggregation & 0 level_reported
#         location = locations[disagg_idx]

#         if indicator_type == "quantity":
#             disaggregation = {
#                 '()': {
#                     'v': random.randint(50, 1000),
#                     'd': 0,
#                     'c': 0
#                 }
#             }

#         elif indicator_type == "ratio":
#             disaggregation = {
#                 '()': {
#                     'v': random.randint(50, 1000),
#                     'd': random.randint(2000, 4000),
#                     'c': 0
#                 }
#             }

#         location_data = factories.IndicatorLocationDataFactory(
#             indicator_report=indicator_report_from_reportable,
#             location=location,
#             num_disaggregation=2,
#             level_reported=0,
#             disaggregation_reported_on=list(),
#             disaggregation=disaggregation
#         )

#         if indicator_type == "quantity":
#             QuantityIndicatorDisaggregator.post_process(location_data)

#         elif indicator_type == "ratio":
#             RatioIndicatorDisaggregator.post_process(location_data)

#         disagg_idx += 1

#         # 2 num_disaggregation & 1 level_reported
#         disaggregation_comb_1_pairs = list(combinations(list(
#             indicator_report_from_reportable.disaggregations.values_list('id', flat=True)), 1))

#         for pair in disaggregation_comb_1_pairs:
#             location = locations[disagg_idx]

#             location_data = factories.IndicatorLocationDataFactory(
#                 indicator_report=indicator_report_from_reportable,
#                 location=location,
#                 num_disaggregation=2,
#                 level_reported=1,
#                 disaggregation_reported_on=pair,
#                 disaggregation=generate_data_combination_entries(
#                     indicator_report_from_reportable.disaggregation_values(
#                         id_only=True, filter_by_id__in=pair), indicator_type=indicator_type, r=1
#                 )
#             )

#             if indicator_type == "quantity":
#                 QuantityIndicatorDisaggregator.post_process(location_data)

#             elif indicator_type == "ratio":
#                 RatioIndicatorDisaggregator.post_process(location_data)

#             disagg_idx += 1

#         # 2 num_disaggregation & 2 level_reported
#         disaggregation_comb_2_pairs = list(combinations(list(
#             indicator_report_from_reportable.disaggregations.values_list('id', flat=True)), 2))

#         for pair in disaggregation_comb_2_pairs:
#             location = locations[disagg_idx]

#             location_data = factories.IndicatorLocationDataFactory(
#                 indicator_report=indicator_report_from_reportable,
#                 location=location,
#                 num_disaggregation=2,
#                 level_reported=2,
#                 disaggregation_reported_on=pair,
#                 disaggregation=generate_data_combination_entries(
#                     indicator_report_from_reportable.disaggregation_values(
#                         id_only=True, filter_by_id__in=pair), indicator_type=indicator_type, r=2
#                 )
#             )

#             if indicator_type == "quantity":
#                 QuantityIndicatorDisaggregator.post_process(location_data)

#             elif indicator_type == "ratio":
#                 RatioIndicatorDisaggregator.post_process(location_data)

#             disagg_idx += 1


def generate_3_num_disagg_data(reportable, indicator_type="quantity"):
    # IndicatorReport from QuantityReportable object -
    # IndicatorLocationData

    for indicator_report_from_reportable in reportable.indicator_reports.all():
        for location in reportable.locations.all():
            # 3 num_disaggregation & 3 level_reported
            factories.IndicatorLocationDataFactory(
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


def add_disaggregations_to_reportable(reportable, disaggregation_targets):
    if reportable.content_type.model == 'partneractivityprojectcontext':
        response_plan = reportable.content_object.project.response_plan
    else:
        response_plan = getattr(reportable.content_object,
                                'response_plan', None)

    # Disaggregation generation
    for target in disaggregation_targets:
        disaggregation = Disaggregation.objects.get(name=target,
                                                    response_plan=response_plan)
        reportable.disaggregations.add(disaggregation)
