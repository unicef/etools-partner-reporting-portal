import logging
import math
import os
import random
import sys
from ast import literal_eval
from calendar import monthrange
from collections import OrderedDict
from contextlib import contextmanager
from datetime import date, timedelta
from itertools import combinations, product

from django.db import transaction

from dateutil.relativedelta import relativedelta

from etools_prp.apps.core.common import PD_DOCUMENT_TYPE, PD_FREQUENCY_LEVEL

logger = logging.getLogger("django")


@contextmanager
def suppress_stdout():
    """
    Turn off stdout (print to screen mode).
    Use it like:
        with suppress_stdout():
            do_something()
    """
    with open(os.devnull, "w") as devnull:
        old_stdout = sys.stdout
        sys.stdout = devnull
        try:
            yield
        finally:
            sys.stdout = old_stdout


def get_zero_dict(indicator_type):
    v = 0
    d = 1 if indicator_type == "SUM" else 0
    c = v / d if indicator_type == "SUM" else 0
    return {
        "c": c,
        "v": v,
        "d": d
    }


def calculate_sum(v1, v2, indicator_type="SUM"):
    vt = "v"
    dt = "d"
    ct = "c"

    data = {
        vt: v1[vt] + v2[vt],
    }
    if indicator_type == "SUM":
        data[dt] = 1
        data[ct] = data[vt]
        return data

    data[dt] = v1[dt] + v2[dt]
    data[ct] = data[vt] / data[dt] if data[dt] else 0
    return data


def get_all_subkeys(key):
    keys = []
    for i in range(0, len(key)):
        keys += combinations(key, i)
    return keys


def get_combination_pairs(array, r=3):
    """
    Returns an array of tuples where
    each tuple is a combination output of integer-coordinate space.

    array: An array of unique integers
    r: # of combinations from nCr
    """
    return list(combinations(array, r))


def generate_data_combination_entries(
        array, entries_only=False, key_type=str,
        indicator_type="quantity", r=3):
    """

    :param array: examples [(23,), (43,)] or [(32,)] or [(32,), (42,), (54,)]
    :param entries_only: bool, if entries only is True function returns an array, otherwise returns a dict
    :param key_type: tuple or str
    :param indicator_type: indicator type
    :param r: reported level
    :return:
    array:



    dict: if r=2 and array = [(23,), (43,)] then return will look like:
    {
      (23,43): {c: 0, d:0, v:0},
      (23,): {c: 0, d:0, v:0}
      (43,): {c: 0, d:0, v:0}
    }
    """

    if entries_only:
        output = []

    else:
        output = {}

    for idx in range(r):
        id_pairs = []

        if idx == 0:
            # TODO: id_pairs.extend(array) instead of next couple of lines
            # actually the tod might break if the format is list of list not list of tuples
            for id_list in array:
                id_pairs.extend(list(product(id_list)))

        elif idx == 1:
            # TODO: if we can count on array being list of tuples we can simplify this:
            #
            # list(combinations([e[0] for e in array], 2))
            combination_id_list_pairs = get_combination_pairs(array, r=2)

            for id_list_pair in combination_id_list_pairs:
                id_pairs.extend(list(product(*id_list_pair)))

        elif idx == 2:
            # TODO: simplfify [tuple(i[0] for i in array)]
            id_pairs = list(product(*array))

        # assuming the passed in array is one of [(32,)] or [(23,), (43,)]  or [(32,), (42,), (54,)]
        # if idx = 0 the id_pairs will be:
        # [(32,)] or [(23,), (43,)]  or [(32,), (42,), (54,)] (basically same as array if array was passed in w tuples
        #
        # if idx = 1 the id_pairs will be
        # [(23,), (43,)] for [(23,), (43,)] or
        # [(32,42), (32,54), (42,54)] for [(32,), (42,), (54,)]
        #
        # if idx = 2 the id_pairs will be:
        # [(23, 43)] for [(23,), (43,)]  or
        # [(32, 42, 54,)] for [(32,), (42,), (54,)] - because idx2 elif replaces id_pairs
        # note that the following code executes for every idx

        # on idx = 1 the following code replaces the already existing 0 or if the output is array it adds the
        #  same keys twice
        for id_tuple in id_pairs:
            key = key_type(id_tuple)

            if entries_only:
                output.append(key)

            else:
                if indicator_type == "quantity":
                    output[key] = {
                        'v': random.randint(50, 1000),
                        'd': 1,
                        'c': 0
                    }

                elif indicator_type == "ratio":
                    output[key] = {
                        'v': random.randint(50, 1000),
                        'd': random.randint(2000, 4000),
                        'c': 0
                    }

    key = key_type(tuple())

    if entries_only:
        output.append(key)

    else:
        if indicator_type == "quantity":
            output[key] = {
                'v': random.randint(50, 1000),
                'd': 1,
                'c': 0
            }

        elif indicator_type == "ratio":
            output[key] = {
                'v': random.randint(50, 1000),
                'd': random.randint(2000, 4000),
                'c': 0
            }

    return output


def get_sorted_ordered_dict_by_keys(dictionary, reverse=True, key_func=None):
    """
    Returns a copy of passed-in dictionary as OrderedDict instance,
    after sorting the items by key.
    """
    if key_func:
        ordered_dict = OrderedDict(
            sorted(dictionary.items(), reverse=reverse, key=key_func))

    else:
        ordered_dict = OrderedDict(
            sorted(dictionary.items(), reverse=reverse))

    return ordered_dict


def get_cast_dictionary_keys_as_tuple(dictionary):
    """
    Returns a copy of passed-in dictionary as dict instance,
    after casting all of its keys as tuple.
    """
    casted_dictionary = dict()

    for key in dictionary.copy().keys():
        casted_dictionary[literal_eval(key)] = dictionary[key]

    return casted_dictionary


def get_cast_dictionary_keys_as_string(dictionary):
    """
    Returns a copy of passed-in dictionary as dict instance,
    after casting all of its keys as string.
    """
    casted_dictionary = dict()

    for key in dictionary.copy().keys():
        casted_dictionary[str(key)] = dictionary[key]

    return casted_dictionary


def get_num_of_days_in_a_month(year, month):
    return monthrange(year, month)[1]


def get_current_quarter_for_a_month(month):
    return int(math.ceil(float(month) / 3))


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


def calculate_end_date_given_start_date(start_date, frequency, cs_dates=None):
    end_date = None

    if frequency == PD_FREQUENCY_LEVEL.weekly:
        end_date = start_date + timedelta(6)

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

    elif frequency == PD_FREQUENCY_LEVEL.custom_specific_dates:
        for idx, cs_date in enumerate(cs_dates):
            if cs_date > start_date:
                end_date = cs_date - timedelta(days=1)
                break

    return end_date


def find_missing_frequency_period_dates_for_indicator_report(indicator, latest_indicator_report_date, frequency):
    # PD_FREQUENCY_LEVEL can be used interchangeably
    today = date.today()
    indicator_start_date = None
    indicator_end_date = None

    if indicator.content_type.model in ["clusterobjective", "clusteractivity"]:
        indicator_start_date = indicator.content_object.cluster.response_plan.start
        indicator_end_date = indicator.content_object.cluster.response_plan.end

    if indicator.content_type.model in ["partnerproject", "lowerleveloutput"]:
        indicator_start_date = indicator.content_object.start_date
        indicator_end_date = indicator.content_object.end_date

    if indicator.content_type.model == "partneractivityprojectcontext":
        indicator_start_date = None
        indicator_end_date = None

        if not indicator_start_date or indicator_start_date > indicator.content_object.start_date:
            indicator_start_date = indicator.content_object.start_date

        if not indicator_end_date or indicator_end_date < indicator.content_object.end_date:
            indicator_end_date = indicator.content_object.end_date

    # Override start date if indicator has its own start date
    if indicator.start_date_of_reporting_period:
        indicator_start_date = indicator.start_date_of_reporting_period

    date_to_compare = latest_indicator_report_date if latest_indicator_report_date else indicator_start_date
    date_list = []

    if not date_to_compare or not indicator_end_date:
        return date_list

    # Only add 1 day to date_to_compare if it came from latest_indicator_report_date
    # in order to set next date period correctly
    if latest_indicator_report_date:
        date_to_compare += timedelta(1)

    # For now, we only generate missing dates for the past.
    if today > date_to_compare and indicator_end_date > date_to_compare:
        # day_delta as a flag to decrement day_delta_counter for next date
        # day_delta_counter as a date day integer to indicate next date
        if today > indicator_end_date:
            day_delta = (indicator_end_date - date_to_compare).days
            date_to_subtract_from = indicator_end_date
        else:
            day_delta = (today - date_to_compare).days
            date_to_subtract_from = today

        day_delta_counter = day_delta

        # Keep adding missing date until we get caught up with day_delta
        while day_delta_counter > 0:
            can_add = True

            missing_date = date_to_subtract_from - timedelta(day_delta_counter)

            # If this is generating monthly report first time, adjust the date_to_subtract_from to prevent
            # duplicate pro-rata dates
            if frequency == PD_FREQUENCY_LEVEL.monthly and not latest_indicator_report_date and date_list:
                missing_date = missing_date.replace(day=1)

            if frequency == PD_FREQUENCY_LEVEL.weekly:
                # Check if we should proceed to next date
                if day_delta >= 7:
                    # If day_delta_counter has more week date to create
                    if day_delta_counter >= 7:
                        day_delta_counter -= 7

                    # We have exhausted day_delta_counter successfully. Exiting
                    else:
                        day_delta_counter = 0

                else:
                    break

            elif frequency == PD_FREQUENCY_LEVEL.monthly:
                # Get the # of days in target month
                num_of_days = get_num_of_days_in_a_month(
                    missing_date.year, missing_date.month)

                # Check if we should proceed to next date
                if day_delta >= num_of_days:
                    # If day_delta_counter has more months to create
                    if day_delta_counter >= num_of_days:
                        day_delta_counter -= num_of_days

                    # We have exhausted day_delta_counter successfully. Exiting
                    else:
                        day_delta_counter = 0

                else:
                    # For handling a case to start in the middle of month, add this missing date
                    # only if new date is later than start date
                    if indicator_start_date <= missing_date and can_add:
                        date_list.append(missing_date)

                    break

            elif frequency == PD_FREQUENCY_LEVEL.quarterly:
                quarter = get_current_quarter_for_a_month(missing_date.month)
                end_quarter_date = get_last_date_of_a_quarter(
                    missing_date.year, quarter=quarter)

                quarter_day_delta = (end_quarter_date - missing_date).days

                # See if we got more days to go but we are at the last day of
                # the quarter
                if quarter_day_delta == 0:
                    # If current missing date is in same month as today's
                    # month, then we know we have exhausted day_delta_counter
                    # successfully. Exiting
                    if missing_date.month == today.month:
                        day_delta_counter = 0

                    else:
                        day_delta_counter -= 1
                        can_add = False

                # Check if we should proceed to next date
                elif day_delta >= quarter_day_delta:
                    # If day_delta_counter has more days to create
                    if day_delta_counter >= quarter_day_delta:
                        day_delta_counter -= quarter_day_delta

                    # We have exhausted day_delta_counter successfully. Exiting
                    else:
                        day_delta_counter = 0

                else:
                    break

            # Only add new date if it's later than start date
            if indicator_start_date <= missing_date and can_add:
                date_list.append(missing_date)

    return date_list


def get_latest_pr_by_type(pd, report_type):
    """
    Return latest ProgressReport instance given report_type

    Arguments:
        report_type {str} -- A report type as string: [QPR, HR, SR]

    Returns:
        ProgressReport -- Latest ProgressReport instance for given report_type
    """

    qs = pd.progress_reports.all()

    order_by_field = {"QPR": "start_date", "HR": "id", "SR": "due_date"}[report_type]

    return qs.filter(report_type=report_type).order_by(order_by_field).last()


@transaction.atomic
def create_pr_sr_for_report_type(pd, idx, reporting_period):
    """
    Create ProgressReport SR instance by its ReportingPeriodDate

    Arguments:
        pd {ProgrammeDocument} -- ProgrammeDocument instance for ProgressReport to generate
        idx {int} -- Integer to denote report number
        reporting_period {ReportingPeriodDates} -- ReportingPeriodDates instance for new ProgressReport

    Returns:
        Tuple[ProgressReport, datetime.datetime, datetime.datetime, datetime.datetime]
        - Newly generated ProgressReport & 3 datetime objects
    """
    from etools_prp.apps.unicef.models import ProgressReport

    start_date = reporting_period.start_date
    end_date = reporting_period.end_date
    due_date = reporting_period.due_date

    logger.info(f"SR ProgressReport with due date: {due_date}")

    is_final = idx == pd.reporting_periods.filter(report_type='SR').count()

    next_progress_report, created = ProgressReport.objects.update_or_create(
        programme_document=pd,
        report_type='SR',
        report_number=idx,
        is_final=is_final,
        defaults={
            'start_date': start_date,
            'end_date': end_date,
            'due_date': due_date,
        }
    )
    if created:
        logger.info(f"Created new SR{idx} ProgressReport id {next_progress_report.id} for due date {due_date}")


@transaction.atomic
def create_pr_for_report_type(pd, idx, reporting_period, generate_from_date):
    """
    Create ProgressReport instance by its ReportingPeriodDate instance's report type

    Arguments:
        pd {ProgrammeDocument} -- ProgrammeDocument instance for ProgressReport to generate
        idx {int} -- Integer to denote report number
        reporting_period {ReportingPeriodDates} -- ReportingPeriodDates instance for new ProgressReport
        generate_from_date {datetime.datetime} -- datetime instance from latest ProgressReport on same report

    Returns:
        Tuple[ProgressReport, datetime.datetime, datetime.datetime, datetime.datetime]
        - Newly generated ProgressReport & 3 datetime objects
    """
    from etools_prp.apps.unicef.models import ProgressReport

    end_date = reporting_period.end_date
    due_date = reporting_period.due_date
    start_date = reporting_period.start_date

    # Create ProgressReport first
    logger.info("Creating {} ProgressReport for {} - {}".format(reporting_period.report_type, start_date, end_date))

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

    next_progress_report = ProgressReport.objects.create(
        start_date=start_date,
        end_date=end_date,
        due_date=due_date,
        programme_document=pd,
        report_type=report_type,
        report_number=report_number,
        is_final=is_final,
    )
    if pd.document_type == PD_DOCUMENT_TYPE.GDD:
        from etools_prp.apps.unicef.models import GPDProgressReport

        GPDProgressReport.objects.create(
            gpd_report=next_progress_report
        )

    return next_progress_report, start_date, end_date, due_date


def create_pr_ir_for_reportable(pd, reportable, pai_ir_for_period, start_date, end_date, due_date):
    """Create an IndicatorReport instance for ProgressReport instance later to attach.
    If PartnerActivity IndicatorReport is present, the new IndicatorReport instance will associate
    it as parent IndicatorReport instance, enabling dual-reporting feature.

    Arguments:
        pd {ProgrammeDocument} -- ProgrammeDocument instance for logger
        reportable {Reportable} -- Reportable instance to associate with new IndicatorReport instance
        pai_ir_for_period {IndicatorReport} -- An optional IndicatorReport instance from PartnerActivity Reportable
        start_date {datetime.date} -- Date object as report start date
        end_date {datetime.date} -- Date object as report end date
        due_date {datetime.date} -- Date object as report due date

    Returns:
        IndicatorReport -- A newly created IndicatorReport instance
    """

    from etools_prp.apps.indicator.models import (
        IndicatorBlueprint,
        IndicatorLocationData,
        IndicatorReport,
        ReportingEntity,
    )

    if not pai_ir_for_period:
        ir_title = reportable.blueprint.title
    else:
        ir_title = f"{reportable.blueprint.title} -- Project {pai_ir_for_period.reportable.content_object.project.title}"

    if reportable.blueprint.unit == IndicatorBlueprint.NUMBER:
        logger.info("Creating Quantity IndicatorReport for {} - {}".format(start_date, end_date))
        indicator_report = IndicatorReport.objects.create(
            progress_report=None,
            reportable=reportable,
            parent=pai_ir_for_period,
            time_period_start=start_date,
            time_period_end=end_date,
            due_date=due_date,
            title=ir_title,
            total={'c': 0, 'd': 0, 'v': 0},
            overall_status="NoS",
            report_status="Due",
            submission_date=None,
            reporting_entity=ReportingEntity.objects.get(title="UNICEF"),
        )

        for location_goal in reportable.reportablelocationgoal_set.filter(is_active=True):
            logger.info("Creating IndicatorReport {} IndicatorLocationData for {} - {}".format(
                indicator_report, start_date, end_date
            ))
            IndicatorLocationData.objects.create(
                indicator_report=indicator_report,
                location=location_goal.location,
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
        indicator_report = IndicatorReport.objects.create(
            progress_report=None,
            reportable=reportable,
            parent=pai_ir_for_period,
            time_period_start=start_date,
            time_period_end=end_date,
            due_date=due_date,
            title=ir_title,
            total={'c': 0, 'd': 0, 'v': 0},
            overall_status="NoS",
            report_status="Due",
            submission_date=None,
            reporting_entity=ReportingEntity.objects.get(title="UNICEF"),
        )

        for location_goal in reportable.reportablelocationgoal_set.filter(is_active=True):
            logger.info("Creating IndicatorReport {} IndicatorLocationData {} - {}".format(
                indicator_report, start_date, end_date
            ))
            IndicatorLocationData.objects.create(
                indicator_report=indicator_report,
                location=location_goal.location,
                num_disaggregation=indicator_report.disaggregations.count(),
                level_reported=indicator_report.disaggregations.count(),
                disaggregation_reported_on=list(indicator_report.disaggregations.values_list(
                    'id', flat=True)),
                disaggregation={
                    '()': {'c': 0, 'd': 0, 'v': 0}
                },
            )

    return indicator_report


@transaction.atomic
def create_ir_and_ilds_for_pr(pd, reportable_queryset, next_progress_report, start_date, end_date, due_date):
    """
    Create a set of new IndicatorReports and IndicatorLocationData instances per
    IndicatorReport instance, with passed-in new dates and new ProgressReport instance

    Arguments:
        pd {ProgrammeDocument} -- ProgrammeDocument instance
        reportable_queryset {django.Queryset[Reportable]} -- Reportable queryset on LLO
        next_progress_report {ProgressReport} -- Newly generated Progress Report instance
        start_date {datetime.datetime} -- Start date for reporting
        end_date {datetime.datetime} -- End date for reporting
        due_date {datetime.datetime} -- due date for reporting
    """
    from etools_prp.apps.indicator.models import IndicatorReport, Reportable
    from etools_prp.apps.unicef.models import ProgressReport

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
                pd,
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
                is_final_hr_req = next_progress_report.is_final
                next_progress_report.delete()

            else:
                # Pre-populate new HR report_number in case a new Progress Report needs to be generated
                report_number = next_progress_report.report_number + 1
                is_final_hr_req = next_progress_report.is_final
                hr_reports.append(next_progress_report)

            # Process cluster Reportables separately
            for reportable in reportable_queryset.filter(ca_indicator_used_by_reporting_entity__isnull=False):
                cai_indicator = reportable.ca_indicator_used_by_reporting_entity
                pai_irs_for_periods = None

                # If LLO indicator has ClusterActivity Indicator ID reference,
                # find the adopted PartnerActivity indicator from ClusterActivity Indicator
                # with LLO's Partner ID
                # and grab a corresponding IndicatorReport from ClusterActivity Indicator
                # given the start & end date
                if cai_indicator:
                    try:
                        # Grabbing all adopted partner activities
                        pai_indicators = cai_indicator.children \
                            .filter(partner_activity_project_contexts__activity__partner=pd.partner)

                        # Cluster indicators matching PMP HR reporting requirement
                        pai_irs_for_periods = IndicatorReport.objects.filter(
                            reportable__in=pai_indicators,
                            time_period_start=start_date,
                            time_period_end=end_date,
                        ).distinct()

                        if pai_irs_for_periods.exists():
                            for pai_ir_for_period in pai_irs_for_periods:
                                indicator_report = create_pr_ir_for_reportable(
                                    pd,
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
                                    # Otherwise, create a new HR progress report
                                    # for this cluster LLO Indicator report
                                    new_cluster_hr_progress_report = ProgressReport.objects.create(
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

                        else:
                            # Cluster only progress report segregation
                            pai_irs_for_periods = IndicatorReport.objects.filter(
                                reportable__in=pai_indicators,
                                time_period_start__gte=start_date,
                                time_period_end__lte=end_date,
                            ).distinct()

                            for pai_ir_for_period in pai_irs_for_periods:
                                indicator_report = create_pr_ir_for_reportable(
                                    pd,
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
                                    # Otherwise, create a new HR progress report
                                    # for this cluster LLO Indicator report
                                    new_cluster_hr_progress_report = ProgressReport.objects.create(
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
                            "FAILURE: CANNOT FIND adopted PartnerActivity Reportables "
                            "from given ClusterActivity Reportable and PD Partner ID. "
                            "Skipping link!", e)
                    except IndicatorReport.DoesNotExist as e:
                        logger.exception(
                            "FAILURE: CANNOT FIND IndicatorReports from adopted PartnerActivity Reportables "
                            "linked with LLO Reportable. "
                            "Skipping link!", e)

                    # If this function is called with next_progress_report as final report
                    # We may have to recalculate latest progress report and re-assign is_final flag again
                    if is_final_hr_req:
                        pd.progress_reports.filter(report_type="HR", is_final=True).update(is_final=False)
                        latest_hr = pd.progress_reports.filter(report_type="HR").order_by('id').last()
                        latest_hr.is_final = True
                        latest_hr.save()


@transaction.atomic
def update_ir_and_ilds_for_pr(progress_report, active_reportables, reporting_period):
    from etools_prp.apps.indicator.models import Reportable
    active_irs = progress_report.indicator_reports.filter(reportable__active=True).all()

    existing_reportabes = Reportable.objects.filter(indicator_reports__in=active_irs)
    to_create = active_reportables.difference(existing_reportabes)

    for reportable in to_create:
        indicator_report = create_pr_ir_for_reportable(
            progress_report, reportable, None,
            reporting_period.start_date, reporting_period.end_date, reporting_period.due_date
        )
        # Save Signal to recalculate reportable totals
        indicator_report.progress_report = progress_report
        indicator_report.save()


def create_ir_for_cluster(reportable, start_date, end_date, project):
    """
    Create a new IndicatorReport and its IndicatorLocationData instances,
    with passed-in new dates

    Arguments:
        reportable {Reportable} -- Reportable instance to create report for
        start_date {datetime.datetime} -- Start date for reporting
        end_date {datetime.datetime} -- End date for reporting
        project {PartnerProject} -- PartnerProject context to bind

    Returns:
        IndicatorReport -- Newly generated IndicatorReport instance
    """
    from etools_prp.apps.indicator.models import (
        IndicatorBlueprint,
        IndicatorLocationData,
        IndicatorReport,
        ReportingEntity,
    )

    if reportable.blueprint.unit == IndicatorBlueprint.NUMBER:
        logger.info("Creating Indicator {} Quantity IndicatorReport object for {} - {}".format(
            reportable, start_date, end_date
        ))

        indicator_report = IndicatorReport.objects.create(
            reportable=reportable,
            project=project,
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

        for location_goal in reportable.reportablelocationgoal_set.filter(is_active=True):
            logger.info("Creating IndicatorReport {} IndicatorLocationData object {} - {}".format(
                indicator_report, start_date, end_date
            ))

            IndicatorLocationData.objects.create(
                indicator_report=indicator_report,
                location=location_goal.location,
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

        indicator_report = IndicatorReport.objects.create(
            reportable=reportable,
            project=project,
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

        for location_goal in reportable.reportablelocationgoal_set.filter(is_active=True):
            logger.info("Creating IndicatorReport {} IndicatorLocationData object {} - {}".format(
                indicator_report, start_date, end_date
            ))

            IndicatorLocationData.objects.create(
                indicator_report=indicator_report,
                location=location_goal.location,
                num_disaggregation=indicator_report.disaggregations.count(),
                level_reported=indicator_report.disaggregations.count(),
                disaggregation_reported_on=list(indicator_report.disaggregations.values_list(
                    'id', flat=True)),
                disaggregation={
                    '()': {'c': 0, 'd': 0, 'v': 0}
                },
            )

    return indicator_report
