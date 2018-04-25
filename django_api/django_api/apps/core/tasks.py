import random
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

from celery import shared_task
from django.db import transaction

from core.api import PMP_API
from core.serializers import PMPWorkspaceSerializer
from core.models import Country
from core.common import (
    PD_FREQUENCY_LEVEL,
    PD_STATUS,
)
from core.helpers import (
    calculate_end_date_given_start_date,
    find_missing_frequency_period_dates_for_indicator_report,
)
from core.factories import (
    ProgressReportFactory,
    QuantityIndicatorReportFactory,
    RatioIndicatorReportFactory,
    IndicatorLocationDataFactory,
)
from unicef.models import ProgrammeDocument
from indicator.models import Reportable, IndicatorBlueprint


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
            serializer.is_valid(raise_exception=True)
            workspace = serializer.save()
            print("Create Country for Workspace: {}".format(data['country_short_code']))
            country, created = Country.objects.get_or_create(
                name=workspace.title, country_short_code=data['country_short_code']
            )
            workspace.countries.add(country)
    except Exception as e:
        print(e)
        raise


@shared_task
def process_period_reports():
    def get_latest_pr_by_type(pd, report_type):
        """
        Return latest ProgressReport instance given report_type
        Arguments:
            report_type {str} -- A report type as string: [QPR, HR, SR]
        Returns:
            ProgressReport -- Latest ProgressReport instance for given report_type
        """

        if report_type == "QPR":
            return pd.progress_reports \
                .filter(report_type="QPR").order_by(
                    'report_type',
                    'report_number',
                    'is_final',
                    'end_date'
                ).last()

        if report_type == "HR":
            return pd.progress_reports \
                .filter(report_type="HR").order_by(
                    'report_type',
                    'report_number',
                    'is_final',
                    'end_date'
                ).last()

        if report_type == "SR":
            return pd.progress_reports \
                .filter(report_type="SR").order_by(
                    'report_type',
                    'report_number',
                    'is_final',
                    'due_date'
                ).last()

    for pd in ProgrammeDocument.objects.filter(status=PD_STATUS.active):
        print("\nProcessing ProgrammeDocument {}".format(pd.id))
        print(10 * "****")

        reportable_queryset = pd.reportable_queryset

        latest_progress_report_qpr = get_latest_pr_by_type(pd, "QPR")
        latest_progress_report_hr = get_latest_pr_by_type(pd, "HR")
        latest_progress_report_sr = get_latest_pr_by_type(pd, "SR")

        generate_from_date_qpr = None
        generate_from_date_hr = None
        generate_from_date_sr = None

        if latest_progress_report_qpr:
            generate_from_date_qpr = latest_progress_report_qpr.start_date

        if latest_progress_report_hr:
            generate_from_date_hr = latest_progress_report_hr.start_date

        if latest_progress_report_sr:
            generate_from_date_sr = latest_progress_report_sr.due_date

        print("Last QPR report: %s for PD %s" % (generate_from_date_qpr, pd))
        print("Last HR report: %s for PD %s" % (generate_from_date_hr, pd))
        print("Last SR report: %s for PD %s" % (generate_from_date_sr, pd))

        def create_pr_for_report_type(reporting_period, generate_from_date):
            """
            Create ProgressReport instance by its ReportingPeriodDate instance's report type
            Arguments:
                reporting_period {ReportingPeriodDates} -- ReportingPeriodDates instance for new ProgressReport
                generate_from_date {datetime.datetime} -- datetime instance from latest ProgressReport on same report
            Returns:
                Tuple[ProgressReport, datetime.datetime, datetime.datetime, datetime.datetime]
                - Newly generated ProgressReport & 3 datetime objects
            """

            end_date = reporting_period.end_date
            due_date = reporting_period.due_date
            start_date = reporting_period.start_date

            # Create ProgressReport first
            print("Creating ProgressReport for {} - {}".format(start_date, end_date))

            # Re-query latest ProgressReport by report type
            latest_progress_report = get_latest_pr_by_type(pd, reporting_period.report_type)

            print(latest_progress_report, reporting_period.report_type)

            if latest_progress_report:
                report_type = latest_progress_report.report_type
                report_number = latest_progress_report.report_number + 1
                is_final = idx == pd.reporting_periods.count() - 1

            else:
                report_number = 1
                report_type = reporting_period.report_type
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

            return (next_progress_report, start_date, end_date, due_date)

        def create_ir_and_ilds_for_pr(reportable_queryset, next_progress_report, start_date, end_date, due_date):
            """
            Create a set of new IndicatorReports and IndicatorLocationData instances per
            IndicatorReport instance, with passed-in new dates and new ProgressReport instance
            Arguments:
                reportable_queryset {django.Queryset[Reportable]} -- Reportable queryset on LLO
                next_progress_report {ProgressReport} -- Newly generated Progress Report instance
                start_date {datetime.datetime} -- Start date for reporting
                end_date {datetime.datetime} -- End date for reporting
                due_date {datetime.datetime} -- due date for reporting
            """

            if next_progress_report.report_type != "SR":
                for reportable in reportable_queryset:
                    if reportable.blueprint.unit == IndicatorBlueprint.NUMBER:
                        print("Creating Quantity IndicatorReport for {} - {}".format(start_date, end_date))
                        indicator_report = QuantityIndicatorReportFactory(
                            reportable=reportable,
                            time_period_start=start_date,
                            time_period_end=end_date,
                            due_date=due_date,
                            title=reportable.blueprint.title,
                            total={'c': 0, 'd': 0, 'v': 0},
                            overall_status="NoS",
                            report_status="Due",
                            submission_date=None,
                        )

                        for location in reportable.locations.all():
                            print("Creating IndicatorReport {} IndicatorLocationData for {} - {}".format(
                                indicator_report, start_date, end_date
                            ))
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
                        print("Creating PD {} Ratio IndicatorReport for {} - {}".format(pd, start_date, end_date))
                        indicator_report = RatioIndicatorReportFactory(
                            reportable=reportable,
                            time_period_start=start_date,
                            time_period_end=end_date,
                            due_date=due_date,
                            title=reportable.blueprint.title,
                            total={'c': 0, 'd': 0, 'v': 0},
                            overall_status="NoS",
                            report_status="Due",
                            submission_date=None,
                        )

                        for location in reportable.locations.all():
                            print("Creating IndicatorReport {} IndicatorLocationData {} - {}".format(
                                indicator_report, start_date, end_date
                            ))
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

        with transaction.atomic():
            # Handling QPR reporting periods
            for idx, reporting_period in enumerate(pd.reporting_periods.filter(report_type="QPR")):
                # If PR start date is greater than now, skip!
                if reporting_period.start_date > datetime.now().date():
                    print("No new reports to generate")
                    continue

                # If PR was already generated, skip!
                if generate_from_date_qpr and reporting_period.start_date <= generate_from_date_qpr:
                    print("No new reports to generate")
                    continue

                next_progress_report, start_date, end_date, due_date = create_pr_for_report_type(
                    reporting_period, generate_from_date_qpr
                )

                create_ir_and_ilds_for_pr(
                    reportable_queryset,
                    next_progress_report,
                    start_date,
                    end_date,
                    due_date
                )

            # Handling HR reporting periods
            for idx, reporting_period in enumerate(pd.reporting_periods.filter(report_type="HR")):
                # If PR start date is greater than now, skip!
                if reporting_period.start_date > datetime.now().date():
                    print("No new reports to generate")
                    continue

                # If PR was already generated, skip!
                if generate_from_date_hr and reporting_period.start_date <= generate_from_date_hr:
                    print("No new reports to generate")
                    continue

                next_progress_report, start_date, end_date, due_date = create_pr_for_report_type(
                    reporting_period, generate_from_date_hr
                )

                create_ir_and_ilds_for_pr(
                    reportable_queryset,
                    next_progress_report,
                    start_date,
                    end_date,
                    due_date
                )

            # Handling SR reporting periods
            for idx, reporting_period in enumerate(pd.reporting_periods.filter(report_type="SR")):
                # If PR due date is greater than now, skip!
                if reporting_period.due_date >= datetime.now().date() + timedelta(days=30):
                    print("No new reports to generate")
                    continue

                # If PR was already generated, skip!
                if generate_from_date_sr and reporting_period.due_date <= generate_from_date_sr:
                    print("No new reports to generate")
                    continue

                next_progress_report, start_date, end_date, due_date = create_pr_for_report_type(
                    reporting_period, generate_from_date_sr
                )

                create_ir_and_ilds_for_pr(
                    reportable_queryset,
                    next_progress_report,
                    start_date,
                    end_date,
                    due_date
                )

    for reportable in Reportable.objects.filter(
            content_type__model__in=['partnerproject', 'partneractivity', 'clusterobjective'], active=True
    ):
        print("Processing Reportable {}".format(reportable))

        if reportable.locations.count() == 0:
            continue

        frequency = reportable.frequency
        latest_indicator_report = reportable.indicator_reports.order_by('time_period_end').last()

        if frequency == PD_FREQUENCY_LEVEL.custom_specific_dates:
            print("Indicator {} frequency is custom specific dates".format(reportable))

            if not latest_indicator_report:
                # PartnerProject, PartnerActivity
                if hasattr(reportable.content_object, 'start_date'):
                    date_list = [reportable.content_object.start_date]
                # ClusterObjective
                elif hasattr(reportable.content_object, 'response_plan'):
                    date_list = [reportable.content_object.response_plan.start_date]
                date_list.extend(reportable.cs_dates)
            else:
                date_list = [latest_indicator_report.time_period_end + timedelta(days=1)]
                date_list.extend(filter(
                    lambda item: item > latest_indicator_report.time_period_end,
                    reportable.cs_dates
                ))

        else:
            # Get missing date list based on progress report existence
            if latest_indicator_report:
                print("Indicator {} IndicatorReport Found with period of {} - {} ".format(
                    reportable,
                    latest_indicator_report.time_period_start,
                    latest_indicator_report.time_period_end
                ))

                date_list = find_missing_frequency_period_dates_for_indicator_report(
                    reportable,
                    latest_indicator_report.time_period_end,
                    frequency,
                )
            else:
                print("Indicator {} IndicatorReport Not Found".format(reportable))
                date_list = find_missing_frequency_period_dates_for_indicator_report(reportable, None, frequency)

        print("Missing dates: {}".format(date_list))

        with transaction.atomic():
            last_element_idx = len(date_list) - 1

            for idx, start_date in enumerate(date_list):
                if frequency == PD_FREQUENCY_LEVEL.custom_specific_dates:
                    if idx != last_element_idx:
                        end_date = calculate_end_date_given_start_date(start_date, frequency, cs_dates=date_list)
                    else:
                        break

                else:
                    end_date = calculate_end_date_given_start_date(start_date, frequency)

                if reportable.blueprint.unit == IndicatorBlueprint.NUMBER:
                    print("Creating Indicator {} Quantity IndicatorReport object for {} - {}".format(
                        reportable, start_date, end_date
                    ))

                    indicator_report = QuantityIndicatorReportFactory(
                        reportable=reportable,
                        time_period_start=start_date,
                        time_period_end=end_date,
                        due_date=end_date + relativedelta(days=random.randint(2, 15)),
                        title=reportable.blueprint.title,
                        total={'c': 0, 'd': 0, 'v': 0},
                        overall_status="NoS",
                        report_status="Due",
                        submission_date=None,
                    )

                    for location in reportable.locations.all():
                        print("Creating IndicatorReport {} IndicatorLocationData object {} - {}".format(
                            indicator_report, start_date, end_date
                        ))

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
                    print("Creating Indicator {} Ratio IndicatorReport object for {} - {}".format(
                        reportable, start_date, end_date
                    ))

                    indicator_report = RatioIndicatorReportFactory(
                        reportable=reportable,
                        time_period_start=start_date,
                        time_period_end=end_date,
                        due_date=end_date + relativedelta(days=random.randint(2, 15)),
                        title=reportable.blueprint.title,
                        total={'c': 0, 'd': 0, 'v': 0},
                        overall_status="NoS",
                        report_status="Due",
                        submission_date=None,
                    )

                    for location in reportable.locations.all():
                        print("Creating IndicatorReport {} IndicatorLocationData object {} - {}".format(
                            indicator_report, start_date, end_date
                        ))

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