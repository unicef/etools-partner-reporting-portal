from datetime import timedelta, datetime

from django.db import transaction
from django.core.management.base import BaseCommand

from core.common import (
    FREQUENCY_LEVEL,
    PD_FREQUENCY_LEVEL,
    REPORTABLE_FREQUENCY_LEVEL,
    PD_STATUS,
)
from core.helpers import (
    get_num_of_days_in_a_month,
    get_current_quarter_for_a_month,
    get_first_date_of_a_quarter,
    get_last_date_of_a_quarter,
    calculate_end_date_given_start_date,
    find_missing_frequency_period_dates,
)
from core.factories import (
    ProgressReportFactory,
    QuantityIndicatorReportFactory,
    RatioIndicatorReportFactory,
    IndicatorLocationDataFactory,
)
from unicef.models import ProgressReport, ProgrammeDocument
from indicator.models import IndicatorReport, Reportable, IndicatorBlueprint


DUE_DATE_DAYS_TIMEDELTA = 15


class Command(BaseCommand):

    help = 'Create Progress Report and associated IndicatorReport' \
        'on a regular basis ' \
        'based on PD settings for that partner.'

    def handle(self, *args, **options):
        """
        The first processing:

        The command first checks each active ProgrammeDocument to check
        the latest ProgressReport object.
        Then, run a date calculation function to
        get a list of dates that is currently missing
        from current ProgrammeDocument object.

        Once the list of missing dates given frequency is found,
        the command will create ProgressReport, IndicatorReport,
        and IndicatorLocationData set.

        The second processing:

        The command will loop through Reportables that are not linked to
        ClusterActivity and LowerLevelOutput.

        Each loop will find the latest IndicatorReport object, and run
        the date calculation function to get a list of dates that is currently
        missing from current latest IndicatorReport.

        Afterwards, the command will create IndicatorReport and
        IndicatorLocationData objects.
        """
        for pd in ProgrammeDocument.objects.filter(status=PD_STATUS.active):
            print("Processing ProgrammeDocument {} between {} - {}".format(
                pd, pd.start_date, pd.end_date))

            reportable_queryset = pd.reportable_queryset
            frequency = pd.frequency
            latest_progress_report = pd.progress_reports.order_by('end_date').last()
            date_list = []

            if frequency == PD_FREQUENCY_LEVEL.custom_specific_dates:
                print("PD {} frequency is custom specific dates".format(
                    pd))
                if not latest_progress_report:
                    date_list = pd.reporting_periods.filter(start_date__gte=pd.start_date, end_date__lte=datetime.now())
                else:
                    date_list = pd.reporting_periods.filter(start_date__gte=latest_progress_report.end_date, end_date__lte=datetime.now())
            else:
                # Get missing date list based on progress report existence
                if latest_progress_report:
                    print("PD {} ProgressReport Found with period of {} - {} ".format(
                        pd,
                        latest_progress_report.start_date,
                        latest_progress_report.end_date))

                    date_list = find_missing_frequency_period_dates(
                        pd.start_date, latest_progress_report.end_date, frequency
                    )

                else:
                    print("PD {} ProgressReport NOT Found".format(
                        pd))

                    date_list = find_missing_frequency_period_dates(
                        pd.start_date, None, frequency)

            print("Missing dates: {}".format(date_list))

            with transaction.atomic():
                for idx, missing_date in enumerate(date_list):
                    if frequency != PD_FREQUENCY_LEVEL.custom_specific_dates:
                        end_date = calculate_end_date_given_start_date(
                            missing_date, frequency)
                        due_date = end_date + timedelta(days=DUE_DATE_DAYS_TIMEDELTA)
                    else:
                        end_date = missing_date.end_date
                        due_date = missing_date.due_date
                        missing_date = missing_date.start_date


                    # Create ProgressReport first
                    print("Creating PD {} ProgressReport object for {} - {}".format(pd, missing_date, end_date))
                    next_progress_report = ProgressReportFactory(
                        start_date=missing_date,
                        end_date=end_date,
                        due_date=due_date,
                        programme_document=pd,
                    )

                    for reportable in reportable_queryset:
                        if reportable.blueprint.unit == IndicatorBlueprint.NUMBER:
                            print("Creating PD {} Quantity IndicatorReport object for {} - {}".format(pd, missing_date, end_date))
                            indicator_report = QuantityIndicatorReportFactory(
                                reportable=reportable,
                                time_period_start=missing_date,
                                time_period_end=end_date,
                                due_date=due_date,
                            )

                            for location in reportable.locations.all():
                                print("Creating IndicatorReport {} IndicatorLocationData object for {} - {}".format(
                                    indicator_report, missing_date, end_date))
                                IndicatorLocationDataFactory(
                                    indicator_report=indicator_report,
                                    location=location,
                                    num_disaggregation=indicator_report.disaggregations.count(),
                                    level_reported=indicator_report.disaggregations.count(),
                                    disaggregation_reported_on=list(indicator_report.disaggregations.values_list(
                                        'id', flat=True)),
                                    disaggregation={
                                        '()': {'c': 0, 'd': 0, 'v': 0}
                                    },
                                )

                        else:
                            print("Creating PD {} Ratio IndicatorReport object for {} - {}".format(pd, missing_date, end_date))
                            indicator_report = RatioIndicatorReportFactory(
                                reportable=reportable,
                                time_period_start=missing_date,
                                time_period_end=end_date,
                                due_date=due_date,
                            )

                            for location in reportable.locations.all():
                                print("Creating IndicatorReport {} IndicatorLocationData object {} - {}".format(
                                    indicator_report, missing_date, end_date))
                                IndicatorLocationDataFactory(
                                    indicator_report=indicator_report,
                                    location=location,
                                    num_disaggregation=indicator_report.disaggregations.count(),
                                    level_reported=indicator_report.disaggregations.count(),
                                    disaggregation_reported_on=list(indicator_report.disaggregations.values_list(
                                        'id', flat=True)),
                                    disaggregation={
                                        '()': {'c': 0, 'd': 0, 'v': 0}
                                    },
                                )

                        indicator_report.progress_report = next_progress_report
                        indicator_report.save()

        # TODO: Add active flag to Reportable
        for indicator in Reportable.objects.filter(
            content_type__model__in=[
                'partnerproject', 'partneractivity', 'clusterobjective']):
            print("Processing Reportable {} between {} - {}".format(
                indicator, indicator.start_date, indicator.end_date))

            frequency = indicator.frequency
            latest_indicator_report = indicator.indicator_reports.order_by('time_period_end').last()
            date_list = []

            if frequency == PD_FREQUENCY_LEVEL.custom_specific_dates:
                print("Indicator {} frequency is custom specific dates".format(
                    indicator))

                if not latest_indicator_report:
                    date_list = [indicator.start_date]
                    date_list.extend(indicator.cs_dates)

                else:
                    date_list = [latest_indicator_report.time_period_end + timedelta(days=1)]
                    date_list.extend(filter(lambda item: item > latest_indicator_report.time_period_end, indicator.cs_dates))

            else:
                # Get missing date list based on progress report existence
                if latest_indicator_report:
                    print("Indicator {} IndicatorReport Found with period of {} - {} ".format(
                        indicator,
                        latest_indicator_report.time_period_start,
                        latest_indicator_report.time_period_end))

                    date_list = find_missing_frequency_period_dates(
                        indicator.start_date,
                        latest_indicator_report.time_period_end,
                        frequency,
                    )

                else:
                    print("Indicator {} IndicatorReport Not Found".format(
                        indicator))

                    date_list = find_missing_frequency_period_dates(
                        indicator.start_date, None, frequency)

            print("Missing dates: {}".format(date_list))

            with transaction.atomic():
                last_element_idx = len(date_list) - 1

                for idx, missing_date in enumerate(date_list):
                    if frequency == PD_FREQUENCY_LEVEL.custom_specific_dates:
                        if idx != last_element_idx:
                            end_date = calculate_end_date_given_start_date(
                                missing_date, frequency, cs_dates=date_list)

                        else:
                            break

                    else:
                        end_date = calculate_end_date_given_start_date(
                            missing_date, frequency)

                    if indicator.blueprint.unit == IndicatorBlueprint.NUMBER:
                        print("Creating Indicator {} Quantity IndicatorReport object for {} - {}".format(indicator, missing_date, end_date))

                        indicator_report = QuantityIndicatorReportFactory(
                            reportable=indicator,
                            time_period_start=missing_date,
                            time_period_end=end_date,
                        )

                        for location in indicator.locations.all():
                            print("Creating IndicatorReport {} IndicatorLocationData object {} - {}".format(
                                indicator_report, missing_date, end_date))

                            location_data = IndicatorLocationDataFactory(
                                indicator_report=indicator_report,
                                location=location,
                                num_disaggregation=indicator_report.disaggregations.count(),
                                level_reported=indicator_report.disaggregations.count(),
                                disaggregation_reported_on=list(indicator_report.disaggregations.values_list(
                                    'id', flat=True)),
                                disaggregation={
                                    '()': {'c': 0, 'd': 0, 'v': 0}
                                },
                            )

                    else:
                        print("Creating Indicator {} Ratio IndicatorReport object for {} - {}".format(indicator, missing_date, end_date))

                        indicator_report = RatioIndicatorReportFactory(
                            reportable=indicator,
                            time_period_start=missing_date,
                            time_period_end=end_date,
                        )

                        for location in indicator.locations.all():
                            print("Creating IndicatorReport {} IndicatorLocationData object {} - {}".format(
                                indicator_report, missing_date, end_date))

                            location_data = IndicatorLocationDataFactory(
                                indicator_report=indicator_report,
                                location=location,
                                num_disaggregation=indicator_report.disaggregations.count(),
                                level_reported=indicator_report.disaggregations.count(),
                                disaggregation_reported_on=list(indicator_report.disaggregations.values_list(
                                    'id', flat=True)),
                                disaggregation={
                                    '()': {'c': 0, 'd': 0, 'v': 0}
                                },
                            )
