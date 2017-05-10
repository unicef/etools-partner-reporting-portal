from __future__ import unicode_literals

from django.db import models
from django.contrib.postgres.fields import FloatRangeField, JSONField
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class Project(models.Model):
    title = models.CharField(max_length=255)
    code = models.CharField(max_length=255)
    in_ops = models.BooleanField(default=False)
    geograph = models.CharField(max_length=255)
    time_period = models.DateTimeField(auto_now=True)
    budget = models.FloatField()
    status = models.CharField(max_length=255)

    cluster = models.ForeignKey('cluster.Cluster', related_name="projects")
    partner = models.ForeignKey('core.Partner', null=True, related_name="projects")


class ProjectParticipant(models.Model):
    owner = models.ForeignKey('account.User', related_name="project_participant_owners")
    donor = models.ForeignKey('account.User', related_name="project_participant_donors")
    implementing_partner = models.ForeignKey('core.Partner', related_name="project_participant_implementing_partners")
    report_agency = models.ForeignKey('core.Partner', related_name="project_participant_report_agencies")


class Outcome(models.Model):
    name = models.CharField(max_length=255)
    project = models.ForeignKey(Project, related_name="outcomes")


class Output(models.Model):
    name = models.CharField(max_length=255)
    project = models.ForeignKey(Project, related_name="outputs")


class IndicatorBlueprint(models.Model):
    NUMBER = u'number'
    PERCENTAGE = u'percentage'
    YESNO = u'yesno'
    UNIT_CHOICES = (
        (NUMBER, NUMBER),
        (PERCENTAGE, PERCENTAGE),
        (YESNO, YESNO)
    )

    name = models.CharField(max_length=1024)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default=NUMBER)
    description = models.CharField(max_length=3072, null=True, blank=True)
    code = models.CharField(max_length=50, null=True, blank=True, unique=True)
    subdomain = models.CharField(max_length=255, null=True, blank=True)
    disaggregatable = models.BooleanField(default=False)

    # TODO: add:
    # siblings (similar inidcators to this indicator)
    # other_representation (exact copies with different names for some random reason)
    # children (indicators that aggregate up to this or contribute to this indicator through a formula)
    # aggregation_types (potential aggregation types: geographic, time-periods ?)
    # calculation_formula (how the children totals add up to this indicator's total value)
    # aggregation_formulas (how the total value is aggregated from the reports if possible)

    cluster_activity = models.ForeignKey('cluster.ClusterActivity', related_name="indicator_blueprints")

    def save(self, *args, **kwargs):
        # Prevent from saving empty strings as code because of the unique together constraint
        if self.code == '':
            self.code = None
        super(IndicatorBlueprint, self).save(*args, **kwargs)


class Reportable(models.Model):
    target = models.CharField(max_length=255, null=True, blank=True)
    baseline = models.CharField(max_length=255, null=True, blank=True)
    assumptions = models.TextField(null=True, blank=True)
    means_of_verification = models.CharField(max_length=255, null=True, blank=True)

    # Current total, transactional and dynamically calculated based on IndicatorReports
    total = models.IntegerField(null=True, blank=True, default=0,
                                verbose_name="Current Total")

    # variable disaggregation's that may be present in the work plan
    # this can only be present if the indicatorBlueprint has dissagregatable = true
    disaggregation_logic = JSONField(null=True)

    # unique code for this indicator within the current context
    # eg: (1.1) result code 1 - indicator code 1
    context_code = models.CharField(max_length=50, null=True, blank=True,
                                    verbose_name="Code in current context")

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    project = models.ForeignKey(Project, null=True, related_name="reportables")
    blueprint = models.ForeignKey(IndicatorBlueprint, null=True, related_name="reportables")
    objective = models.ForeignKey('cluster.ClusterObjective', null=True, related_name="reportables")

    parent_indicator = models.ForeignKey('self', null=True, blank=True, related_name='children', db_index=True)


class IndicatorDisaggregation(models.Model):
    name = models.CharField(max_length=255)
    range = FloatRangeField()

    indicator = models.ForeignKey(Reportable, related_name="indicator_disaggregations")


class IndicatorDataSpecification(models.Model):
    name = models.CharField(max_length=255)
    calculation_method = models.CharField(max_length=255)
    frequency = models.IntegerField()
    unit = models.CharField(max_length=255)

    indicator = models.ForeignKey(Reportable, related_name="indicator_data_specifications")


class ProgrammeDocument(models.Model):
    name = models.CharField(max_length=255)


class CountryProgrammeOutput(models.Model):
    name = models.CharField(max_length=255)

    programme_document = models.ForeignKey(ProgrammeDocument, related_name="cp_outputs")


class LowerLevelOutput(models.Model):
    name = models.CharField(max_length=255)

    indicator = models.ForeignKey(CountryProgrammeOutput, related_name="ll_outputs")
