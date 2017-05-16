from __future__ import unicode_literals
from datetime import date
from django.db import models

from model_utils.models import TimeStampedModel


class ProgressReport(TimeStampedModel):
    partner_contribution_to_date = models.CharField(max_length=256)
    funds_received_to_date = models.CharField(max_length=256)
    challenges_in_the_reporting_period = models.CharField(max_length=256)
    proposed_way_forward = models.CharField(max_length=256)


class ProgrammeDocument(TimeStampedModel):

    agreement = models.CharField(max_length=255, verbose_name='Agreement')
    reference_number = models.CharField(max_length=255, verbose_name='Reference Number')
    title = models.CharField(max_length=255, verbose_name='PD/SSFA ToR Title')
    start_date = models.DateField(
        blank=True,
        null=True
    )
    end_date = models.DateField(
        blank=True,
        null=True,
        verbose_name='Due Date',
    )
    population_focus = models.CharField(
        max_length=256,
        blank=True,
        null=True,
        verbose_name='Population Focus')
    response_to_HRP = models.CharField(
        max_length=256,
        blank=True,
        null=True,
        verbose_name='In response to an HRP')
    status = models.CharField(
        max_length=256,
        blank=True,
        null=True,
        verbose_name='PD/SSFA status')

    @property
    def report_status(self):
        return 'Overdue' or 'Nothing due' or 'Due'  # where due is '30 days to - current month to deadline'

    @property
    def due_date(self):
        pass  # calculate on reports details related to PD ???
        # fixture for display value for better develop on front end
        return date.today()

    @property
    def is_draft(self):
        return True or False  # TODO

    @property
    def label_link(self):
        return 'Go to draft' or 'Reports'

    @property
    def link_to_document(self):
        return 'url'


class CountryProgrammeOutput(TimeStampedModel):
    title = models.CharField(max_length=255)

    programme_document = models.ForeignKey(ProgrammeDocument, related_name="cp_outputs")


class LowerLevelOutput(TimeStampedModel):
    title = models.CharField(max_length=255)

    indicator = models.ForeignKey(CountryProgrammeOutput, related_name="ll_outputs")
