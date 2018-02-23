import random
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

from celery import shared_task
from django.db import transaction

from core.api import PMP_API
from core.serializers import PMPWorkspaceSerializer
from core.models import Country
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

@shared_task
def process_workspaces():
    # Hit API
    api = PMP_API()
    workspaces_data = api.workspaces()

    # Create workspaces
    try:
        for data in workspaces_data:
            print("Create Workspace: %s" % data['name'])
            if not data['country_short_code']:
                print("\tNo country_short_code - skipping!")
                continue
            serializer = PMPWorkspaceSerializer(data=data)
            if not serializer.is_valid():
                raise Exception(serializer.errors)
            workspace = serializer.save()
            print(
                "Create Country for Workspace: %s" %
                data['country_short_code'])
            country, created = Country.objects.get_or_create(
                name=workspace.title, country_short_code=data['country_short_code'])
            workspace.countries.add(country)
    except Exception as e:
        print(e)
        raise Exception(e)


@shared_task
def process_period_reports():
    for pd in ProgrammeDocument.objects.filter(status=PD_STATUS.active):
        print("\nProcessing ProgrammeDocument {}".format(
           pd.id))
        print(10*"****")

        reportable_queryset = pd.reportable_queryset
        latest_progress_report = pd.progress_reports.order_by('report_type', 'report_number', 'is_final', 'end_date').last()

        generate_from_date = None

        # Get missing date list based on progress report existence
        if latest_progress_report:
            generate_from_date = latest_progress_report.start_date

        print("Last report: %s" % generate_from_date)

        with transaction.atomic():
            for idx, reporting_period in enumerate(pd.reporting_periods.all()):
                # If PR start date is greater than now, skip!
                if reporting_period.start_date > datetime.now().date():
                    print("No new reports to generate")
                    continue

                # If PR was already generated, skip!
                if generate_from_date and reporting_period.start_date <= generate_from_date:
                    print("No new reports to generate")
                    continue

                end_date = reporting_period.end_date
                due_date = reporting_period.due_date
                start_date = reporting_period.start_date

                # Create ProgressReport first
                print(
                    "Creating ProgressReport for {} - {}".format(start_date, end_date))

                if latest_progress_report:
                    report_type = latest_progress_report.report_type
                    report_number = latest_progress_report.report_number + 1

                    if idx == pd.reporting_periods.count() - 1:
                        is_final = True
                    else:
                        is_final = False
                else:
                    report_number = 1
                    report_type = "QPR"
                    is_final = False
             
                next_progress_report = ProgressReportFactory(
                    start_date=start_date,
                    end_date=end_date,
                    due_date=due_date,
                    programme_document=pd,
                    report_type=report_type,
                    report_number=report_number,
                    is_final=is_final,
                )

                for reportable in reportable_queryset:
                    if reportable.blueprint.unit == IndicatorBlueprint.NUMBER:
                        print(
                            "Creating Quantity IndicatorReport for {} - {}".format(
                                start_date, end_date))
                        indicator_report = QuantityIndicatorReportFactory(
                            reportable=reportable,
                            time_period_start=start_date,
                            time_period_end=end_date,
                            due_date=due_date,
                        )

                        for location in reportable.locations.all():
                            print("Creating IndicatorReport {} IndicatorLocationData for {} - {}".format(
                                indicator_report, start_date, end_date))
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
                        print(
                            "Creating PD {} Ratio IndicatorReport for {} - {}".format(
                                pd, start_date, end_date))
                        indicator_report = RatioIndicatorReportFactory(
                            reportable=reportable,
                            time_period_start=start_date,
                            time_period_end=end_date,
                            due_date=due_date,
                        )

                        for location in reportable.locations.all():
                            print("Creating IndicatorReport {} IndicatorLocationData {} - {}".format(
                                indicator_report, start_date, end_date))
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


    for indicator in Reportable.objects.filter(
            content_type__model__in=[
                'partnerproject', 'partneractivity', 'clusterobjective'], active=True):
        print("Processing Reportable {} between {} - {}".format(
            indicator, indicator.start_date, indicator.end_date))

        frequency = indicator.frequency
        latest_indicator_report = indicator.indicator_reports.order_by(
            'time_period_end').last()
        date_list = []

        if frequency == PD_FREQUENCY_LEVEL.custom_specific_dates:
            print("Indicator {} frequency is custom specific dates".format(
                indicator))

            if not latest_indicator_report:
                date_list = [indicator.start_date]
                date_list.extend(indicator.cs_dates)

            else:
                date_list = [
                    latest_indicator_report.time_period_end +
                    timedelta(
                        days=1)]
                date_list.extend(
                    filter(
                        lambda item: item > latest_indicator_report.time_period_end,
                        indicator.cs_dates))

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

            for idx, start_date in enumerate(date_list):
                if frequency == PD_FREQUENCY_LEVEL.custom_specific_dates:
                    if idx != last_element_idx:
                        end_date = calculate_end_date_given_start_date(
                            start_date, frequency, cs_dates=date_list)

                    else:
                        break

                else:
                    end_date = calculate_end_date_given_start_date(
                        start_date, frequency)

                if indicator.blueprint.unit == IndicatorBlueprint.NUMBER:
                    print(
                        "Creating Indicator {} Quantity IndicatorReport object for {} - {}".format(
                            indicator, start_date, end_date))

                    indicator_report = QuantityIndicatorReportFactory(
                        reportable=indicator,
                        time_period_start=start_date,
                        time_period_end=end_date,
                        due_date=end_date + relativedelta(days=random.randint(2, 15)),
                    )

                    for location in indicator.locations.all():
                        print("Creating IndicatorReport {} IndicatorLocationData object {} - {}".format(
                            indicator_report, start_date, end_date))

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
                    print(
                        "Creating Indicator {} Ratio IndicatorReport object for {} - {}".format(
                            indicator, start_date, end_date))

                    indicator_report = RatioIndicatorReportFactory(
                        reportable=indicator,
                        time_period_start=start_date,
                        time_period_end=end_date,
                        due_date=end_date + relativedelta(days=random.randint(2, 15)),
                    )

                    for location in indicator.locations.all():
                        print("Creating IndicatorReport {} IndicatorLocationData object {} - {}".format(
                            indicator_report, start_date, end_date))

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
