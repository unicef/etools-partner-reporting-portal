import logging
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

from celery import shared_task
from django.db import transaction

from core.api import PMP_API
from core.celery import cache_lock, app as celery_app
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
    ClusterIndicatorReportFactory,
    ProgressReportIndicatorReportFactory,
    IndicatorLocationDataFactory,
)
from unicef.models import ProgrammeDocument
from indicator.models import Reportable, IndicatorBlueprint, IndicatorReport, ReportingEntity


logger = logging.getLogger(__name__)
DUE_DATE_DAYS_TIMEDELTA = 15


@shared_task
def process_workspaces():
    # Hit API
    api = PMP_API()
    workspaces_data = api.workspaces()

    # Create workspaces
    try:
        for data in workspaces_data:
            logger.info("Create Workspace: %s" % data['name'])
            if not data['country_short_code']:
                logger.warning("\tNo country_short_code - skipping!")
                continue
            serializer = PMPWorkspaceSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            workspace = serializer.save()
            logger.info("Create Country for Workspace: {}".format(data['country_short_code']))
            country, created = Country.objects.get_or_create(
                name=workspace.title, country_short_code=data['country_short_code']
            )
            workspace.countries.add(country)
    except Exception as e:
        logger.exception(e)
        raise


@shared_task
def process_period_reports():
    lock_id = 'process_period_reports-lock'
    logger.debug('Report generating: ----------')

    with cache_lock(lock_id, celery_app.oid) as acquired:
        if acquired:
            # Cluster reporting Indicator report generation first
            for reportable in Reportable.objects.filter(
                content_type__model__in=[
                    'partnerproject',
                    'partneractivity',
                    'clusterobjective'
                ],
                active=True
            ):
                logger.info("Processing Reportable {}".format(reportable))

                if reportable.locations.count() == 0:
                    continue

                frequency = reportable.frequency
                latest_indicator_report = reportable.indicator_reports.order_by('time_period_end').last()

                if frequency == PD_FREQUENCY_LEVEL.custom_specific_dates:
                    logger.info("Indicator {} frequency is custom specific dates".format(reportable))

                    if not latest_indicator_report:
                        date_list = list()
                        date_list.append(reportable.start_date_of_reporting_period)
                        date_list.extend(reportable.cs_dates)
                    else:
                        date_list = [latest_indicator_report.due_date]
                        date_list.extend(filter(
                            lambda item: item > latest_indicator_report.due_date,
                            reportable.cs_dates
                        ))

                        # If there is no consecutive due date from last indicator report's due date
                        # Then, there is no need to generate reports
                        if len(date_list) == 1:
                            date_list = list()

                else:
                    # Get missing date list based on progress report existence
                    if latest_indicator_report:
                        logger.info("Indicator {} IndicatorReport Found with period of {} - {} ".format(
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
                        logger.info("Indicator {} IndicatorReport Not Found".format(reportable))
                        date_list = find_missing_frequency_period_dates_for_indicator_report(reportable, None, frequency)

                logger.info("Missing dates: {}".format(date_list))

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
                            logger.info("Creating Indicator {} Quantity IndicatorReport object for {} - {}".format(
                                reportable, start_date, end_date
                            ))

                            indicator_report = ClusterIndicatorReportFactory(
                                reportable=reportable,
                                time_period_start=start_date,
                                time_period_end=end_date,
                                due_date=end_date + relativedelta(days=1),
                                title=reportable.blueprint.title,
                                total={'c': 0, 'd': 0, 'v': 0},
                                overall_status="NoS",
                                report_status="Due",
                                submission_date=None,
                                reporting_entity=ReportingEntity.objects.get(title="Cluster"),
                            )

                            for location in reportable.locations.all():
                                logger.info("Creating IndicatorReport {} IndicatorLocationData object {} - {}".format(
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
                            logger.info("Creating Indicator {} Ratio IndicatorReport object for {} - {}".format(
                                reportable, start_date, end_date
                            ))

                            indicator_report = ClusterIndicatorReportFactory(
                                reportable=reportable,
                                time_period_start=start_date,
                                time_period_end=end_date,
                                due_date=end_date + relativedelta(days=1),
                                title=reportable.blueprint.title,
                                total={'c': 0, 'd': 0, 'v': 0},
                                overall_status="NoS",
                                report_status="Due",
                                submission_date=None,
                                reporting_entity=ReportingEntity.objects.get(title="Cluster"),
                            )

                            for location in reportable.locations.all():
                                logger.info("Creating IndicatorReport {} IndicatorLocationData object {} - {}".format(
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
                        .filter(report_type="QPR").order_by('start_date').last()

                if report_type == "HR":
                    return pd.progress_reports \
                        .filter(report_type="HR").order_by('start_date').last()

                if report_type == "SR":
                    return pd.progress_reports \
                        .filter(report_type="SR").order_by('due_date').last()

            # PD report generation
            for pd in ProgrammeDocument.objects.filter(status=PD_STATUS.active):
                logger.info("\nProcessing ProgrammeDocument {}".format(pd.id))
                logger.info(10 * "****")

                # Get Active LLO indicators only
                reportable_queryset = pd.reportable_queryset.filter(active=True)

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

                logger.info("Last QPR report: %s for PD %s" % (generate_from_date_qpr, pd))
                logger.info("Last HR report: %s for PD %s" % (generate_from_date_hr, pd))
                logger.info("Last SR report: %s for PD %s" % (generate_from_date_sr, pd))

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
                    logger.info("Creating ProgressReport for {} - {}".format(start_date, end_date))

                    # Re-query latest ProgressReport by report type
                    latest_progress_report = get_latest_pr_by_type(pd, reporting_period.report_type)

                    if latest_progress_report:
                        report_type = latest_progress_report.report_type
                        report_number = latest_progress_report.report_number + 1
                        is_final = idx == pd.reporting_periods.filter(report_type=reporting_period.report_type).count() - 1

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

                def create_pr_ir_for_reportable(reportable, pai_ir_for_period, start_date, end_date, due_date):
                    if reportable.blueprint.unit == IndicatorBlueprint.NUMBER:
                        logger.info("Creating Quantity IndicatorReport for {} - {}".format(start_date, end_date))
                        indicator_report = ProgressReportIndicatorReportFactory(
                            progress_report=None,
                            reportable=reportable,
                            parent=pai_ir_for_period,
                            time_period_start=start_date,
                            time_period_end=end_date,
                            due_date=due_date,
                            title=reportable.blueprint.title,
                            total={'c': 0, 'd': 0, 'v': 0},
                            overall_status="NoS",
                            report_status="Due",
                            submission_date=None,
                            reporting_entity=ReportingEntity.objects.get(title="UNICEF"),
                        )

                        for location in reportable.locations.all():
                            logger.info("Creating IndicatorReport {} IndicatorLocationData for {} - {}".format(
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
                        logger.info("Creating PD {} Ratio IndicatorReport for {} - {}".format(pd, start_date, end_date))
                        indicator_report = ProgressReportIndicatorReportFactory(
                            progress_report=None,
                            reportable=reportable,
                            parent=pai_ir_for_period,
                            time_period_start=start_date,
                            time_period_end=end_date,
                            due_date=due_date,
                            title=reportable.blueprint.title,
                            total={'c': 0, 'd': 0, 'v': 0},
                            overall_status="NoS",
                            report_status="Due",
                            submission_date=None,
                            reporting_entity=ReportingEntity.objects.get(title="UNICEF"),
                        )

                        for location in reportable.locations.all():
                            logger.info("Creating IndicatorReport {} IndicatorLocationData {} - {}".format(
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

                    return indicator_report

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
                        if next_progress_report.report_type == "QPR":
                            queryset = reportable_queryset

                        else:
                            # Filter non-Cluster reportables first
                            queryset = reportable_queryset.filter(
                                ca_indicator_used_by_reporting_entity__isnull=True,
                                is_unicef_hf_indicator=True
                            )

                        ir_list = list()

                        for reportable in queryset:
                            indicator_report = create_pr_ir_for_reportable(
                                reportable,
                                None,
                                start_date,
                                end_date,
                                due_date,
                            )
                            indicator_report.progress_report = next_progress_report
                            indicator_report.save()
                            ir_list.append(indicator_report)

                        if next_progress_report.report_type == "HR":
                            hr_reports = list()

                            # If there are no UNICEF HF indicator reports then delete blank ProgressReport
                            if len(ir_list) == 0:
                                # Re-assign report_number to new HR
                                report_number = next_progress_report.report_number
                                next_progress_report.delete()

                            else:
                                # Pre-populate new HR report_number in case a new Progress Report needs to be generated
                                report_number = next_progress_report.report_number + 1
                                hr_reports.append(next_progress_report)

                            # Process cluster Reportables separately
                            for reportable in reportable_queryset.filter(ca_indicator_used_by_reporting_entity__isnull=False):
                                cai_indicator = reportable.ca_indicator_used_by_reporting_entity
                                pai_ir_for_period = None

                                # If LLO indicator has ClusterActivity Indicator ID reference,
                                # find the adopted PartnerActivity indicator from ClusterActivity Indicator
                                # with LLO's Partner ID
                                # and grab a corresponding IndicatorReport from ClusterActivity Indicator
                                # given the start & end date
                                if cai_indicator:
                                    try:
                                        # Grabbing first adopted partner activity in case
                                        # multiple adopted partner activities happen, although this is illegal state!
                                        pai_indicator = cai_indicator.children \
                                            .filter(partner_activities__partner=pd.partner) \
                                            .first()
                                        pai_ir_for_period = pai_indicator.indicator_reports.get(
                                            time_period_start=start_date,
                                            time_period_end=end_date,
                                        )

                                        if pai_ir_for_period:
                                            indicator_report = create_pr_ir_for_reportable(
                                                reportable,
                                                pai_ir_for_period,
                                                pai_ir_for_period.time_period_start,
                                                pai_ir_for_period.time_period_end,
                                                pai_ir_for_period.due_date,
                                            )

                                            # Bundle this cluster LLO Indicator report to HR progress report generated so far
                                            # for this iteration if the dates are matching
                                            for hr_report in hr_reports:
                                                if indicator_report.time_period_start == hr_report.start_date \
                                                        and indicator_report.time_period_end == hr_report.end_date \
                                                        and indicator_report.due_date == hr_report.due_date:
                                                    indicator_report.progress_report = hr_report
                                                    break

                                            if not indicator_report.progress_report:
                                                # Otherwise, create a brand new HR progress report
                                                # for this cluster LLO Indicator report
                                                new_cluster_hr_progress_report = ProgressReportFactory(
                                                    start_date=indicator_report.time_period_start,
                                                    end_date=indicator_report.time_period_end,
                                                    due_date=indicator_report.due_date,
                                                    programme_document=pd,
                                                    report_type="HR",
                                                    report_number=report_number,
                                                    is_final=False,
                                                )
                                                indicator_report.progress_report = new_cluster_hr_progress_report

                                                # Increment report_number for next HR progress report to be created if needed
                                                report_number += 1
                                                hr_reports.append(new_cluster_hr_progress_report)

                                            indicator_report.save()

                                    except Reportable.DoesNotExist as e:
                                        logger.exception(
                                            "FAILURE: CANNOT FIND adopted PartnerActivity Reportable "
                                            "from given ClusterActivity Reportable and PD Partner ID. "
                                            "Skipping link!", e)
                                    except IndicatorReport.DoesNotExist as e:
                                        logger.exception(
                                            "FAILURE: CANNOT FIND IndicatorReport from adopted PartnerActivity Reportable "
                                            "linked with LLO Reportable. "
                                            "Skipping link!", e)

                with transaction.atomic():
                    # Handling QPR reporting periods
                    for idx, reporting_period in enumerate(pd.reporting_periods.filter(report_type="QPR").order_by(
                            'start_date')):
                        # If PR start date is greater than now, skip!
                        if reporting_period.start_date > datetime.now().date():
                            logger.info("No new reports to generate")
                            continue

                        # If PR was already generated, skip!
                        if generate_from_date_qpr and reporting_period.start_date <= generate_from_date_qpr:
                            logger.info("No new reports to generate")
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
                    for idx, reporting_period in enumerate(pd.reporting_periods.filter(report_type="HR").order_by(
                            'start_date')):

                        # If there is no start and/or end date from reporting period, skip!
                        if not reporting_period.start_date or not reporting_period.end_date:
                            logger.info("No new reports to generate: No start & end date pair available.")
                            continue

                        # If PR start date is greater than now, skip!
                        if reporting_period.start_date > datetime.now().date():
                            logger.info("No new reports to generate")
                            continue

                        # If PR was already generated, skip!
                        if generate_from_date_hr and reporting_period.start_date <= generate_from_date_hr:
                            logger.info("No new reports to generate")
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
                    for idx, reporting_period in enumerate(pd.reporting_periods.filter(report_type="SR").order_by('due_date')):
                        # If PR due date is greater than now, skip!
                        if reporting_period.due_date >= datetime.now().date() + timedelta(days=30):
                            logger.info("No new reports to generate")
                            continue

                        # If PR was already generated, skip!
                        if generate_from_date_sr and reporting_period.due_date <= generate_from_date_sr:
                            logger.info("No new reports to generate")
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

        return

    logger.debug(
        'Reports are already being generated by another worker'
    )
