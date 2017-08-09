from __future__ import unicode_literals
from itertools import combinations

from django.utils.functional import cached_property
from django.contrib.postgres.fields import JSONField, ArrayField
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from model_utils.models import TimeStampedModel

from core.common import (
    INDICATOR_REPORT_STATUS,
    FREQUENCY_LEVEL,
    REPORTABLE_FREQUENCY_LEVEL,
    PROGRESS_REPORT_STATUS,
    OVERALL_STATUS,
)


class IndicatorBlueprint(TimeStampedModel):
    """
    IndicatorBlueprint module is a pattern for indicator
    (here we setup basic parameter).
    """
    NUMBER = 'number'
    PERCENTAGE = 'percentage'
    LIKERT = 'likert'
    YESNO = 'yesno'
    UNIT_CHOICES = (
        (NUMBER, NUMBER),
        (PERCENTAGE, PERCENTAGE),
        # (LIKERT, LIKERT),
        # (YESNO, YESNO),
    )

    SUM = 'sum'
    MAX = 'max'
    AVG = 'avg'
    RATIO = 'ratio'

    QUANTITY_CALC_CHOICES = (
        (SUM, SUM),
        (MAX, MAX),
        (AVG, AVG)
    )

    RATIO_CALC_CHOICES = (
        (PERCENTAGE, PERCENTAGE),
        (RATIO, RATIO)
    )

    CALC_CHOICES = QUANTITY_CALC_CHOICES + RATIO_CALC_CHOICES

    QUANTITY_DISPLAY_TYPE_CHOICES = (
        (NUMBER, NUMBER),
    )

    RATIO_DISPLAY_TYPE_CHOICES = (
        (PERCENTAGE, PERCENTAGE),
        (RATIO, RATIO)
    )

    DISPLAY_TYPE_CHOICES = QUANTITY_DISPLAY_TYPE_CHOICES + RATIO_DISPLAY_TYPE_CHOICES

    title = models.CharField(max_length=1024)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default=NUMBER)
    description = models.CharField(max_length=3072, null=True, blank=True)
    code = models.CharField(max_length=50, null=True, blank=True, unique=True)
    subdomain = models.CharField(max_length=255, null=True, blank=True)
    disaggregatable = models.BooleanField(default=False)

    calculation_formula_across_periods = models.CharField(max_length=10, choices=CALC_CHOICES, default=SUM)

    calculation_formula_across_locations = models.CharField(max_length=10, choices=CALC_CHOICES, default=SUM)

    display_type = models.CharField(max_length=10, choices=DISPLAY_TYPE_CHOICES, default=NUMBER)

    # TODO: add:
    # siblings (similar inidcators to this indicator)
    # other_representation (exact copies with different names for some random reason)
    # children (indicators that aggregate up to this or contribute to this indicator through a formula)
    # aggregation_types (potential aggregation types: geographic, time-periods ?)
    # aggregation_formulas (how the total value is aggregated from the reports if possible)

    def save(self, *args, **kwargs):
        # Prevent from saving empty strings as code because of the unique together constraint
        if self.code == '':
            self.code = None
        super(IndicatorBlueprint, self).save(*args, **kwargs)

    class Meta:
        ordering = ['-id']


class Reportable(TimeStampedModel):
    """
    Reportable / Applied Indicator model.

    related models:
        ContentType (ForeignKey): "content_type"
        content_type & object_id fields (GenericForeignKey): "content_object"
        partner.PartnerProject (ForeignKey): "project"
        indicator.IndicatorBlueprint (ForeignKey): "blueprint"
        cluster.ClusterObjective (ForeignKey): "content_object"
        self (ForeignKey): "parent_indicator"
    """
    target = models.CharField(max_length=255, null=True, blank=True)
    baseline = models.CharField(max_length=255, null=True, blank=True)
    assumptions = models.TextField(null=True, blank=True)
    means_of_verification = models.CharField(max_length=255, null=True, blank=True)
    is_cluster_indicator = models.BooleanField(default=False)

    # Current total, transactional and dynamically calculated based on IndicatorReports
    total = JSONField(default=dict([('c', 0), ('d', 0), ('v', 0)]))

    # unique code for this indicator within the current context
    # eg: (1.1) result code 1 - indicator code 1
    context_code = models.CharField(max_length=50, null=True, blank=True,
                                    verbose_name="Code in current context")

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    blueprint = models.ForeignKey(IndicatorBlueprint, null=True, related_name="reportables")
    parent_indicator = models.ForeignKey('self', null=True, blank=True, related_name='children', db_index=True)

    frequency = models.CharField(
        max_length=3,
        choices=REPORTABLE_FREQUENCY_LEVEL,
        default=REPORTABLE_FREQUENCY_LEVEL.monthly,
        verbose_name='Frequency of reporting'
    )

    start_date = models.DateField(
        verbose_name='Start Date',
    )
    end_date = models.DateField(
        verbose_name='Due Date',
    )

    cs_dates = ArrayField(models.DateField(), default=list)

    class Meta:
        ordering = ['-id']

    def __str__(self):
        return "Reportable <pk:%s>" % self.id

    @property
    def ref_num(self):
        from unicef.models import LowerLevelOutput

        if isinstance(self.content_object, LowerLevelOutput):
            return self.content_object.indicator.programme_document.reference_number
        else:
            return ''

    @property
    def achieved(self):
        if self.indicator_reports.exists():
            total = self.indicator_reports.last().total

            if not isinstance(total, dict):
                total = dict(total)
            return total
        else:
            return {'c': 0, 'd': 0, 'v': 0}

    @property
    def progress_percentage(self):
        # if self.blueprint.unit == IndicatorBlueprint.NUMBER:
            # pass
        percentage = 0.0

        if self.achieved and self.baseline is not None and self.target is not None:
            percentage = (self.achieved['c'] - float(self.baseline)) / (float(self.target) - float(self.baseline))

        return percentage

    @classmethod
    def get_narrative_and_assessment(cls, progress_report_id):
        progress_report = IndicatorReport.objects.filter(progress_report_id=progress_report_id).first()
        return {
            'overall_status': progress_report and progress_report.overall_status,
            'narrative_assessment': progress_report and progress_report.narrative_assessment,
        }

    def __str__(self):
        return "Reportable <pk:%s>" % self.id


class IndicatorReport(TimeStampedModel):
    """
    IndicatorReport module is a result of partner staff activity (what they done in defined frequency scope).

    related models:
        indicator.Reportable (ForeignKey): "indicator"
        unicef.ProgressReport (ForeignKey): "progress_report"
        core.Location (OneToOneField): "location"
    """

    title = models.CharField(max_length=255)
    reportable = models.ForeignKey(Reportable, related_name="indicator_reports")
    progress_report = models.ForeignKey('unicef.ProgressReport', related_name="indicator_reports", null=True)
    time_period_start = models.DateField()  # first day of defined frequency mode
    time_period_end = models.DateField()  # last day of defined frequency mode
    due_date = models.DateField()  # can be few days/weeks out of the "end date"
    submission_date = models.DateField(null=True, blank=True, verbose_name="Date of submission")
    frequency = models.CharField(
        max_length=3,
        choices=FREQUENCY_LEVEL,
        default=FREQUENCY_LEVEL.monthly,
        verbose_name='Frequency of reporting'
    )

    total = JSONField(default=dict([('c', 0), ('d', 0), ('v', 0)]))

    remarks = models.TextField(blank=True, null=True)
    report_status = models.CharField(
        choices=INDICATOR_REPORT_STATUS,
        default=INDICATOR_REPORT_STATUS.due,
        max_length=3
    )


    class Meta:
        ordering = ['-id']

    overall_status = models.CharField(
        choices=OVERALL_STATUS,
        default=OVERALL_STATUS.on_track,
        max_length=3
    )
    narrative_assessment = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.title

    @property
    def is_draft(self):
        if self.submission_date is None and IndicatorLocationData.objects.filter(indicator_report=self).exists():
            return True
        return False

    @property
    def is_percentage(self):
        return self.display_type == self.reportable.blueprint.PERCENTAGE

    @property
    def is_number(self):
        return self.display_type == self.reportable.blueprint.NUMBER

    @property
    def can_submit(self):
        if self.submission_date is not None and self.report_status == INDICATOR_REPORT_STATUS.sent_back:
            pass  # lets go and check throw disaggregation
        elif self.submission_date and  self.report_status in [
                INDICATOR_REPORT_STATUS.accepted, INDICATOR_REPORT_STATUS.submitted]:
            return False

        for data in self.indicator_location_data.all():
            for key, vals in data.disaggregation.iteritems():
                if self.is_percentage and (vals.get('c', None) in [None, '']):
                    return False
                elif self.is_number and (vals.get('v', None) in [None, '']):
                    return False
        return True

    @property
    def progress_report_status(self):
        if self.progress_report:
            return self.progress_report.status
        else:
            return PROGRESS_REPORT_STATUS.due

    @property
    def status(self):
        # TODO: Check all disaggregation data across locations and return status
        return 'fulfilled'

    @cached_property
    def disaggregations(self):
        return self.reportable.disaggregation.all()

    @cached_property
    def display_type(self):
        return self.reportable.blueprint.display_type

    @cached_property
    def calculation_formula_across_periods(self):
        return self.reportable.blueprint.calculation_formula_across_periods

    @cached_property
    def calculation_formula_across_locations(self):
        return self.reportable.blueprint.calculation_formula_across_locations

    def disaggregation_values(self, id_only=False, filter_by_id__in=None, flat=False):
        output_list = []

        disaggregations = self.disaggregations

        if filter_by_id__in:
            disaggregations = disaggregations.filter(id__in=filter_by_id__in)

        for disaggregation in disaggregations:
            if not id_only:
                disaggregation_value = disaggregation.disaggregation_value.order_by('id').values_list('id', 'value')

            else:
                disaggregation_value = disaggregation.disaggregation_value.order_by('id').values_list('id', flat=True)

            output_list.append(list(disaggregation_value))

        if flat:
            output_list = set(reduce(lambda acc, curr: acc + curr, output_list))

        return output_list


@receiver(post_save, sender=IndicatorReport, dispatch_uid="recalculate_reportable_total")
def recalculate_reportable_total(sender, instance, **kwargs):
    reportable = instance.reportable
    blueprint = reportable.blueprint

    # Reset the reportable total
    reportable_total = {
        'c': 0,
        'd': 0,
        'v': 0,
    }

    # IndicatorReport total calculation
    if blueprint.unit == IndicatorBlueprint.NUMBER:
        reportable_total['d'] = 1

        if blueprint.calculation_formula_across_periods == IndicatorBlueprint.MAX:
            max_total_ir = max(
                reportable.indicator_reports.all(),
                key=lambda item: item.total['v'])
            reportable_total = max_total_ir.total

        else:
            for indicator_report in reportable.indicator_reports.all():
                reportable_total['v'] += indicator_report.total['v']
                reportable_total['c'] += indicator_report.total['c']

        if blueprint.calculation_formula_across_periods == IndicatorBlueprint.AVG:
            ir_count = reportable.indicator_reports.count()

            reportable_total['v'] = reportable_total['v'] / (ir_count * 1.0)
            reportable_total['c'] = reportable_total['c'] / (ir_count * 1.0)

    # IndicatorReport total calculation
    elif blueprint.unit == IndicatorBlueprint.PERCENTAGE:
        for indicator_report in reportable.indicator_reports.all():
            reportable_total['v'] += indicator_report.total['v']
            reportable_total['d'] += indicator_report.total['d']

        reportable_total['c'] = reportable_total['v'] / (reportable_total['d'] * 1.0)

    reportable.total = reportable_total
    reportable.save()


class IndicatorLocationData(TimeStampedModel):
    """
    IndicatorLocationData module it includes indicators for chosen location.

    related models:
        indicator.IndicatorReport (ForeignKey): "indicator_report"
        core.Location (OneToOneField): "location"
    """
    indicator_report = models.ForeignKey(IndicatorReport, related_name="indicator_location_data")
    location = models.ForeignKey('core.Location', related_name="indicator_location_data")

    disaggregation = JSONField(default=dict)
    num_disaggregation = models.IntegerField()
    level_reported = models.IntegerField()
    disaggregation_reported_on = ArrayField(
        models.IntegerField(), default=list
    )

    class Meta:
        ordering = ['id']

    def __str__(self):
        return "{} Location Data for {}".format(self.location, self.indicator_report)


class Disaggregation(TimeStampedModel):
    """
    Disaggregation module. For example: <Gender, Age>

    related models:
        indicator.Reportable (ForeignKey): "reportable"
    """
    name = models.CharField(max_length=255, verbose_name="Disaggregation by", null=True, blank=True)
    reportable = models.ForeignKey(Reportable, related_name="disaggregation")
    active = models.BooleanField(default=False)

    class Meta:
        unique_together = ('name', 'reportable')

    def __str__(self):
        return "Disaggregation <pk:%s>" % self.id


class DisaggregationValue(TimeStampedModel):
    """
    Disaggregation Value module. For example: Gender <Male, Female, Other>

    related models:
        indicator.Disaggregation (ForeignKey): "disaggregation"
    """
    disaggregation = models.ForeignKey(Disaggregation, related_name="disaggregation_value")
    value = models.CharField(max_length=15, null=True, blank=True)
    active = models.BooleanField(default=False)

    def __str__(self):
        return "Disaggregation Value <pk:%s>" % self.id
