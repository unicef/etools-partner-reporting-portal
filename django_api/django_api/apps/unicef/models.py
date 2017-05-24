from __future__ import unicode_literals
from decimal import Decimal
from datetime import date

from django.db import models, transaction
from django.contrib.contenttypes.fields import GenericRelation
from django.utils.functional import cached_property

from model_utils.models import TimeStampedModel

from core.common import (
    ADMINISTRATIVE_LEVEL,
    FREQUENCY_LEVEL,
    INDICATOR_REPORT_STATUS,
    PD_LIST_REPORT_STATUS,
    PD_STATUS,
)
from indicator.models import IndicatorReport, Reportable


class ProgressReport(TimeStampedModel):
    partner_contribution_to_date = models.CharField(max_length=256)
    funds_received_to_date = models.CharField(max_length=256)
    challenges_in_the_reporting_period = models.CharField(max_length=256)
    proposed_way_forward = models.CharField(max_length=256)
    # attachements ???


class Section(models.Model):
    name = models.CharField(max_length=255)

    def __unicode__(self):
        return self.name


class ProgrammeDocument(TimeStampedModel):

    agreement = models.CharField(max_length=255, verbose_name='Agreement')
    reference_number = models.CharField(max_length=255, verbose_name='Reference Number')
    title = models.CharField(max_length=255, verbose_name='PD/SSFA ToR Title')
    start_date = models.DateField(
        verbose_name='Start Programme Date',
    )
    end_date = models.DateField(
        verbose_name='Due Date',
    )
    population_focus = models.CharField(
        max_length=256,
        verbose_name='Population Focus')
    response_to_HRP = models.CharField(
        max_length=256,
        blank=True,
        null=True,
        verbose_name='In response to an HRP')
    status = models.CharField(
        choices=PD_STATUS,
        default=PD_STATUS.draft,
        max_length=256,
        verbose_name='PD/SSFA status'
    )
    sections = models.ManyToManyField(Section)
    contributing_to_cluster = models.BooleanField(
        default=True,
        verbose_name='Contributing to Cluster'
    )
    administrative_level = models.CharField(
        max_length=3,
        choices=ADMINISTRATIVE_LEVEL,
        default=ADMINISTRATIVE_LEVEL.country,
        verbose_name='Locations - administrative level'
    )
    frequency = models.CharField(
        max_length=3,
        choices=FREQUENCY_LEVEL,
        default=FREQUENCY_LEVEL.monthly,
        verbose_name='Frequency of reporting'
    )
    budget = models.DecimalField(
        decimal_places=2,
        max_digits=12,
        blank=True,
        null=True,
        help_text='Total Budget'
    )

    # TODO:
    # cron job will create new report with due period !!!

    __due_date = None
    __report_status = None
    __reports_exists = None
    __budget = None

    @cached_property
    def reportable_queryset(self):
        return Reportable.objects.filter(
            lower_level_outputs__indicator__programme_document=self)

    @property
    def reports_exists(self):
        if self.__reports_exists is None:
            self.__reports_exists = self.reportable_queryset.exists()
        return self.__reports_exists

    @property
    def contain_overdue_report(self):
        return self.reportable_queryset.filter(
            indicator_reports__time_period__lt=date.today(),
            indicator_reports__report_status=INDICATOR_REPORT_STATUS.ontrack
        ).exists()

    @property
    def contain_nothing_due_report(self):
        if not self.contain_overdue_report:
            ontop_report = self.reportable_queryset \
                .order_by('indicator_reports__time_period') \
                .indicator_reports.last()

            if ontop_report and ontop_report.report_status != INDICATOR_REPORT_STATUS.ontrack:
                return True
        return False

    @property
    def report_status(self):
        # TODO: this should be cached (it's expensive) - redis will be perfect with midnight reset !!!
        if self.__report_status is not None:
            return self.__report_status
        if not self.reports_exists:
            self.__report_status = PD_LIST_REPORT_STATUS.nothing_due
        elif self.contain_overdue_report:
            self.__report_status = PD_LIST_REPORT_STATUS.overdue
        elif self.contain_nothing_due_report:
            self.__report_status = PD_LIST_REPORT_STATUS.nothing_due
        else:
            self.__report_status = PD_LIST_REPORT_STATUS.due
        return self.__report_status

    @property
    def due_date(self):
        # TODO: this can be cached - redis will be perfect with midnight reset !!!
        if self.__due_date is not None:
            return self.__due_date
        elif not self.reports_exists:
            return None

        due_report = self.reportable_queryset.filter(
            indicator_reports__time_period__lt=date.today(),
            indicator_reports__report_status=INDICATOR_REPORT_STATUS.ontrack
        ) \
            .order_by('indicator_reports__time_period') \
            .last().indicator_reports.last()

        if due_report:
            self.__due_date = due_report.time_period
        else:
            due_report = self.reportable_queryset.order_by('time_period') \
                .last() \
                .indicator_reports.last()
            self.__due_date = due_report and due_report.time_period

        return self.__due_date

    @property
    def calculated_budget(self):
        if self.__budget is not None:
            return self.__budget

        total = self.budget
        consumed = None

        if not self.reportable_queryset.exists():
            self.__budget = ""
            return self.__budget
        else:
            consumed = self.reportable_queryset.last().total

        try:
            percentage = Decimal(consumed) / Decimal(total)
            percentage = int(percentage * 100)
        except Exception as exp:
            # TODO log
            percentage = 0

        self.__budget = "{total} ({consumed}%)".format(total=total, consumed=consumed)
        return self.__budget

    @property
    def frequency_delta_days(self):
        if self.frequency == FREQUENCY_LEVEL.weekly:
            return 7
        elif self.frequency == FREQUENCY_LEVEL.monthly:
            return 30
        elif self.frequency == FREQUENCY_LEVEL.quartely:
            return 90
        else:
            raise NotImplemented("Not recognized FREQUENCY_LEVEL.")

    def __unicode__(self):
        return self.title

    # @transaction.atomic
    # def save(self, *args, **kwargs):
    #     is_new = self.pk is None
    #     super(ProgrammeDocument, self).save(*args, **kwargs)
    #     if is_new:
    #         IndicatorReport.objects.create(
    #             title='enter data',
    #             programme_document=self,
    #             time_period=self.start_date,
    #         )


class CountryProgrammeOutput(TimeStampedModel):
    title = models.CharField(max_length=255)

    programme_document = models.ForeignKey(ProgrammeDocument, related_name="cp_outputs")


class LowerLevelOutput(TimeStampedModel):
    title = models.CharField(max_length=255)

    indicator = models.ForeignKey(CountryProgrammeOutput, related_name="ll_outputs")

    reportables = GenericRelation('indicator.Reportable', related_query_name='lower_level_outputs')
