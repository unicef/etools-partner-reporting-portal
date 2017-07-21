import math
from calendar import monthrange
from datetime import date, timedelta

from django.db import transaction
from django.core.management.base import BaseCommand

from core.common import (
    FREQUENCY_LEVEL,
    PD_FREQUENCY_LEVEL,
    REPORTABLE_FREQUENCY_LEVEL,
    PD_STATUS,
)
from core.factories import (
    ProgressReportFactory,
    QuantityIndicatorReportFactory,
    RatioIndicatorReportFactory,
    IndicatorLocationDataFactory,
)
from unicef.models import ProgressReport, ProgrammeDocument
from indicator.models import IndicatorReport, Reportable, IndicatorBlueprint


def get_num_of_days_in_a_month(year, month):
    return monthrange(year, month)[1]


def get_current_quarter_for_a_month(month):
    return math.ceil(float(month) / 3)


# Modified a bit from https://stackoverflow.com/a/37708216/2363915
def get_first_date_of_a_quarter(year, quarter=1):
    assert quarter >= 1

    first_month_of_quarter = 3 * quarter - 2

    date_of_first_day_of_quarter = date(year, first_month_of_quarter, 1)

    return date_of_first_day_of_quarter


def get_last_date_of_a_quarter(year, quarter=1):
    assert quarter >= 1

    last_month_of_quarter = 3 * quarter

    date_of_last_day_of_quarter = date(
        year, last_month_of_quarter,
        get_num_of_days_in_a_month(year, last_month_of_quarter))

    return date_of_last_day_of_quarter


def calculate_end_date_given_start_date(start_date, frequency):
    if frequency == PD_FREQUENCY_LEVEL.weekly:
        end_date = start_date + timedelta(7)

    elif frequency == PD_FREQUENCY_LEVEL.monthly:
        num_of_days = get_num_of_days_in_a_month(
            start_date.year, start_date.month)

        end_date = date(
            start_date.year, start_date.month, num_of_days)

    elif frequency == PD_FREQUENCY_LEVEL.quarterly:
        quarter = get_current_quarter_for_a_month(
            start_date.month)

        end_date = get_last_date_of_a_quarter(
            start_date.year, quarter=quarter)

    # TODO: Handling custom_specific_dates later
    # elif frequency == PD_FREQUENCY_LEVEL.custom_specific_dates:
    #     end_date = pd.start_date + timedelta(7)

    return end_date


def find_missing_frequency_period_dates(start_date, last_date, frequency):
    # PD_FREQUENCY_LEVEL can be used interchangeably
    today = date.today()
    date_list = []

    # For now, we only generate missing dates for the past.
    if today > last_date:
        # day_delta as a flag to decrement day_delta_counter for next date
        # day_delta_counter as a date day integer to indicate next date
        day_delta = (today - last_date).days
        day_delta_counter = day_delta

        # Keep adding missing date until we get caught up with day_delta
        while day_delta_counter > 0:
            missing_date = today - timedelta(day_delta_counter)

            if frequency == PD_FREQUENCY_LEVEL.weekly:
                # If day_delta_counter has more week date to create
                if day_delta >= 7:
                    if day_delta_counter >= 7:
                        day_delta_counter -= 7

                    else:
                        day_delta_counter = 0

                # We have exhausted day_delta_counter successfully. Exiting
                else:
                    break

            elif frequency == PD_FREQUENCY_LEVEL.monthly:
                # Get the # of days in target month
                num_of_days = monthrange(missing_date.year, missing_date.month)

                # If day_delta_counter has more months to create
                if day_delta >= num_of_days:
                    if day_delta_counter >= num_of_days:
                        missing_date = today - timedelta(day_delta_counter)
                        day_delta_counter -= num_of_days

                    else:
                        day_delta_counter = 0

                # We have exhausted day_delta_counter successfully. Exiting
                else:
                    break

            elif frequency == PD_FREQUENCY_LEVEL.quarterly:
                # If day_delta_counter has more week date to create
                if day_delta >= 7:
                    if day_delta_counter >= 7:
                        day_delta_counter -= 7

                    else:
                        day_delta_counter = 0

                # We have exhausted day_delta_counter successfully. Exiting
                else:
                    break

            elif frequency == PD_FREQUENCY_LEVEL.custom_specific_dates:
                # If day_delta_counter has more week date to create
                if day_delta >= 7:
                    if day_delta_counter >= 7:
                        day_delta_counter -= 7

                    else:
                        day_delta_counter = 0

                # We have exhausted day_delta_counter successfully. Exiting
                else:
                    break

            # Only add new date if it's later than start date
            if start_date <= missing_date:
                date_list.append(missing_date)

    return date_list


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
        today = date.today()

        for pd in ProgrammeDocument.objects.filter(status=PD_STATUS.active):
            reportable = pd.reportable_queryset.first()
            frequency = pd.frequency
            latest_progress_report = pd.progress_reports.last()

            if not latest_progress_report:
                start_date = pd.start_date
                end_date = calculate_end_date_given_start_date(
                    start_date, frequency)

                new_progress_report = ProgressReportFactory(
                    start_date=start_date,
                    end_date=end_date,
                    programme_document=pd,
                )

            else:
                start_date = latest_progress_report.start_date
                end_date = calculate_end_date_given_start_date(
                    latest_progress_report.start_date, frequency)

                new_progress_report = ProgressReportFactory(
                    start_date=start_date,
                    end_date=end_date,
                    programme_document=pd,
                )

            date_list = find_missing_frequency_period_dates(
                pd.start_date, end_date, frequency)

            with transaction.atomic():
                for missing_date in date_list:
                    end_date = calculate_end_date_given_start_date(
                        missing_date, frequency)

                    # Create ProgressReport first
                    next_progress_report = ProgressReportFactory(
                        start_date=missing_date,
                        end_date=end_date,
                        programme_document=pd,
                    )

                    if reportable.blueprint.unit == IndicatorBlueprint.NUMBER:
                        indicator_report = QuantityIndicatorReportFactory(
                            reportable=reportable,
                            time_period_start=missing_date,
                            time_period_end=end_date,
                        )

                        location_data = IndicatorLocationDataFactory(
                            indicator_report=indicator_report,
                            location=location,
                            num_disaggregation=indicator_report.disaggregations.count(),
                            level_reported=indicator_report.disaggregations.count(),
                            disaggregation_reported_on=indicator_report.disaggregations.values_list('id', flat=True),
                            disaggregation={}
                        )

                    else:
                        indicator_report = RatioIndicatorReportFactory(
                            reportable=reportable,
                            time_period_start=missing_date,
                            time_period_end=end_date,
                        )

                        location_data = IndicatorLocationDataFactory(
                            indicator_report=indicator_report,
                            location=location,
                            num_disaggregation=indicator_report.disaggregations.count(),
                            level_reported=indicator_report.disaggregations.count(),
                            disaggregation_reported_on=indicator_report.disaggregations.values_list('id', flat=True),
                            disaggregation={}
                        )

                    indicator_report.progress_report = progress_report
                    indicator_report.save()

        # TODO: Add active flag to Reportable
        for indicator in Reportable.objects.filter(
            content_type__model__in=[
                'partnerproject', 'partneractivity', 'clusterobjective']):
            frequency = indicator.frequency
            latest_indicator_report = indicator.indicator_reports.last()

            if not latest_indicator_report:
                if indicator.frequency == PD_FREQUENCY_LEVEL.weekly:
                    end_date = indicator.start_date + timedelta(7)

                elif indicator.frequency == PD_FREQUENCY_LEVEL.monthly:
                    num_of_days = get_num_of_days_in_a_month(
                        indicator.start_date.year, indicator.start_date.month)

                    end_date = date(
                        indicator.start_date.year, indicator.start_date.month, num_of_days)

                elif indicator.frequency == PD_FREQUENCY_LEVEL.quarterly:
                    quarter = get_current_quarter_for_a_month(
                        indicator.start_date.month)

                    end_date = get_first_date_of_a_quarter(
                        indicator.start_date.year, quarter=quarter)

                # TODO: Handling custom_specific_dates later
                # elif indicator.frequency == PD_FREQUENCY_LEVEL.custom_specific_dates:
                #     end_date = indicator.start_date + timedelta(7)

                if reportable.blueprint.unit == IndicatorBlueprint.NUMBER:
                    latest_indicator_report = QuantityIndicatorReportFactory(
                        reportable=indicator,
                        time_period_start=indicator.start_date,
                        time_period_end=end_date,
                    )
                else:
                    latest_indicator_report = RatioIndicatorReportFactory(
                        reportable=indicator,
                        time_period_start=indicator.start_date,
                        time_period_end=end_date,
                    )

            if latest_indicator_report:
                start_date = latest_indicator_report.start_date
                last_date = latest_indicator_report.end_date

            date_list = find_missing_frequency_period_dates(
                start_date, last_date, frequency)

            with transaction.atomic():
                for missing_date in date_list:
                    if reportable.blueprint.unit == IndicatorBlueprint.NUMBER:
                        indicator_report = QuantityIndicatorReportFactory(
                            reportable=indicator,
                            time_period_start=indicator.start_date,
                            time_period_end=end_date,
                        )
                    else:
                        indicator_report = RatioIndicatorReportFactory(
                            reportable=indicator,
                            time_period_start=indicator.start_date,
                            time_period_end=end_date,
                        )
