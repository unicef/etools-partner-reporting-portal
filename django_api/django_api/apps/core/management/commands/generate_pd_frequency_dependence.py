import math
from datetime import date
from django.db import transaction
from django.core.management.base import BaseCommand

from core.common import (
    FREQUENCY_LEVEL,
    PD_FREQUENCY_LEVEL,
    REPORTABLE_FREQUENCY_LEVEL,
    PD_STATUS,
)
from unicef.models import ProgressReport, ProgrammeDocument
from indicator.models import IndicatorReport, Reportable


def find_missing_frequency_period_dates(start_date, last_date, frequency):
    # PD_FREQUENCY_LEVEL can be used interchangeably
    today = date.today()
    date_list = []

    if frequency == PD_FREQUENCY_LEVEL.weekly:
        pass

    if frequency == PD_FREQUENCY_LEVEL.monthly:
        pass

    if frequency == PD_FREQUENCY_LEVEL.quarterly:
        pass

    if frequency == PD_FREQUENCY_LEVEL.custom_specific_dates:
        pass

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
            frequency = pd.frequency

            latest_progress_report = pd.progress_reports.last()

            if latest_progress_report:
                pass

            else:
                pass

            with transaction.atomic():
                pass
