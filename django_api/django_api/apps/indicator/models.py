from __future__ import unicode_literals

from django.conf import settings
from django.utils.functional import cached_property
from django.contrib.postgres.fields import JSONField, ArrayField
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
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
    FINAL_OVERALL_STATUS)
from core.models import TimeStampedExternalSyncModelMixin
from functools import reduce

from indicator.constants import ValueType


class Disaggregation(TimeStampedExternalSyncModelMixin):
    """
    Disaggregation module. For example: <Gender, Age>

    related models:
        core.ResponsePlan (ForeignKey): "response_plan"
    """
    name = models.CharField(max_length=255, verbose_name="Disaggregation by")
    response_plan = models.ForeignKey('core.ResponsePlan',
                                      related_name="disaggregations",
                                      blank=True, null=True)    # IP reporting ones won't have this fk.
    active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('name', 'response_plan')

    def __str__(self):
        return "Disaggregation <pk:%s> %s" % (self.id, self.name)


class DisaggregationValue(TimeStampedExternalSyncModelMixin):
    """
    Disaggregation Value module. For example: Gender <Male, Female, Other>

    related models:
        indicator.Disaggregation (ForeignKey): "disaggregation"
    """
    disaggregation = models.ForeignKey(Disaggregation, related_name="disaggregation_values")
    value = models.CharField(max_length=15)

    # TODO: we won't allow these to be edited out anymore, so 'active' might
    # not as relevant anymore.
    # See https://github.com/unicef/etools-partner-reporting-portal/issues/244
    active = models.BooleanField(default=True)

    def __str__(self):
        return "Disaggregation Value <pk:%s> %s" % (self.id, self.value)


class IndicatorBlueprint(TimeStampedExternalSyncModelMixin):
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

    DISPLAY_TYPE_CHOICES = QUANTITY_DISPLAY_TYPE_CHOICES + \
        RATIO_DISPLAY_TYPE_CHOICES

    title = models.CharField(max_length=1024, db_index=True)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES,
                            default=NUMBER)
    description = models.CharField(max_length=3072, null=True, blank=True)
    code = models.CharField(max_length=50, null=True, blank=True, unique=True)
    subdomain = models.CharField(max_length=255, null=True, blank=True)
    disaggregatable = models.BooleanField(default=False)

    calculation_formula_across_periods = models.CharField(
        max_length=10, choices=CALC_CHOICES, default=SUM)
    calculation_formula_across_locations = models.CharField(
        max_length=10, choices=CALC_CHOICES, default=SUM)

    display_type = models.CharField(max_length=10,
                                    choices=DISPLAY_TYPE_CHOICES,
                                    default=NUMBER)

    # TODO: add:
    # siblings (similar indicators to this indicator)
    # other_representation (exact copies with different names for some random reason)
    # children (indicators that aggregate up to this or contribute to this indicator through a formula)
    # aggregation_types (potential aggregation types: geographic, time-periods ?)
    # aggregation_formulas (how the total value is aggregated from the reports
    # if possible)

    def save(self, *args, **kwargs):
        # Prevent from saving empty strings as code because of the unique
        # together constraint
        if self.code == '':
            self.code = None
        super(IndicatorBlueprint, self).save(*args, **kwargs)

    def clean(self):
        """
        To check that the calculation method and display type being assigned
        are appropriate based on type of unit.
        """
        unit_to_valid_calc_values = {
            self.NUMBER: list(map(lambda x: x[0], self.QUANTITY_CALC_CHOICES)),
            self.PERCENTAGE: list(map(lambda x: x[0], self.RATIO_CALC_CHOICES)),
        }
        if self.calculation_formula_across_periods not in unit_to_valid_calc_values.get(self.unit, []) or \
                self.calculation_formula_across_locations not in unit_to_valid_calc_values.get(self.unit, []):
            raise ValidationError(
                'Calculation methods not supported by selected unit')

        unit_to_valid_display_type_values = {
            self.NUMBER: map(lambda x: x[0], self.QUANTITY_DISPLAY_TYPE_CHOICES),
            self.PERCENTAGE: map(lambda x: x[0], self.RATIO_DISPLAY_TYPE_CHOICES),
        }
        if self.display_type not in unit_to_valid_display_type_values.get(self.unit, [
        ]):
            raise ValidationError(
                'Display type is not supported by selected unit')

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-id']


class Reportable(TimeStampedExternalSyncModelMixin):
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
    in_need = models.CharField(max_length=255, null=True, blank=True)
    assumptions = models.TextField(null=True, blank=True)
    means_of_verification = models.CharField(max_length=255,
                                             null=True,
                                             blank=True)
    is_cluster_indicator = models.BooleanField(default=False)

    # Current total, transactional and dynamically calculated based on
    # IndicatorReports
    total = JSONField(default=dict([('c', 0), ('d', 0), ('v', 0)]))

    # unique code for this indicator within the current context
    # eg: (1.1) result code 1 - indicator code 1
    context_code = models.CharField(max_length=50,
                                    null=True,
                                    blank=True,
                                    verbose_name="Code in current context")

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    blueprint = models.ForeignKey(IndicatorBlueprint,
                                  null=True,
                                  related_name="reportables")
    parent_indicator = models.ForeignKey('self', null=True, blank=True,
                                         related_name='children',
                                         db_index=True)
    locations = models.ManyToManyField('core.Location', related_name="reportables")

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
        verbose_name='End Date',
    )

    cs_dates = ArrayField(models.DateField(), default=list)
    location_admin_refs = ArrayField(JSONField(), default=list, null=True,
                                     blank=True)
    disaggregations = models.ManyToManyField(Disaggregation, blank=True)

    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-id']

    @property
    def ref_num(self):
        """reference_number of the PD"""
        from unicef.models import LowerLevelOutput

        if isinstance(self.content_object, LowerLevelOutput):
            return self.content_object.cp_output.programme_document.reference_number
        else:
            return ''

    @property
    def pd_id(self):
        """reference_number of the PD"""
        from unicef.models import LowerLevelOutput

        if isinstance(self.content_object, LowerLevelOutput):
            return self.content_object.cp_output.programme_document.id
        else:
            return ''

    @property
    def achieved(self):
        """
        TODO: old function, called from places, referred to in
        serializers. Simply returning total for now.
        """
        return self.total

    @property
    def progress_percentage(self):
        percentage = 0.0

        if self.achieved and self.baseline is not None and self.target is not None:
            baseline = float(self.baseline)
            dividend = self.achieved['c'] - baseline
            divisor = float(self.target) - baseline
            if divisor:
                percentage = round(dividend / divisor, 2)
        return percentage

    @classmethod
    def get_narrative_and_assessment(cls, progress_report_id):
        progress_report = IndicatorReport.objects.filter(
            progress_report_id=progress_report_id).first()
        return {
            'overall_status': progress_report and progress_report.overall_status,
            'narrative_assessment': progress_report and progress_report.narrative_assessment,
        }

    def __str__(self):
        return "Reportable #{} {} on {}".format(
            self.id, self.blueprint.title, self.content_object
        )


class IndicatorReportManager(models.Manager):
    def active_reports(self):
        return self.objects.filter(
            report_status=INDICATOR_REPORT_STATUS.accepted)


class IndicatorReport(TimeStampedModel):
    """
    IndicatorReport module is a result of partner staff activity (what they
    done in defined frequency scope).

    related models:
        indicator.Reportable (ForeignKey): "indicator"
        unicef.ProgressReport (ForeignKey): "progress_report"
        core.Location (OneToOneField): "location"
    """
    title = models.CharField(max_length=255)
    reportable = models.ForeignKey(Reportable,
                                   related_name="indicator_reports")
    progress_report = models.ForeignKey('unicef.ProgressReport',
                                        related_name="indicator_reports",
                                        null=True, blank=True)
    time_period_start = models.DateField()  # first day of defined frequency mode
    time_period_end = models.DateField()  # last day of defined frequency mode
    due_date = models.DateField()  # can be few days/weeks out of the "end date"
    submission_date = models.DateField(null=True,
                                       blank=True,
                                       verbose_name="Date of submission")
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

    overall_status = models.CharField(
        choices=OVERALL_STATUS,
        default=OVERALL_STATUS.no_status,
        max_length=3
    )
    narrative_assessment = models.CharField(max_length=255,
                                            null=True,
                                            blank=True)

    review_date = models.DateField(verbose_name='Review Date',
                                   blank=True,
                                   null=True)
    sent_back_feedback = models.TextField(blank=True, null=True)

    objects = IndicatorReportManager()

    class Meta:
        ordering = ['-due_date', '-id']
        # TODO: Enable this
        # unique_together = ('reportable', 'time_period_start', 'time_period_end')

    def __str__(self):
        return self.title

    def get_overall_status_display(self):
        if self.progress_report and self.progress_report.is_final and self.overall_status in FINAL_OVERALL_STATUS:
            return dict(FINAL_OVERALL_STATUS).get(self.overall_status)
        else:
            # This is one of the "magical" django methods and cannot be called directly using super call
            field_object = self._meta.get_field('overall_status')
            return self._get_FIELD_display(field_object)

    @property
    def is_draft(self):
        if self.submission_date is None and IndicatorLocationData.objects.filter(
                indicator_report=self).exists():
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
        elif self.submission_date and self.report_status in [
                INDICATOR_REPORT_STATUS.accepted,
                INDICATOR_REPORT_STATUS.submitted]:
            return False

        for data in self.indicator_location_data.all():
            for key, vals in data.disaggregation.items():
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
        # TODO: Check all disaggregation data across locations and return
        # status
        return 'fulfilled'

    @cached_property
    def disaggregations(self):
        return self.reportable.disaggregations.all()

    @cached_property
    def display_type(self):
        return self.reportable.blueprint.display_type

    @cached_property
    def display_time_period(self):
        return '{} - {}'.format(
            self.time_period_start.strftime(settings.PRINT_DATA_FORMAT),
            self.time_period_end.strftime(settings.PRINT_DATA_FORMAT),
        )

    @cached_property
    def calculation_formula_across_periods(self):
        return self.reportable.blueprint.calculation_formula_across_periods

    @cached_property
    def calculation_formula_across_locations(self):
        return self.reportable.blueprint.calculation_formula_across_locations

    def disaggregation_values(self, id_only=False, filter_by_id__in=None,
                              flat=False):
        output_list = []

        disaggregations = self.disaggregations

        if filter_by_id__in:
            disaggregations = disaggregations.filter(id__in=filter_by_id__in)

        for disaggregation in disaggregations:
            if not id_only:
                disaggregation_value = disaggregation.disaggregation_values.order_by(
                    'id').values_list('id', 'value')

            else:
                disaggregation_value = disaggregation.disaggregation_values.order_by(
                    'id').values_list('id', flat=True)

            output_list.append(list(disaggregation_value))

        if flat:
            output_list = set(
                reduce(
                    lambda acc,
                    curr: acc + curr,
                    output_list))

        return output_list


@receiver(post_save,
          sender=IndicatorReport,
          dispatch_uid="recalculate_reportable_total")
def recalculate_reportable_total(sender, instance, **kwargs):
    """
    Whenever an indicator report is saved and found to be Accepted or in
    Sent back state then trigger a recalculation fo the Reportable total.
    """
    if instance.report_status != INDICATOR_REPORT_STATUS.accepted and \
            instance.report_status != INDICATOR_REPORT_STATUS.sent_back:
        return

    reportable = instance.reportable
    blueprint = reportable.blueprint
    # only accepted indicator reports should be used.
    accepted_indicator_reports = reportable.indicator_reports.all().filter(
        report_status=INDICATOR_REPORT_STATUS.accepted)

    # Reset the reportable total
    reportable_total = {
        'c': 0,
        'd': 0,
        'v': 0,
    }

    if accepted_indicator_reports.count() > 0:
        # If unit choice is NUMBER then have to handle sum, avg, max
        if blueprint.unit == IndicatorBlueprint.NUMBER:
            reportable_total['d'] = 1

            if blueprint.calculation_formula_across_periods == IndicatorBlueprint.MAX:
                max_total_ir = max(
                    accepted_indicator_reports,
                    key=lambda item: item.total['v'])
                reportable_total = max_total_ir.total
            else:   # if its SUM or avg then add data up
                for indicator_report in accepted_indicator_reports:
                    reportable_total['v'] += indicator_report.total['v']
                    reportable_total['c'] += indicator_report.total['c']

                if blueprint.calculation_formula_across_periods == IndicatorBlueprint.AVG:
                    ir_count = accepted_indicator_reports.count()
                    if ir_count > 0:
                        reportable_total['v'] = reportable_total['v'] / \
                            (ir_count * 1.0)
                        reportable_total['c'] = reportable_total['c'] / \
                            (ir_count * 1.0)

                elif blueprint.calculation_formula_across_periods == IndicatorBlueprint.SUM and \
                        reportable_total['c'] == 0:
                    reportable_total['c'] = reportable_total['v']

        # if unit is PERCENTAGE, doesn't matter if calc choice was percent or
        # ratio
        elif blueprint.unit == IndicatorBlueprint.PERCENTAGE:
            for indicator_report in accepted_indicator_reports:
                reportable_total['v'] += indicator_report.total['v']
                reportable_total['d'] += indicator_report.total['d']

            if reportable_total['d'] != 0:
                reportable_total['c'] = reportable_total['v'] / \
                    (reportable_total['d'] * 1.0)

    reportable.total = reportable_total
    reportable.save()


class IndicatorLocationData(TimeStampedModel):
    """
    IndicatorLocationData module it includes indicators for chosen location.

    related models:
        indicator.IndicatorReport (ForeignKey): "indicator_report"
        core.Location (OneToOneField): "location"
    """
    indicator_report = models.ForeignKey(
        IndicatorReport, related_name="indicator_location_data"
    )
    location = models.ForeignKey(
        'core.Location',
        related_name="indicator_location_data"
    )

    disaggregation = JSONField(default=dict)
    num_disaggregation = models.IntegerField()
    level_reported = models.IntegerField()
    disaggregation_reported_on = ArrayField(models.IntegerField(), default=list)

    class Meta:
        ordering = ['id']
        # TODO: enable
        # unique_together = ('indicator_report', 'location')

    def __str__(self):
        return "{} Location Data for {}".format(self.location, self.indicator_report)

    @cached_property
    def previous_location_data(self):
        previous_indicator_reports = self.indicator_report.reportable.indicator_reports.exclude(
            id=self.indicator_report.id
        ).filter(time_period_start__lt=self.indicator_report.time_period_start)

        previous_report = previous_indicator_reports.order_by('-time_period_start').first()
        if previous_report:
            return previous_report.indicator_location_data.filter(location=self.location).first()

    @cached_property
    def previous_location_progress_value(self):
        if not self.previous_location_data:
            return 0

        total_disaggregation = self.previous_location_data.disaggregation.get('()', {})
        if self.indicator_report.is_percentage:
            return total_disaggregation.get(ValueType.CALCULATED, 0)
        else:
            return total_disaggregation.get(ValueType.VALUE, 0)
