from functools import reduce

from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.postgres.fields import ArrayField
from django.db import models, transaction
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.functional import cached_property

from model_utils.models import TimeStampedModel
from model_utils.tracker import FieldTracker
from requests.compat import urljoin
from rest_framework import serializers

from etools_prp.apps.core.common import (
    FINAL_OVERALL_STATUS,
    FREQUENCY_LEVEL,
    INDICATOR_REPORT_STATUS,
    OVERALL_STATUS,
    PROGRESS_REPORT_STATUS,
    PRP_ROLE_TYPES,
    REPORTABLE_FREQUENCY_LEVEL,
    REPORTING_TYPES,
)
from etools_prp.apps.core.models import TimeStampedExternalSourceModel
from etools_prp.apps.core.validators import JSONSchemaValidator
from etools_prp.apps.indicator.constants import ValueType
from etools_prp.apps.indicator.disaggregators import QuantityIndicatorDisaggregator, RatioIndicatorDisaggregator
from etools_prp.apps.indicator.json_schemas import disaggregation_schema, indicator_schema
from etools_prp.apps.indicator.utilities import convert_string_number_to_float
from etools_prp.apps.partner.models import PartnerActivity
from etools_prp.apps.utils.emails import send_email_from_template


def default_total():
    return dict([('c', 0), ('d', 1), ('v', 0)])


def default_value():
    return dict([('d', 1), ('v', 0)])


class Disaggregation(TimeStampedExternalSourceModel):
    """
    Disaggregation module. For example: <Gender, Age>

    related models:
        core.ResponsePlan (ForeignKey): "response_plan"
    """
    name = models.CharField(max_length=255, verbose_name="Disaggregation by")
    # IP reporting ones won't have this fk.
    response_plan = models.ForeignKey(
        'core.ResponsePlan',
        related_name="disaggregations",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('name', 'response_plan')

    def __str__(self):
        return "Disaggregation <pk:%s> %s" % (self.id, self.name)


class DisaggregationValue(TimeStampedExternalSourceModel):
    """
    Disaggregation Value module. For example: Gender <Male, Female, Other>

    related models:
        indicator.Disaggregation (ForeignKey): "disaggregation"
    """
    disaggregation = models.ForeignKey(
        Disaggregation,
        related_name="disaggregation_values",
        on_delete=models.CASCADE,
    )
    value = models.CharField(max_length=128)

    # TODO: we won't allow these to be edited out anymore, so 'active' might
    # not as relevant anymore.
    # See https://github.com/unicef/etools-partner-reporting-portal/issues/244
    active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('disaggregation', 'value')

    def __str__(self):
        return "Disaggregation Value <pk:%s> %s" % (self.id, self.value)


class IndicatorBlueprint(TimeStampedExternalSourceModel):
    """
    IndicatorBlueprint module is a pattern for indicator
    (here we setup basic parameter).
    """
    NUMBER = 'number'
    PERCENTAGE = 'percentage'
    UNIT_CHOICES = (
        (NUMBER, NUMBER),
        (PERCENTAGE, PERCENTAGE),
    )

    SUM = 'sum'
    MAX = 'max'
    AVG = 'avg'
    RATIO = 'ratio'

    QUANTITY_CALC_CHOICE_LIST = (
        SUM,
        MAX,
        AVG,
    )

    RATIO_CALC_CHOICE_LIST = (
        SUM,
    )

    QUANTITY_CALC_CHOICES = (
        (SUM, SUM),
        (MAX, MAX),
        (AVG, AVG),
    )

    RATIO_CALC_CHOICES = (
        (SUM, SUM),
    )

    CALC_CHOICES = (
        (SUM, SUM),
        (MAX, MAX),
        (AVG, AVG),
    )

    QUANTITY_DISPLAY_TYPE_CHOICES = (
        (NUMBER, NUMBER),
    )

    RATIO_DISPLAY_TYPE_CHOICES = (
        (PERCENTAGE, PERCENTAGE),
        (RATIO, RATIO)
    )

    DISPLAY_TYPE_CHOICES = QUANTITY_DISPLAY_TYPE_CHOICES + \
        RATIO_DISPLAY_TYPE_CHOICES

    title = models.TextField(max_length=2048, db_index=True)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES,
                            default=NUMBER)
    description = models.CharField(max_length=3072, null=True, blank=True)
    code = models.CharField(max_length=50, null=True, blank=True, unique=True)
    subdomain = models.CharField(max_length=255, null=True, blank=True)
    disaggregatable = models.BooleanField(default=False)

    calculation_formula_across_periods = models.CharField(
        max_length=10, choices=CALC_CHOICES, default=SUM
    )
    calculation_formula_across_locations = models.CharField(
        max_length=10, choices=CALC_CHOICES, default=SUM
    )

    display_type = models.CharField(
        max_length=10, choices=DISPLAY_TYPE_CHOICES, default=NUMBER
    )

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
        super().save(*args, **kwargs)

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
            raise serializers.ValidationError('Calculation methods not supported by selected unit')

        unit_to_valid_display_type_values = {
            self.NUMBER: map(lambda x: x[0], self.QUANTITY_DISPLAY_TYPE_CHOICES),
            self.PERCENTAGE: map(lambda x: x[0], self.RATIO_DISPLAY_TYPE_CHOICES),
        }
        if self.display_type not in unit_to_valid_display_type_values.get(self.unit, [
        ]):
            raise serializers.ValidationError('Display type is not supported by selected unit')

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-id']
        unique_together = TimeStampedExternalSourceModel.Meta.unique_together


@receiver(post_save,
          sender=IndicatorBlueprint,
          dispatch_uid="trigger_indicator_report_recalculation")
def trigger_indicator_report_recalculation(sender, instance, **kwargs):
    """
    Whenever an indicator blueprint is saved, IndicatorReport objects
    linked to this IndicatorBlueprint via its Reportable should all be
    recalculated for its total.
    """
    irs = IndicatorReport.objects.filter(reportable__in=instance.reportables.all())

    if instance.unit == IndicatorBlueprint.NUMBER:
        for ir in irs:
            QuantityIndicatorDisaggregator.calculate_indicator_report_total(ir)

    elif instance.unit == IndicatorBlueprint.PERCENTAGE:
        for ir in irs:
            RatioIndicatorDisaggregator.calculate_indicator_report_total(ir)


class Reportable(TimeStampedExternalSourceModel):
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
    target = models.JSONField(
        default=default_value,
        validators=[JSONSchemaValidator(json_schema=indicator_schema)]
    )
    baseline = models.JSONField(
        default=default_value,
        validators=[JSONSchemaValidator(json_schema=indicator_schema)]
    )
    in_need = models.JSONField(
        blank=True, null=True,
        validators=[JSONSchemaValidator(json_schema=indicator_schema)]
    )
    assumptions = models.TextField(null=True, blank=True)
    means_of_verification = models.CharField(max_length=255, null=True, blank=True)
    comments = models.TextField(max_length=4048, blank=True, null=True)
    measurement_specifications = models.TextField(max_length=4048, blank=True, null=True)
    label = models.TextField(max_length=4048, blank=True, null=True)
    numerator_label = models.CharField(max_length=256, blank=True, null=True)
    denominator_label = models.CharField(max_length=256, blank=True, null=True)
    start_date_of_reporting_period = models.DateField(blank=True, null=True)

    is_cluster_indicator = models.BooleanField(default=False)
    is_unicef_hf_indicator = models.BooleanField(default=False)

    contributes_to_partner = models.BooleanField(default=False)

    # Current total, transactional and dynamically calculated based on
    # IndicatorReports
    total = models.JSONField(default=default_total, validators=[JSONSchemaValidator(json_schema=indicator_schema)])

    # unique code for this indicator within the current context
    # eg: (1.1) result code 1 - indicator code 1
    context_code = models.CharField(
        max_length=50, null=True, blank=True, verbose_name="Code in current context"
    )

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    # One of ClusterObjective, ClusterActivity, PartnerProject, PartnerActivity
    content_object = GenericForeignKey('content_type', 'object_id')
    blueprint = models.ForeignKey(
        IndicatorBlueprint,
        related_name="reportables",
        on_delete=models.CASCADE,
        null=True,
    )
    parent_indicator = models.ForeignKey(
        'self',
        related_name='children',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_index=True,
    )
    locations = models.ManyToManyField(
        'core.Location',
        related_name="reportables",
        through="ReportableLocationGoal"
    )

    frequency = models.CharField(
        max_length=3,
        choices=REPORTABLE_FREQUENCY_LEVEL,
        default=REPORTABLE_FREQUENCY_LEVEL.monthly,
        verbose_name='Frequency of reporting'
    )

    cs_dates = ArrayField(
        models.DateField(), default=list, null=True, blank=True
    )
    location_admin_refs = ArrayField(
        models.JSONField(), default=list, null=True, blank=True
    )
    disaggregations = models.ManyToManyField(Disaggregation, blank=True)

    active = models.BooleanField(default=True)

    ca_indicator_used_by_reporting_entity = models.ForeignKey(
        'self',
        related_name='ca_indicators_re',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_index=True
    )

    class Meta:
        ordering = ['-id']

    @property
    def ref_num(self):
        """reference_number of the PD"""
        from etools_prp.apps.unicef.models import LowerLevelOutput

        if isinstance(self.content_object, LowerLevelOutput):
            return self.content_object.cp_output.programme_document.reference_number
        else:
            return ''

    @property
    def pd_id(self):
        """reference_number of the PD"""
        from etools_prp.apps.unicef.models import LowerLevelOutput

        if isinstance(self.content_object, LowerLevelOutput):
            return self.content_object.cp_output.programme_document.id
        else:
            return ''

    @property
    def achieved(self):
        return self.total

    @property
    def calculated_target(self):
        if not self.target['v']:
            return 0.0

        if self.blueprint.unit == IndicatorBlueprint.NUMBER:
            return convert_string_number_to_float(self.target['v'])
        else:
            return convert_string_number_to_float(self.target['v']) / convert_string_number_to_float(self.target['d'])

    @property
    def calculated_baseline(self):
        if not self.baseline['v']:
            return 0.0

        if self.blueprint.unit == IndicatorBlueprint.NUMBER:
            return convert_string_number_to_float(self.baseline['v'])
        else:
            return convert_string_number_to_float(self.baseline['v']) / convert_string_number_to_float(self.baseline['d'])

    @property
    def calculated_in_need(self):
        if not self.in_need or self.in_need['v'] == "":
            return None

        if self.blueprint.unit == IndicatorBlueprint.NUMBER:
            return convert_string_number_to_float(self.in_need['v'])
        else:
            return convert_string_number_to_float(self.in_need['v']) / convert_string_number_to_float(self.in_need['d'])

    @property
    def progress_percentage(self):
        percentage = 0.0

        if self.achieved and self.baseline['v'] is not None and self.target['v'] is not None:
            baseline = convert_string_number_to_float(self.calculated_baseline)
            target = convert_string_number_to_float(self.calculated_target)

            dividend = 0    # default progress is 0
            if self.achieved['c'] > baseline:
                dividend = self.achieved['c'] - baseline
            divisor = convert_string_number_to_float(target) - baseline
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
            self.id, self.blueprint and self.blueprint.title, self.content_object
        )


def get_reportable_data_to_clone(instance):
    """
    get_reportable_data_to_clone returns a map of field name and its value
    to clone a new Reportable instance

    Arguments:
        instance {indicator.models.Reportable} -- Reportable model instance
    """
    return {
        'active': instance.active,
        'assumptions': instance.assumptions,
        'baseline': instance.baseline,
        'context_code': instance.context_code,
        'created': instance.created,
        'cs_dates': instance.cs_dates,
        'external_id': instance.external_id,
        'frequency': instance.frequency,
        'in_need': instance.in_need,
        'is_cluster_indicator': instance.is_cluster_indicator,
        'location_admin_refs': instance.location_admin_refs,
        'means_of_verification': instance.means_of_verification,
        'modified': instance.modified,
        'target': instance.target,
        'comments': instance.comments,
        'measurement_specifications': instance.measurement_specifications,
        'start_date_of_reporting_period': instance.start_date_of_reporting_period,
        'label': instance.label,
        'numerator_label': instance.numerator_label,
        'denominator_label': instance.denominator_label,
    }


def create_reportable_for_pa_from_ca_reportable(pa, ca_reportable):
    """
    Copies one CA reportable instance to a partner activity.

    Arguments:
        pa {partner.models.PartnerActivity} -- PartnerActivity to copy to
        reportable {indicator.models.Reportable} -- ClusterActivity Reportable

    Raises:
        ValidationError -- Django Exception
    """

    if ca_reportable.content_object != pa.cluster_activity:
        raise serializers.ValidationError("The Parent-child relationship is not valid")

    reportable_data_to_sync = get_reportable_data_to_clone(ca_reportable)
    reportable_data_to_sync['total'] = dict([('c', 0), ('d', 1), ('v', 0)])
    reportable_data_to_sync["blueprint"] = ca_reportable.blueprint
    reportable_data_to_sync["parent_indicator"] = ca_reportable

    for project_context in pa.partneractivityprojectcontext_set.all():
        reportable_data_to_sync["content_object"] = project_context
        pa_reportable = Reportable.objects.create(**reportable_data_to_sync)
        pa_reportable.disaggregations.add(*ca_reportable.disaggregations.all())


def create_reportable_for_papc_from_ca_reportable(papc, ca_reportable):
    """
    Copies one CA reportable instance to a partner activity project context.

    Arguments:
        papc {partner.models.PartnerActivityProjectContext} -- PartnerActivityProjectContext to copy to
        reportable {indicator.models.Reportable} -- ClusterActivity Reportable

    Raises:
        ValidationError -- Django Exception
    """

    if ca_reportable.content_object != papc.activity.cluster_activity:
        raise serializers.ValidationError("The Parent-child relationship is not valid")

    reportable_data_to_sync = get_reportable_data_to_clone(ca_reportable)
    reportable_data_to_sync['total'] = dict([('c', 0), ('d', 1), ('v', 0)])
    reportable_data_to_sync["blueprint"] = ca_reportable.blueprint
    reportable_data_to_sync["parent_indicator"] = ca_reportable

    reportable_data_to_sync["content_object"] = papc
    pa_reportable = Reportable.objects.create(**reportable_data_to_sync)
    pa_reportable.disaggregations.add(*ca_reportable.disaggregations.all())


def create_reportable_for_pp_from_ca_reportable(pp, ca_reportable):
    """
    Copies one CA reportable instance to a partner activity.

    Arguments:
        pp {partner.models.PartnerProject} -- PartnerProject to copy to
        reportable {indicator.models.Reportable} -- ClusterActivity Reportable

    Raises:
        ValidationError -- Django Exception
    """

    reportable_data_to_sync = get_reportable_data_to_clone(ca_reportable)
    reportable_data_to_sync['total'] = dict([('c', 0), ('d', 1), ('v', 0)])
    reportable_data_to_sync["content_object"] = pp
    reportable_data_to_sync["blueprint"] = ca_reportable.blueprint
    reportable_data_to_sync["parent_indicator"] = ca_reportable
    pp_reportable = Reportable.objects.create(**reportable_data_to_sync)

    pp_reportable.disaggregations.add(*ca_reportable.disaggregations.all())

    return pp_reportable


def create_reportable_for_pp_from_co_reportable(pp, co_reportable):
    """
    Copies one CO reportable instance to a partner project.

    Arguments:
        pp {partner.models.PartnerProject} -- PartnerProject to copy to
        co_reportable {indicator.models.Reportable} -- ClusterObjective Reportable

    Raises:
        ValidationError -- Django Exception

    Returns:
        Reportable -- PartnerProject type Reportable ORM instance
    """

    # TODO: Add Cluster objective to have only one PartnerProject for a Partner
    reportable_data_to_sync = get_reportable_data_to_clone(co_reportable)
    reportable_data_to_sync['total'] = dict([('c', 0), ('d', 1), ('v', 0)])
    reportable_data_to_sync["content_object"] = pp
    reportable_data_to_sync["blueprint"] = co_reportable.blueprint
    reportable_data_to_sync["parent_indicator"] = None
    pp_reportable = Reportable.objects.create(**reportable_data_to_sync)

    pp_reportable.disaggregations.add(*co_reportable.disaggregations.all())

    return pp_reportable


def create_pa_reportables_from_ca(pa, ca):
    """
    Creates a set of PartnerActivity Reportable instances from
    ClusterActivity instance to target PartnerActivity instance

    Arguments:
        pa {partner.models.PartnerActivity} -- Target PartnerActivity instance
        ca {cluster.models.ClusterActivity} -- ClusterActivity to copy from
    """

    if Reportable.objects.filter(partner_activity_project_contexts__activity=pa).count() > 0:
        return

    for reportable in ca.reportables.all():
        create_reportable_for_pa_from_ca_reportable(pa, reportable)


def create_papc_reportables_from_ca(papc, ca):
    """
    Creates a set of PartnerActivityProjectContext Reportable instances from
    ClusterActivity instance to target PartnerActivityProjectContext instance

    Arguments:
        papc {partner.models.PartnerActivityProjectContext} -- Target PartnerActivityProjectContext instance
        ca {cluster.models.ClusterActivity} -- ClusterActivity to copy from
    """

    if Reportable.objects.filter(partner_activity_project_contexts=papc).count() > 0:
        return

    for reportable in ca.reportables.all():
        create_reportable_for_papc_from_ca_reportable(papc, reportable)


def create_pa_reportables_for_new_ca_reportable(instance):
    """
    Useful when creating a new CA reportable to create
    a set of PartnerActivity Reportable instances.

    Arguments:
        instance {indicator.models.Reportable} -- Cluster Activity Reportable to copy from
    """
    for pa in instance.content_object.partner_activities.all():
        create_reportable_for_pa_from_ca_reportable(pa, instance)


def sync_ca_reportable_update_to_pa_reportables(instance, created):
    """
    Whenever a Cluster Activity Reportable is created or is updated,
    clone_ca_reportable_to_pa handles a Reportable instance data to
    its Cluster Activity's Partner Activity instances.

    Under create flag, Partner Activity will get a new Reportable instance
    from Cluster Activity Reportable instance.

    Otherwise, update each cloned Reportable instance
    from its Cluster Activity's Partner Activity instances.

    Arguments:
        instance {indicator.models.Reportable} -- Reportable model instance
        created {boolean} -- created flag from Django post_save signal
    """

    if instance.content_type.model == "clusteractivity":
        reportable_data_to_sync = get_reportable_data_to_clone(instance)

        if not created:
            # Update PA Reportable instances first
            instance.children.update(**reportable_data_to_sync)

            # Grab LLO Reportable instances that have CAI ID reference
            llo_reportables = Reportable.objects.filter(
                ca_indicator_used_by_reporting_entity=instance,
                lower_level_outputs__isnull=False
            )

            # Update these LLO Reportable instances except parent_indicator info
            if llo_reportables.exists():
                reportable_data_to_sync['blueprint'] = instance.blueprint
                llo_reportables.update(**reportable_data_to_sync)


@receiver(post_save,
          sender=Reportable,
          dispatch_uid="clone_ca_reportable_to_pa")
def clone_ca_reportable_to_pa_signal(sender, instance, created, **kwargs):
    sync_ca_reportable_update_to_pa_reportables(instance, created)


class ReportableLocationGoal(TimeStampedModel):
    reportable = models.ForeignKey(Reportable, on_delete=models.CASCADE)
    location = models.ForeignKey("core.Location", on_delete=models.CASCADE)
    target = models.JSONField(
        default=default_value,
        validators=[JSONSchemaValidator(json_schema=indicator_schema)]
    )
    baseline = models.JSONField(
        default=default_value,
        validators=[JSONSchemaValidator(json_schema=indicator_schema)]
    )
    in_need = models.JSONField(
        blank=True, null=True,
        validators=[JSONSchemaValidator(json_schema=indicator_schema)]
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('reportable', 'location')


class IndicatorReportManager(models.Manager):
    def active_reports(self):
        return self.objects.filter(
            report_status=INDICATOR_REPORT_STATUS.accepted)


class IndicatorReport(TimeStampedModel):
    """
    IndicatorReport module is a result of partner staff activity (what they
    did in defined frequency scope).

    related models:
        indicator.Reportable (ForeignKey): "indicator"
        unicef.ProgressReport (ForeignKey): "progress_report"
        core.Location (OneToOneField): "location"
        indicator.ReportingEntity (ForeignKey): "reporting_entity"
    """
    title = models.CharField(max_length=2048)
    reportable = models.ForeignKey(
        Reportable,
        related_name="indicator_reports",
        on_delete=models.CASCADE,
    )
    progress_report = models.ForeignKey(
        'unicef.ProgressReport',
        related_name="indicator_reports",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
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

    total = models.JSONField(
        default=default_total,
        validators=[JSONSchemaValidator(json_schema=indicator_schema)]
    )

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
    narrative_assessment = models.TextField(null=True, blank=True)

    review_date = models.DateField(verbose_name='Review Date',
                                   blank=True,
                                   null=True)
    sent_back_feedback = models.TextField(blank=True, null=True)

    parent = models.ForeignKey(
        'self',
        related_name='children',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_index=True,
    )

    reporting_entity = models.ForeignKey(
        'indicator.ReportingEntity',
        related_name="indicator_reports",
        on_delete=models.CASCADE,
    )

    project = models.ForeignKey(
        'partner.PartnerProject',
        related_name="indicator_reports",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    tracker = FieldTracker(fields=['report_status'])
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
    def is_complete(self):
        for location_disaggregation in IndicatorLocationData.objects.filter(indicator_report=self):
            if not location_disaggregation.is_complete:
                return False
        return True

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
    def can_import(self):
        if self.submission_date and self.report_status in [
                INDICATOR_REPORT_STATUS.accepted,
                INDICATOR_REPORT_STATUS.submitted]:
            return False
        return True

    @property
    def can_submit(self):
        if self.submission_date is not None and self.report_status == INDICATOR_REPORT_STATUS.sent_back:
            pass  # lets go and check throw disaggregation
        elif self.submission_date and self.report_status in [
                INDICATOR_REPORT_STATUS.accepted,
                INDICATOR_REPORT_STATUS.submitted]:
            return False

        for data in self.indicator_location_data.all():
            if not data.is_complete:
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


@receiver(post_save, sender=IndicatorReport)
def send_notification_on_status_change(sender, instance, **kwargs):
    if instance.tracker.has_changed('report_status') and not getattr(instance, 'report_status_synced_from_pr', False):
        subject_template_path = 'emails/on_indicator_report_status_change_subject.txt'

        if instance.report_status == INDICATOR_REPORT_STATUS.sent_back:
            body_template_path = 'emails/on_indicator_report_status_change_sent_back_cluster.html'
        elif instance.report_status == INDICATOR_REPORT_STATUS.submitted:
            body_template_path = 'emails/on_indicator_report_status_change_submitted_cluster.html'
        else:
            return

        content_object = instance.reportable.content_object
        content_type_model = instance.reportable.content_type.model

        if content_type_model == 'clusterobjective':
            cluster = content_object.cluster
            indicator_type = 'cluster_objective'
        elif content_type_model == 'clusteractivity':
            cluster = content_object.cluster_objective.cluster
            indicator_type = 'cluster_activity'
        elif content_type_model == 'partneractivityprojectcontext' and content_object.activity.cluster_activity:
            cluster = content_object.activity.cluster_activity.cluster_objective.cluster
            indicator_type = 'partner_activity'
        else:
            cluster = None
            indicator_type = ''

        if cluster:
            cluster_imos = [role.user for role in cluster.prp_roles.filter(role=PRP_ROLE_TYPES.cluster_imo)]
            workspace_code = cluster.response_plan.workspace.workspace_code

            url_part = f'/app/{workspace_code}/cluster-reporting/plan/{cluster.response_plan_id}/results/draft'
            q_params = f'?indicator_type={indicator_type}&cluster_id={cluster.id}&indicator={instance.reportable_id}'
            ir_url = urljoin(settings.FRONTEND_HOST, url_part) + q_params

            template_data = {
                'user': None,
                'ir_url': ir_url,
                'status': instance.get_report_status_display()
            }

            for user in cluster_imos:
                template_data['user'] = user
                to_email_list = [user.email]

                send_email_from_template(
                    subject_template_path=subject_template_path,
                    body_template_path=body_template_path,
                    template_data=template_data,
                    to_email_list=to_email_list,
                    content_subtype='html',
                )


@receiver(post_save,
          sender=IndicatorReport,
          dispatch_uid="unlock_ild_for_sent_back_cluster_ir")
def unlock_ild_for_sent_back_cluster_ir(sender, instance, **kwargs):
    """
    Whenever a Cluster indicator report is saved and found to be
    Sent back state then trigger unlock IndicatorLocationData instances.
    """
    if instance.report_status != INDICATOR_REPORT_STATUS.sent_back \
            and not isinstance(instance.reportable.content_object, PartnerActivity):
        return

    with transaction.atomic():
        instance.indicator_location_data.all().update(is_locked=False)

        child_irs = instance.children.values_list('id', flat=True)
        IndicatorLocationData.objects.filter(indicator_report__in=child_irs).update(is_locked=False)


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

    if instance.progress_report:
        # Only Accepted indicator reports for QPR progress report should be used.
        accepted_indicator_reports = IndicatorReport.objects.filter(
            reportable=reportable,
            report_status=INDICATOR_REPORT_STATUS.accepted,
            progress_report__report_type=REPORTING_TYPES.QPR,
        )
    else:
        # Only accepted indicator reports should be used.
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

                if blueprint.calculation_formula_across_periods == IndicatorBlueprint.AVG:
                    ir_count = accepted_indicator_reports.count()
                    if ir_count > 0:
                        reportable_total['v'] = reportable_total['v'] / \
                            (ir_count * 1.0)

                reportable_total['c'] = reportable_total['v']

        elif blueprint.unit == IndicatorBlueprint.PERCENTAGE:
            latest_accepted_indicator_report = accepted_indicator_reports.order_by('-time_period_start').first()

            reportable_total['v'] = latest_accepted_indicator_report.total['v']
            reportable_total['d'] = latest_accepted_indicator_report.total['d']

            if reportable_total['d'] != 0:
                reportable_total['c'] = (reportable_total['v'] / (reportable_total['d'] * 1.0))

                if blueprint.display_type == IndicatorBlueprint.PERCENTAGE:
                    reportable_total['c'] *= 100

    reportable.total = reportable_total
    reportable.save()

    # Triggering total recalculation on parent Reportable from its children
    if reportable.parent_indicator:
        new_parent_total = {
            'c': 0,
            'd': 1,
            'v': 0,
        }
        child_totals = reportable.parent_indicator.children.values_list('total', flat=True)

        for total in child_totals:
            new_parent_total['v'] += total['v']
            new_parent_total['d'] += total['d']

        if reportable.parent_indicator.blueprint.unit == IndicatorBlueprint.NUMBER:
            new_parent_total['d'] = 1
            new_parent_total['c'] = new_parent_total['v']

        else:
            new_parent_total['c'] = new_parent_total['v'] / (new_parent_total['d'] * 1.0)

            if reportable.parent_indicator.blueprint.display_type == IndicatorBlueprint.PERCENTAGE:
                new_parent_total['c'] *= 100

        reportable.parent_indicator.total = new_parent_total
        reportable.parent_indicator.save()


class ReportingEntity(TimeStampedModel):
    """
    ReportingEntity module it includes an organization entity for
    Cluster Activity indicator that is adopted from ProgrammeDocument
    """
    title = models.CharField(max_length=256, unique=True)

    class Meta:
        ordering = ['id']
        verbose_name_plural = 'Reporting entities'

    def __str__(self):
        return "Reporting entity: {}".format(self.title)


def default_disaggregation():
    return {'()': {'c': 0, 'd': 0, 'v': 0}}


class IndicatorLocationData(TimeStampedModel):
    """
    IndicatorLocationData module it includes indicators for chosen location.

    related models:
        indicator.IndicatorReport (ForeignKey): "indicator_report"
        core.Location (OneToOneField): "location"
    """
    indicator_report = models.ForeignKey(
        IndicatorReport,
        related_name="indicator_location_data",
        on_delete=models.CASCADE,
    )
    location = models.ForeignKey(
        'core.Location',
        related_name="indicator_location_data",
        on_delete=models.CASCADE,
    )

    disaggregation = models.JSONField(
        default=default_disaggregation,
        validators=[JSONSchemaValidator(json_schema=disaggregation_schema)]
    )
    num_disaggregation = models.IntegerField()
    level_reported = models.IntegerField()
    disaggregation_reported_on = ArrayField(models.IntegerField(), default=list)
    percentage_allocated = models.DecimalField(
        decimal_places=2,
        help_text='Entered data value allocation by %',
        max_digits=5,
        default=1.0000,
    )
    is_locked = models.BooleanField(default=False)

    class Meta:
        ordering = ['id']
        verbose_name_plural = 'Indicator location data'
        # TODO: enable
        # unique_together = ('indicator_report', 'location')

    def __str__(self):
        return "{} Location Data for {}".format(self.location, self.indicator_report)

    @cached_property
    def is_complete(self):
        """
        Returns if this indicator location data has had some data entered for
        it, and is complete.
        """
        # When changing this remember to adjust same method for indicator_report
        return self.modified != self.created

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
