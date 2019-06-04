import logging
from datetime import datetime, timedelta

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
    get_latest_pr_by_type,
    create_pr_for_report_type,
    create_ir_and_ilds_for_pr,
    create_ir_for_cluster,
)
from unicef.models import ProgrammeDocument
from indicator.models import Reportable

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

                if reportable.reportablelocationgoal_set.count() == 0:
                    continue

                frequency = reportable.frequency
                reportable_type = reportable.content_type.model
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

                        if reportable_type == 'partneractivity':
                            project_contexts = reportable.content_object.projects.all()

                            for project_context in project_contexts:
                                create_ir_for_cluster(reportable, start_date, end_date, project_context.project)
                        else:
                            project = None
                            if reportable_type == 'partnerproject':
                                project = reportable.content_object

                            create_ir_for_cluster(reportable, start_date, end_date, project)

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
                            pd, idx, reporting_period, generate_from_date_qpr
                        )

                        create_ir_and_ilds_for_pr(
                            pd,
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
                            pd, idx, reporting_period, generate_from_date_hr
                        )

                        create_ir_and_ilds_for_pr(
                            pd,
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
                            pd, idx, reporting_period, generate_from_date_sr
                        )

                        create_ir_and_ilds_for_pr(
                            pd,
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
