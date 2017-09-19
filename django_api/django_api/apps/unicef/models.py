from __future__ import unicode_literals
from decimal import Decimal
from datetime import date
import logging

from django.db import models
from django.contrib.contenttypes.fields import GenericRelation
from django.contrib.postgres.fields import ArrayField
from django.utils.functional import cached_property

from model_utils.models import TimeStampedModel

from core.common import (
    PD_FREQUENCY_LEVEL,
    INDICATOR_REPORT_STATUS,
    PD_LIST_REPORT_STATUS,
    PD_DOCUMENT_TYPE,
    PROGRESS_REPORT_STATUS,
    PD_STATUS,
    CURRENCIES,
)
from indicator.models import Reportable  # IndicatorReport

logger = logging.getLogger(__name__)


class Section(models.Model):
    """
    Section model define atomic act of help like: bottle of water, blanket.
    """
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Person(models.Model):
    name = models.CharField(max_length=128, verbose_name='Name')
    title = models.CharField(max_length=255, verbose_name='Title')
    phone_number = models.CharField(max_length=64, verbose_name='Phone Number')
    email = models.CharField(max_length=255, verbose_name='Phone Number')

    def __unicode__(self):
        return self.name


class ProgrammeDocument(TimeStampedModel):
    """
    ProgrammeDocument model describe agreement between UNICEF & Partner to realize document and
    reports are feedback for this assignment.

    related models:
        unicef.Section (ManyToManyField): "sections"
        Person  (ManyToManyField): "officer_programme_documents"
        Person  (ManyToManyField): "unicef_focal_programme_documents"
        Person  (ManyToManyField): "officer_programme_documents"
        Workspace (ForeignKey): "workspace_programme_documents"
    """
    agreement = models.CharField(max_length=255, verbose_name='Agreement')
    document_type = models.CharField(
        max_length=3,
        choices=PD_DOCUMENT_TYPE,
        default=PD_DOCUMENT_TYPE.PD,
        verbose_name='Document Type'
    )

    reference_number = models.CharField(max_length=255, verbose_name='Reference Number')
    title = models.CharField(max_length=255,
                             verbose_name='PD/SSFA ToR Title')
    unicef_office = models.CharField(max_length=255,
                                     verbose_name='UNICEF Office(s)')

    unicef_officers = models.ManyToManyField(Person,
                                              verbose_name='UNICEF Officer(s)',
                                              related_name="officer_programme_documents")
    unicef_focal_point = models.ManyToManyField(Person,
                                                verbose_name='UNICEF Focal Point(s)',
                                                related_name="unicef_focal_programme_documents")
    partner_focal_point = models.ManyToManyField(Person,
                                                 verbose_name='Partner Focal Point(s)',
                                                 related_name="partner_focal_programme_documents")
    workspace = models.ForeignKey('core.Workspace',
                                  related_name="partner_focal_programme_documents")

    partner = models.ForeignKey('partner.Partner')

    start_date = models.DateField(
        verbose_name='Start Programme Date',
    )
    end_date = models.DateField(
        verbose_name='Due Date',
    )
    population_focus = models.CharField(
        max_length=256,
        verbose_name='Population Focus')
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
    frequency = models.CharField(
        max_length=3,
        choices=PD_FREQUENCY_LEVEL,
        default=PD_FREQUENCY_LEVEL.monthly,
        verbose_name='Frequency of reporting'
    )

    budget = models.DecimalField(
        decimal_places=2,
        max_digits=12,
        blank=True,
        null=True,
        help_text='Total Budget'
    )
    budget_currency = models.CharField(
        choices=CURRENCIES,
        default=CURRENCIES.usd,
        max_length=16,
        verbose_name='Budget Currency'
    )

    # intervention budged model from etool !!!
    cso_contribution = models.DecimalField(
        decimal_places=2,
        max_digits=12,
        default=0,
        verbose_name='CSO Contribution'
    )
    cso_contribution_currency = models.CharField(
        choices=CURRENCIES,
        default=CURRENCIES.usd,
        max_length=16,
        verbose_name='CSO Contribution Currency'
    )

    # intervention budged model from etool !!!
    total_unicef_cash = models.DecimalField(
        decimal_places=2,
        max_digits=12,
        default=0,
        verbose_name='UNICEF cash'
    )
    total_unicef_cash_currency = models.CharField(
        choices=CURRENCIES,
        default=CURRENCIES.usd,
        max_length=16,
        verbose_name='UNICEF cash Currency'
    )

    # intervention budged model from etool !!!
    in_kind_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name='UNICEF Supplies'
    )
    in_kind_amount_currency = models.CharField(
        choices=CURRENCIES,
        default=CURRENCIES.usd,
        max_length=16,
        verbose_name='UNICEF Supplies Currency'
    )

    cs_dates = ArrayField(models.DateField(), default=list)

    # TODO:
    # cron job will create new report with due period !!!
    #
    # TODO:
    # report status for ProgrammeDocument

    __due_date = None
    __report_status = None
    __reports_exists = None
    __budget = None

    class Meta:
        ordering = ['-id']

    def __str__(self):
        return self.title

    @cached_property
    def reportable_queryset(self):
        return Reportable.objects.filter(
            lower_level_outputs__cp_output__programme_document=self)

    @property
    def reports_exists(self):
        if self.__reports_exists is None:
            self.__reports_exists = self.reportable_queryset.exists()
        return self.__reports_exists

    @property
    def contain_overdue_report(self):
        return self.reportable_queryset.filter(
            indicator_reports__time_period_start__lt=date.today(),
            indicator_reports__report_status=INDICATOR_REPORT_STATUS.due
        ).exists()

    @property
    def contain_nothing_due_report(self):
        if not self.contain_overdue_report:
            ontop_report = self.reportable_queryset \
                .order_by('indicator_reports__time_period_start') \
                .indicator_reports.last()

            if ontop_report and ontop_report.report_status != INDICATOR_REPORT_STATUS.due:
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
            indicator_reports__time_period_start__lt=date.today(),
            indicator_reports__report_status=INDICATOR_REPORT_STATUS.due
        ) \
            .order_by('indicator_reports__time_period_start') \
            .last().indicator_reports.last()

        if due_report:
            self.__due_date = due_report.time_period_start
        else:
            due_report = self.reportable_queryset.order_by('indicator_reports__time_period_start') \
                .last() \
                .indicator_reports.last()
            self.__due_date = due_report and due_report.time_period_start

        return self.__due_date

    @property
    def total_unicef_contribution(self):
        return self.total_unicef_cash + self.in_kind_amount

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
            consumed = consumed['c']

        try:
            percentage = Decimal(consumed) / Decimal(total)
            percentage = int(percentage * 100)
        except Exception as exp:
            logger.exception({
                "model": "ProgrammeDocument",
                "def": 'calculated_budget',
                "pk": self.id,
                "exception": exp
            })
            percentage = 0

        self.__budget = "{total} ({consumed}%)".format(total=total, consumed=consumed)
        return self.__budget

    @property
    def frequency_delta_days(self):
        if self.frequency == PD_FREQUENCY_LEVEL.weekly:
            return 7
        elif self.frequency == PD_FREQUENCY_LEVEL.monthly:
            return 30
        elif self.frequency == PD_FREQUENCY_LEVEL.quarterly:
            return 90
        else:
            raise NotImplemented("Not recognized PD_FREQUENCY_LEVEL.")


def find_first_programme_document_id():
    try:
        import pdb; pdb.set_trace()
        pd_id = ProgrammeDocument.objects.first().id
    except AttributeError:
        from core.factories import ProgrammeDocumentFactory
        pd = ProgrammeDocumentFactory()
        pd_id = pd.id
    else:
        return pd_id


class ProgressReport(TimeStampedModel):
    partner_contribution_to_date = models.CharField(max_length=256)
    funds_received_to_date = models.CharField(max_length=256)
    challenges_in_the_reporting_period = models.CharField(max_length=256)
    proposed_way_forward = models.CharField(max_length=256)
    status = models.CharField(max_length=3, choices=PROGRESS_REPORT_STATUS,
                              default=PROGRESS_REPORT_STATUS.due)
    programme_document = models.ForeignKey(ProgrammeDocument,
                                           related_name="progress_reports",
                                           default=-1)
    # attachements ???

    start_date = models.DateField(verbose_name='Start Date')
    end_date = models.DateField(verbose_name='End Date')
    due_date = models.DateField(verbose_name='Due Date')
    submission_date = models.DateField(verbose_name='Submission Date',
                                       blank=True, null=True)
    submitted_by = models.ForeignKey('account.User',
                                     blank=True, null=True)

    sent_back_date = models.DateField(verbose_name='Sent Back Date',
                                      blank=True, null=True)
    sent_back_feedback = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-id']

    @cached_property
    def latest_indicator_report(self):
        return self.indicator_reports.all().order_by('-created').first()


class CountryProgrammeOutput(TimeStampedModel):
    """
    CountryProgrammeOutput (LLO Parent) module.

    related models:
        unicef.ProgrammeDocument (ForeignKey): "programme_document"
    """
    title = models.CharField(max_length=255)
    programme_document = models.ForeignKey(ProgrammeDocument, related_name="cp_outputs")

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.title


class LowerLevelOutput(TimeStampedModel):
    """
    LowerLevelOutput (PD output) module describe the goals to reach in PD scope.

    related models:
        unicef.CountryProgrammeOutput (ForeignKey): "indicator"
        indicator.Reportable (GenericRelation): "reportables"
    """
    title = models.CharField(max_length=255)
    cp_output = models.ForeignKey(CountryProgrammeOutput, related_name="ll_outputs")
    reportables = GenericRelation('indicator.Reportable', related_query_name='lower_level_outputs')

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.title
