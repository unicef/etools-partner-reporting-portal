import logging
import os
from datetime import date

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericRelation
from django.db import models, transaction
from django.db.models import Q
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.functional import cached_property

from model_utils.models import TimeStampedModel
from model_utils.tracker import FieldTracker
from requests.compat import urljoin
from rest_framework.exceptions import ValidationError

from etools_prp.apps.core.common import (
    CURRENCIES,
    DELIVERED_AS_PLANNED_OPTIONS,
    FINAL_REVIEW_CHOICES,
    INDICATOR_REPORT_STATUS,
    OVERALL_STATUS,
    PD_DOCUMENT_TYPE,
    PD_FREQUENCY_LEVEL,
    PD_LIST_REPORT_STATUS,
    PD_STATUS,
    PR_ATTACHMENT_TYPES,
    PROGRESS_REPORT_STATUS,
    PRP_ROLE_TYPES,
    REPORTING_TYPES,
    SR_TYPE,
)
from etools_prp.apps.core.models import (
    Location,
    TimeStampedExternalBusinessAreaModel,
    TimeStampedExternalSyncModelMixin,
)
from etools_prp.apps.indicator.models import Reportable
from etools_prp.apps.utils.emails import send_email_from_template

logger = logging.getLogger(__name__)


class Section(TimeStampedExternalBusinessAreaModel):
    """
    Section model define atomic act of help like: bottle of water, blanket.
    """
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

    class Meta(TimeStampedExternalBusinessAreaModel.Meta):
        pass


class Person(TimeStampedExternalSyncModelMixin):
    name = models.CharField(
        max_length=128,
        verbose_name='Name',
        blank=True,
        null=True)
    title = models.CharField(
        max_length=255,
        verbose_name='Title',
        blank=True,
        null=True)
    phone_number = models.CharField(
        max_length=64,
        verbose_name='Phone Number',
        blank=True,
        null=True)
    email = models.EmailField(max_length=255, verbose_name='Email', unique=True)
    active = models.BooleanField(verbose_name="Is Active", default=True)

    def __str__(self):
        return self.name

    @property
    def is_authorized_officer(self):
        return get_user_model().objects.filter(
            email=self.email,
            realms__group__name=PRP_ROLE_TYPES.ip_authorized_officer,
        ).exists()

    def save(self, *args, **kwargs):
        if self.email != self.email.lower():
            raise ValidationError("Email must be lowercase.")
        super().save(*args, **kwargs)


class ProgrammeDocument(TimeStampedExternalBusinessAreaModel):
    """
    ProgrammeDocument model describe agreement between UNICEF & Partner to
    realize document and reports are feedback for this assignment. The data
    in this model will come from eTools/PMP via a regular sync.

    related models:
        unicef.Section (ManyToManyField): "sections"
        Person  (ManyToManyField): "officer_programme_documents"
        Person  (ManyToManyField): "unicef_focal_programme_documents"
        Person  (ManyToManyField): "officer_programme_documents"
        Workspace (ForeignKey): "workspace_programme_documents"
    """
    agreement = models.CharField(max_length=255, verbose_name='Agreement')

    document_type = models.CharField(
        max_length=4,
        choices=PD_DOCUMENT_TYPE,
        default=PD_DOCUMENT_TYPE.PD,
        verbose_name='Document Type'
    )

    reference_number = models.CharField(max_length=255,
                                        verbose_name='Reference Number',
                                        db_index=True)
    title = models.CharField(max_length=512,
                             verbose_name='PD/SPD ToR Title',
                             db_index=True)
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
    workspace = models.ForeignKey(
        'core.Workspace',
        related_name="partner_focal_programme_documents",
        on_delete=models.CASCADE,
    )

    partner = models.ForeignKey(
        'partner.Partner',
        on_delete=models.CASCADE,
    )

    start_date = models.DateField(
        verbose_name='Start Programme Date',
    )
    end_date = models.DateField(
        verbose_name='Due Date',
    )
    status = models.CharField(
        choices=PD_STATUS,
        default=PD_STATUS.development,
        max_length=256,
        verbose_name='PD/SPD status'
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
        max_digits=64,
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

    # intervention budged model from etool
    cso_contribution = models.DecimalField(
        decimal_places=2,
        max_digits=64,
        default=0,
        verbose_name='CSO Contribution'
    )
    cso_contribution_currency = models.CharField(
        choices=CURRENCIES,
        default=CURRENCIES.usd,
        max_length=16,
        verbose_name='CSO Contribution Currency'
    )

    # intervention budged model from etool
    total_unicef_cash = models.DecimalField(
        decimal_places=2,
        max_digits=64,
        default=0,
        verbose_name='UNICEF cash'
    )
    total_unicef_cash_currency = models.CharField(
        choices=CURRENCIES,
        default=CURRENCIES.usd,
        max_length=16,
        verbose_name='UNICEF cash Currency'
    )

    # intervention budged model from etool
    in_kind_amount = models.DecimalField(
        max_digits=64,
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

    funds_received_to_date = models.DecimalField(
        decimal_places=2,
        max_digits=64,
        blank=True,
        null=True,
        verbose_name='Funds received'
    )

    funds_received_to_date_currency = models.CharField(
        choices=CURRENCIES,
        default=CURRENCIES.usd,
        max_length=16,
        verbose_name='Funds received Currency',
        blank=True,
        null=True,
    )

    funds_received_to_date_percent = models.DecimalField(
        decimal_places=2,
        max_digits=64,
        blank=True,
        null=True,
        verbose_name='Funds received %'
    )

    amendments = models.JSONField(default=list)

    has_signed_document = models.BooleanField(default=False)

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
        unique_together = (
            (*TimeStampedExternalBusinessAreaModel.Meta.unique_together, 'workspace')
        )

    def __str__(self):
        return self.title

    @cached_property
    def reportable_queryset(self):
        return Reportable.objects.filter(
            lower_level_outputs__cp_output__programme_document=self, active=True)

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
        # TODO: this should be cached (it's expensive) - redis will be perfect
        # with midnight reset !!!
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
        # TODO: this can be cached - redis will be perfect with midnight reset
        # !!!
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
            due_report = self.reportable_queryset.order_by(
                'indicator_reports__time_period_start') \
                .last() \
                .indicator_reports.last()
            self.__due_date = due_report and due_report.time_period_start

        return self.__due_date

    @property
    def total_unicef_contribution(self):
        return self.total_unicef_cash + self.in_kind_amount

    @property
    def funds_received_to_date_percentage(self):
        return self.funds_received_to_date_percent if self.funds_received_to_date_percent and self.funds_received_to_date_percent != -1 else 0

    @property
    def calculated_budget(self):
        if self.__budget is not None:
            return self.__budget

        total = self.budget

        if not self.reportable_queryset.exists():
            self.__budget = ""
            return self.__budget
        else:
            consumed = self.reportable_queryset.last().total
            consumed = consumed['c']

        self.__budget = "{total} ({consumed}%)".format(total=total,
                                                       consumed=consumed)
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
            raise NotImplementedError("Not recognized PD_FREQUENCY_LEVEL.")

    @property
    def lower_level_outputs(self):
        return LowerLevelOutput.objects.filter(
            cp_output__programme_document=self, active=True)

    @property
    def is_gpd(self):
        return self.document_type == PD_DOCUMENT_TYPE.GDD

    @property
    def locations_queryset(self):
        fields = ('id', 'name', 'admin_level', 'admin_level_name', 'p_code')
        base = Location.super_objects.select_related(None).only(*fields)

        qs_reports = base.filter(
            indicator_location_data__indicator_report__progress_report__programme_document=self,
            reportablelocationgoal__is_active=True,
        )

        qs_llos = base.filter(
            reportables__lower_level_outputs__cp_output__programme_document=self,
            reportablelocationgoal__is_active=True,
        )

        return qs_reports.union(qs_llos).order_by('id')


class ProgressReport(TimeStampedModel):
    """
    Represents a report on multiple lower level outputs by a partner
    for a certain time period, against a PD.
    """
    partner_contribution_to_date = models.TextField(blank=True, null=True)
    financial_contribution_to_date = models.TextField(blank=True, null=True)
    financial_contribution_currency = models.CharField(
        choices=CURRENCIES,
        default=CURRENCIES.usd,
        max_length=16,
        verbose_name='Financial Contribution Currency'
    )
    challenges_in_the_reporting_period = models.TextField(blank=True, null=True)
    proposed_way_forward = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=3, choices=PROGRESS_REPORT_STATUS, default=PROGRESS_REPORT_STATUS.due)
    programme_document = models.ForeignKey(
        ProgrammeDocument,
        related_name="progress_reports",
        on_delete=models.CASCADE,
        default=-1,
    )
    start_date = models.DateField(verbose_name='Start Date', blank=True, null=True)
    end_date = models.DateField(verbose_name='End Date', blank=True, null=True)
    due_date = models.DateField(verbose_name='Due Date')
    submission_date = models.DateField(verbose_name='Submission Date', blank=True, null=True)
    # User should match by email to Person in programme_document.partner_focal_point list
    submitted_by = models.ForeignKey(
        'account.User',
        verbose_name='Submitted by / on behalf on',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    # Keep track of the user that triggered the submission
    submitting_user = models.ForeignKey(
        'account.User',
        verbose_name='Submitted by',
        related_name='submitted_reports',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    # Fields set by PO in PMP when reviewing the progress report
    review_date = models.DateField(verbose_name='Review Date',
                                   blank=True,
                                   null=True)
    reviewed_by_email = models.CharField(max_length=256, null=True, blank=True)
    reviewed_by_name = models.CharField(max_length=256, null=True, blank=True)
    reviewed_by_external_id = models.IntegerField(null=True, blank=True)
    review_overall_status = models.CharField(
        verbose_name='Overall status set by UNICEF PO',
        choices=OVERALL_STATUS,
        max_length=3,
        blank=True,
        null=True
    )
    sent_back_feedback = models.TextField(blank=True, null=True)
    accepted_comment = models.CharField(verbose_name="Report accepted comment", max_length=50, blank=True, null=True)
    report_number = models.IntegerField(verbose_name="Report Number")
    report_type = models.CharField(verbose_name="Report type", choices=REPORTING_TYPES, max_length=3)
    is_final = models.BooleanField(verbose_name="Is final report", default=False)
    narrative = models.TextField(verbose_name="Narrative", blank=True, null=True)

    tracker = FieldTracker(fields=['status'])

    class Meta:
        ordering = ['-due_date', '-id']
        unique_together = ('programme_document', 'report_type', 'report_number')

    @transaction.atomic
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.is_final and not hasattr(self, 'final_review'):
            FinalReview.objects.create(progress_report=self)

    @cached_property
    def latest_indicator_report(self):
        return self.indicator_reports.all().order_by('-created').first()

    def get_reporting_period(self):
        return "{} - {}".format(
            self.start_date.strftime(settings.PRINT_DATA_FORMAT),
            self.end_date.strftime(settings.PRINT_DATA_FORMAT)
        ) if self.start_date and self.end_date else "No reporting period"

    def get_submission_date(self):
        return self.submission_date.strftime(settings.PRINT_DATA_FORMAT) if self.submission_date else None

    @cached_property
    def display_name(self):
        return '{} {}'.format(self.programme_document.title, self.get_reporting_period())

    def __str__(self):
        dates = f", due {self.due_date}" if self.report_type == SR_TYPE else f"{self.start_date} to {self.end_date} [due {self.due_date}]"
        return "Progress Report {} <pk:{}>: {} {}".format(self.report_type, self.id, self.programme_document, dates)

    @cached_property
    def has_partner_data(self):
        return (any([self.challenges_in_the_reporting_period, self.partner_contribution_to_date,
                     self.financial_contribution_to_date, self.proposed_way_forward]) or
                self.attachments.exists() or
                self.indicator_reports.filter(Q(total__c__gt=0) | Q(total__v__gt=0)).exists())


class GPDProgressReport(TimeStampedModel):
    gpd_report = models.OneToOneField(
        ProgressReport, related_name='gpd_report',
        on_delete=models.CASCADE,
        null=True, blank=True
    )
    delivered_as_planned = models.CharField(
        choices=DELIVERED_AS_PLANNED_OPTIONS,
        max_length=10, null=True, blank=True,
        verbose_name='Activities delivered as planned'
    )
    results_achieved = models.TextField(null=True, blank=True)
    other_information = models.TextField(null=True, blank=True)


class FinalReview(TimeStampedModel):
    progress_report = models.OneToOneField(
        ProgressReport,
        related_name='final_review',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    release_cash_in_time_choice = models.BooleanField(null=True)
    release_cash_in_time_comment = models.TextField(
        verbose_name="Did UNICEF release cash in time", null=True, blank=True)

    release_supplies_in_time_choice = models.BooleanField(null=True)
    release_supplies_in_time_comment = models.TextField(
        verbose_name="Did UNICEF release supplies in time", null=True, blank=True)

    feedback_face_form_in_time_choice = models.BooleanField(null=True)
    feedback_face_form_in_time_comment = models.TextField(
        verbose_name="Did UNICEF provide timely feedback on FACE forms", null=True, blank=True)

    respond_requests_in_time_choice = models.BooleanField(null=True)
    respond_requests_in_time_comment = models.TextField(
        verbose_name="Did UNICEF staff respond to queries and requests", null=True, blank=True)

    implemented_as_planned_choice = models.BooleanField(null=True)
    implemented_as_planned_comment = models.TextField(
        verbose_name="Were activities implemented as planned", null=True, blank=True)

    action_to_address_choice = models.BooleanField(null=True)
    action_to_address_comment = models.TextField(
        verbose_name="Action to address findings", null=True, blank=True)

    overall_satisfaction_choice = models.CharField(
        max_length=20, choices=FINAL_REVIEW_CHOICES, null=True, blank=True)
    overall_satisfaction_comment = models.TextField(null=True, blank=True)


@receiver(post_save,
          sender=ProgressReport,
          dispatch_uid="synchronize_ir_status_from_pr")
def synchronize_ir_status_from_pr(sender, instance, **kwargs):
    """
    Whenever an ProgressReport is saved, IndicatorReport objects
    linked to this ProgressReport should all be updated for its report status.
    """
    # Update its Indicator Report status according to new Progress Report status
    # Looping here as .update() on queryset does not invoke signals
    for ir in instance.indicator_reports.all():
        ir.report_status = instance.status
        setattr(ir, 'report_status_synced_from_pr', True)
        ir.save()


@receiver(post_save, sender=ProgressReport)
def send_notification_on_status_change(sender, instance, **kwargs):
    if instance.tracker.has_changed('status'):
        if instance.status == PROGRESS_REPORT_STATUS.accepted:
            body_template_path = 'emails/on_progress_report_status_change_accepted.html'
        elif instance.status == PROGRESS_REPORT_STATUS.sent_back:
            body_template_path = 'emails/on_progress_report_status_change_sent_back.html'
        elif instance.status == PROGRESS_REPORT_STATUS.submitted:
            body_template_path = 'emails/on_progress_report_status_change_submitted.html'
        else:
            return

        subject_template_path = 'emails/on_progress_report_status_change_subject.txt'
        pd = instance.programme_document
        part_pr_url = f'/ip/{pd.workspace.workspace_code}/ip-reporting/pd/{pd.id}/report/{instance.id}/'
        pr_url = urljoin(settings.FRONTEND_HOST, part_pr_url)

        template_data = {
            'person': None,
            'report': instance,
            'pd': pd,
            'pr_url': pr_url,
            'status': instance.get_status_display()
        }

        template_data['person'] = instance.submitting_user
        to_email_list = [template_data['person'].email]

        send_email_from_template(
            subject_template_path=subject_template_path,
            body_template_path=body_template_path,
            template_data=template_data,
            to_email_list=to_email_list,
            content_subtype='html',
        )

        if instance.submitted_by.email != instance.submitting_user.email:
            template_data['person'] = instance.submitted_by
            to_email_list = [template_data['person'].email]

            send_email_from_template(
                subject_template_path=subject_template_path,
                body_template_path=body_template_path,
                template_data=template_data,
                to_email_list=to_email_list,
                content_subtype='html',
            )

        # update pr url link to point to pmp, not prp
        part_pr_url = f'/pmp/reports/{instance.id}/progress'
        pr_url = urljoin(settings.FRONTEND_PMP_HOST, part_pr_url)
        template_data["pr_url"] = pr_url

        for person in pd.unicef_focal_point.all():
            template_data['person'] = person
            to_email_list = [person.email]

            send_email_from_template(
                subject_template_path=subject_template_path,
                body_template_path=body_template_path,
                template_data=template_data,
                to_email_list=to_email_list,
                content_subtype='html',
            )


def get_pr_attachment_upload_to(instance, filename):
    return f"unicef/progress_reports/{instance.progress_report.id}/{filename}"


class ProgressReportAttachment(TimeStampedModel):
    """
    ProgressReportAttachment represents an attachment file for ProgressReport.

    related models:
        unicef.ProgressReport (ForeignKey): "progress_report"
    """
    progress_report = models.ForeignKey(
        'unicef.ProgressReport',
        related_name="attachments",
        on_delete=models.CASCADE,
    )
    file = models.FileField(
        upload_to=get_pr_attachment_upload_to,
        max_length=500
    )
    type = models.CharField(verbose_name="Attachment type", choices=PR_ATTACHMENT_TYPES, max_length=5)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.file.name

    @property
    def filename(self):
        return os.path.basename(self.file.name)


class ReportingPeriodDates(TimeStampedExternalBusinessAreaModel):
    """
    Used for storing start_date, end_date and due_date fields for multiple reports
    """
    report_type = models.CharField(verbose_name="Report type", choices=REPORTING_TYPES, max_length=3)
    start_date = models.DateField(verbose_name='Start date', null=True, blank=True)
    end_date = models.DateField(verbose_name='End date', null=True, blank=True)
    due_date = models.DateField(null=True, blank=True, verbose_name='Due date')
    programme_document = models.ForeignKey(
        ProgrammeDocument,
        related_name='reporting_periods',
        on_delete=models.CASCADE,
    )
    description = models.CharField(max_length=512, blank=True, null=True)

    def __str__(self):
        return r'{0.programme_document} ({0.start_date} - {0.end_date} [{0.due_date}])'.format(self)

    class Meta:
        verbose_name_plural = 'Reporting period dates'
        unique_together = (
            (*TimeStampedExternalBusinessAreaModel.Meta.unique_together, 'report_type', 'programme_document')
        )
        ordering = ("-end_date", )


class PDResultLink(TimeStampedExternalBusinessAreaModel):
    """
    Represents flattened version of InterventionResultLink in eTools. Instead
    of having 2 models for CP output and result link we have this here.

    external_id - field on this model will be the result link id in eTools.
    title - is the CP output title. Eg. "1.1 POLICY - NEWBORN & CHILD HEALTH"

    related models:
        unicef.ProgrammeDocument (ForeignKey): "programme_document"
    """
    title = models.CharField(max_length=512,
                             verbose_name='CP output title/name')
    programme_document = models.ForeignKey(
        ProgrammeDocument,
        related_name="cp_outputs",
        on_delete=models.CASCADE,
    )
    external_cp_output_id = models.IntegerField()

    class Meta:
        ordering = ['id']
        verbose_name = 'Programme document result link'
        unique_together = (
            (*TimeStampedExternalBusinessAreaModel.Meta.unique_together, 'external_cp_output_id')
        )

    def __str__(self):
        return self.title


class LowerLevelOutput(TimeStampedExternalBusinessAreaModel):
    """
    LowerLevelOutput (PD output) module describe the goals to reach in PD scope.

    related models:
        unicef.PDResultLink (ForeignKey): "indicator"
        indicator.Reportable (GenericRelation): "reportables"
    """
    title = models.CharField(max_length=512)
    cp_output = models.ForeignKey(
        PDResultLink,
        related_name="ll_outputs",
        on_delete=models.CASCADE,
    )
    reportables = GenericRelation('indicator.Reportable',
                                  related_query_name='lower_level_outputs')

    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['id']
        unique_together = (
            (*TimeStampedExternalBusinessAreaModel.Meta.unique_together, 'cp_output')
        )

    def __str__(self):
        return self.title
