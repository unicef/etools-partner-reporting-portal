from __future__ import unicode_literals

from django.db import models
from django.contrib.contenttypes.fields import GenericRelation

from model_utils.models import TimeStampedModel


class ProgressReport(TimeStampedModel):
    partner_contribution_to_date = models.CharField(max_length=256)
    funds_received_to_date = models.CharField(max_length=256)
    challenges_in_the_reporting_period = models.CharField(max_length=256)
    proposed_way_forward = models.CharField(max_length=256)


class ProgrammeDocument(TimeStampedModel):
    title = models.CharField(max_length=255)
    ref = models.CharField(max_length=16)


class CountryProgrammeOutput(TimeStampedModel):
    title = models.CharField(max_length=255)

    programme_document = models.ForeignKey(ProgrammeDocument, related_name="cp_outputs")


class LowerLevelOutput(TimeStampedModel):
    title = models.CharField(max_length=255)

    indicator = models.ForeignKey(CountryProgrammeOutput, related_name="ll_outputs")

    reportables = GenericRelation('indicator.Reportable', related_query_name='lower_level_outputs')
