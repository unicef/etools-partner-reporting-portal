import datetime
import json
import random

from django.contrib.auth.models import Group
from django.db.models.signals import post_save
from django.contrib.contenttypes.models import ContentType

import factory
from factory import fuzzy

from account.models import User, UserProfile
from cluster.models import Cluster, ClusterObjective, ClusterActivity
from partner.models import (
    Partner,
    PartnerProject,
    PartnerActivity,
)
from indicator.models import (
    IndicatorBlueprint,
    Reportable,
    IndicatorReport,
    IndicatorLocationData,
    Disaggregation,
    DisaggregationValue,
)
from unicef.models import (
    Section,
    ProgressReport,
    ProgrammeDocument,
    CountryProgrammeOutput,
    LowerLevelOutput,
)
from core.common import (
    FREQUENCY_LEVEL, PD_STATUS,
    PD_FREQUENCY_LEVEL,
    REPORTABLE_FREQUENCY_LEVEL,
    INDICATOR_REPORT_STATUS,
)
from core.models import Intervention, Location, ResponsePlan
from core.countries import COUNTRIES_ALPHA2_CODE

PD_STATUS_LIST = [x[0] for x in PD_STATUS]
COUNTRIES_LIST = [x[0] for x in COUNTRIES_ALPHA2_CODE]
CALC_CHOICES_LIST = [x[0] for x in IndicatorBlueprint.CALC_CHOICES]
DISPLAY_TYPE_CHOICES_LIST = [x[0] for x in IndicatorBlueprint.DISPLAY_TYPE_CHOICES]
QUANTITY_CALC_CHOICES_LIST = [x[0] for x in IndicatorBlueprint.QUANTITY_CALC_CHOICES]
QUANTITY_DISPLAY_TYPE_CHOICES_LIST = [x[0] for x in IndicatorBlueprint.QUANTITY_DISPLAY_TYPE_CHOICES]
RATIO_CALC_CHOICES_LIST = [x[0] for x in IndicatorBlueprint.RATIO_CALC_CHOICES]
RATIO_DISPLAY_TYPE_CHOICES_LIST = [x[0] for x in IndicatorBlueprint.RATIO_DISPLAY_TYPE_CHOICES]


# https://stackoverflow.com/a/41154232/2363915
class JSONFactory(factory.DictFactory):
    """
    Use with factory.Dict to make JSON strings.
    """
    @classmethod
    def _build(cls, model_class, *args, **kwargs):
        if args:
            raise ValueError(
                "DictFactory %r does not support Meta.inline_args.", cls)
        return json.dumps(model_class(**kwargs))


class PartnerFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "partner_%d" % n)
    total_ct_cp = fuzzy.FuzzyInteger(1000, 10000, 100)
    partner_activity = factory.RelatedFactory('core.factories.PartnerActivityFactory', 'partner')
    partner_project = factory.RelatedFactory('core.factories.PartnerProjectFactory', 'partner')
    user = factory.RelatedFactory('core.factories.UserFactory', 'partner')

    @factory.post_generation
    def clusters(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for cluster in extracted:
                self.clusters.add(cluster)

    class Meta:
        model = Partner


class PartnerActivityFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "partner_activity_%d" % n)

    class Meta:
        model = PartnerActivity


class PartnerProjectFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "partner_project_%d" % n)
    start_date = fuzzy.FuzzyDate(datetime.date.today())
    end_date = fuzzy.FuzzyDate(datetime.date.today())

    description = factory.Sequence(lambda n: "description %d" % n)
    additional_information = factory.Sequence(lambda n: "additional_information %d" % n)
    total_budget = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    funding_source = factory.Sequence(lambda n: "funding_source %d" % n)

    @factory.post_generation
    def clusters(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for cluster in extracted:
                self.clusters.add(cluster)

    @factory.post_generation
    def locations(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for cluster in extracted:
                self.locations.add(cluster)

    class Meta:
        model = PartnerProject


class UserProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UserProfile


class GroupFactory(factory.django.DjangoModelFactory):
    name = "UNICEF User"

    class Meta:
        model = Group


class UserFactory(factory.django.DjangoModelFactory):
    username = fuzzy.FuzzyText()
    email = factory.Sequence(lambda n: "user{}@notanemail.com".format(n))
    password = factory.PostGenerationMethodCall('set_password', 'test')

    profile = factory.RelatedFactory(UserProfileFactory, 'user')

    @classmethod
    def _generate(cls, create, attrs):
        """Override the default _generate() to disable the post-save signal."""

        # Note: If the signal was defined with a dispatch_uid, include that in both calls.
        post_save.disconnect(UserProfile.create_user_profile, User)
        user = super(UserFactory, cls)._generate(create, attrs)
        post_save.connect(UserProfile.create_user_profile, User)
        return user

    @factory.post_generation
    def groups(self, create, extracted, **kwargs):
        group, created = Group.objects.get_or_create(name='UNICEF User')
        self.groups.add(group)

    class Meta:
        model = User


class InterventionFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "intervention_%d" % n)
    document_type = 'PD'
    number = fuzzy.FuzzyText(length=64)
    country_code = fuzzy.FuzzyChoice(COUNTRIES_LIST)
    status = 'Dra'
    start = fuzzy.FuzzyDate(datetime.date.today())
    end = fuzzy.FuzzyDate(datetime.date.today())
    signed_by_unicef_date = fuzzy.FuzzyDate(datetime.date.today())
    signed_by_partner_date = fuzzy.FuzzyDate(datetime.date.today())

    @factory.post_generation
    def locations(self, create, extracted, **kwargs):
        if not create:
            # Simple build, do nothing.
            return

        if extracted:
            # A list of groups were passed in, use them
            for location in extracted.order_by('?')[:2]:
                self.locations.add(location)

    class Meta:
        model = Intervention


class ResponsePlanFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "response plan %d" % n)
    start = fuzzy.FuzzyDate(datetime.date.today())
    end = fuzzy.FuzzyDate(datetime.date.today())

    cluster = factory.RelatedFactory('core.factories.ClusterFactory', 'response_plan')

    class Meta:
        model = ResponsePlan


class ClusterFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "cluster_%d" % n)
    user = factory.SubFactory(UserFactory)

    intervention = factory.SubFactory(InterventionFactory)

    class Meta:
        model = Cluster


class ClusterObjectiveFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "cluster_objective_%d" % n)

    objective = factory.RelatedFactory('core.factories.ClusterActivityFactory', 'cluster_objective')
    cluster = factory.SubFactory(ClusterFactory)

    class Meta:
        model = ClusterObjective


class ClusterActivityFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "cluster_activity_%d" % n)
    cluster_objective = factory.SubFactory(ClusterObjectiveFactory)

    class Meta:
        model = ClusterActivity


class QuantityTypeIndicatorBlueprintFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "quantity_indicator_%d" % n)
    unit = IndicatorBlueprint.NUMBER
    calculation_formula_across_locations = fuzzy.FuzzyChoice(QUANTITY_CALC_CHOICES_LIST)
    calculation_formula_across_periods = fuzzy.FuzzyChoice(QUANTITY_CALC_CHOICES_LIST)
    display_type = IndicatorBlueprint.NUMBER

    class Meta:
        model = IndicatorBlueprint


class RatioTypeIndicatorBlueprintFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "ratio_indicator_%d" % n)
    unit = IndicatorBlueprint.PERCENTAGE
    calculation_formula_across_locations = fuzzy.FuzzyChoice(RATIO_CALC_CHOICES_LIST)
    calculation_formula_across_periods = fuzzy.FuzzyChoice(RATIO_CALC_CHOICES_LIST)
    display_type = IndicatorBlueprint.PERCENTAGE

    class Meta:
        model = IndicatorBlueprint


class ReportableFactory(factory.django.DjangoModelFactory):
    object_id = factory.SelfAttribute('content_object.id')
    content_type = factory.LazyAttribute(
        lambda o: ContentType.objects.get_for_model(o.content_object))

    # Commented out so that we can create Disaggregation and DisaggregationValue objects manually
    # disaggregation = factory.RelatedFactory('core.factories.DisaggregationFactory', 'reportable')

    cs_dates = list()
    frequency = REPORTABLE_FREQUENCY_LEVEL.weekly
    start_date = fuzzy.FuzzyDate(datetime.date.today())
    end_date = fuzzy.FuzzyDate(datetime.date.today())

    class Meta:
        exclude = ['content_object']
        abstract = True


class QuantityReportableToLowerLevelOutputFactory(ReportableFactory):
    content_object = factory.SubFactory('core.factories.LowerLevelOutputFactory')
    target = '5000'
    baseline = '0'

    indicator_report = factory.RelatedFactory('core.factories.QuantityIndicatorReportFactory', 'reportable')

    location = factory.RelatedFactory('core.factories.LocationFactory', 'reportable', parent=None)

    blueprint = factory.SubFactory(QuantityTypeIndicatorBlueprintFactory)

    total = dict(
        [('c', 0), ('d', 0), ('v', random.randint(0, 3000))])

    class Meta:
        model = Reportable


class RatioReportableToLowerLevelOutputFactory(ReportableFactory):
    content_object = factory.SubFactory('core.factories.LowerLevelOutputFactory')
    target = '5000'
    baseline = '0'

    indicator_report = factory.RelatedFactory('core.factories.RatioIndicatorReportFactory', 'reportable')

    location = factory.RelatedFactory('core.factories.LocationFactory', 'reportable', parent=None)

    blueprint = factory.SubFactory(RatioTypeIndicatorBlueprintFactory)

    total = dict(
        [('c', 0), ('d', random.randint(3000, 6000)), ('v', random.randint(0, 3000))])

    class Meta:
        model = Reportable


class RatioReportableToClusterObjectiveFactory(ReportableFactory):
    content_object = factory.SubFactory(ClusterObjectiveFactory)
    target = '5000'
    baseline = '0'

    indicator_report = factory.RelatedFactory('core.factories.RatioIndicatorReportFactory', 'reportable')

    location = factory.RelatedFactory('core.factories.LocationFactory', 'reportable', parent=None)

    blueprint = factory.SubFactory(RatioTypeIndicatorBlueprintFactory)

    total = dict(
        [('c', 0), ('d', random.randint(3000, 6000)), ('v', random.randint(0, 3000))])

    class Meta:
        model = Reportable


class QuantityReportableToClusterObjectiveFactory(ReportableFactory):
    content_object = factory.SubFactory(ClusterObjectiveFactory)
    target = '5000'
    baseline = '0'

    indicator_report = factory.RelatedFactory('core.factories.QuantityIndicatorReportFactory', 'reportable')

    location = factory.RelatedFactory('core.factories.LocationFactory', 'reportable', parent=None)

    blueprint = factory.SubFactory(QuantityTypeIndicatorBlueprintFactory)

    total = dict(
        [('c', 0), ('d', 0), ('v', random.randint(0, 3000))])

    class Meta:
        model = Reportable


class LocationFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "location_%d" % n)

    class Meta:
        model = Location


class ProgressReportFactory(factory.django.DjangoModelFactory):
    start_date = fuzzy.FuzzyDate(datetime.date.today())
    end_date = fuzzy.FuzzyDate(datetime.date.today())
    
    class Meta:
        model = ProgressReport


class SectionFactory(factory.django.DjangoModelFactory):
    name = factory.Sequence(lambda n: "Section %d" % n)

    class Meta:
        model = Section


class ProgrammeDocumentFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "programme_document_%d" % n)
    agreement = factory.Sequence(lambda n: "JOR/PCA2017%d" % n)
    reference_number = factory.Sequence(lambda n: "reference_number_%d" % n)
    start_date = datetime.date.today()
    end_date = datetime.date.today()+datetime.timedelta(days=70)
    population_focus = factory.Sequence(lambda n: "Population %d" % n)
    response_to_HRP = factory.Sequence(lambda n: "response_to_HRP%d" % n)
    status = fuzzy.FuzzyChoice(PD_STATUS_LIST)
    frequency = PD_FREQUENCY_LEVEL.weekly
    budget = fuzzy.FuzzyDecimal(low=1000.0, high=100000.0, precision=2)
    unicef_office = factory.Sequence(lambda n: "JCO country programme %d" % n)
    unicef_focal_point = factory.Sequence(lambda n: "Abdallah Yakhola %d" % n)
    partner_focal_point = factory.Sequence(lambda n: "Hanin Odeh %d" % n)

    cso_contribution = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    total_unicef_cash = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    in_kind_amount = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)

    cp_output = factory.RelatedFactory('core.factories.CountryProgrammeOutputFactory', 'programme_document')

    cs_dates = list()

    class Meta:
        model = ProgrammeDocument


class DisaggregationFactory(factory.django.DjangoModelFactory):
    active = True

    # Commented out so that we can create Disaggregation and DisaggregationValue objects manually
    # disaggregation_value = factory.RelatedFactory('core.factories.DisaggregationValueFactory', 'disaggregation')

    class Meta:
        model = Disaggregation


class DisaggregationValueFactory(factory.django.DjangoModelFactory):
    active = True

    class Meta:
        model = DisaggregationValue


class QuantityIndicatorReportFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "quantity_indicator_report_%d" % n)
    time_period_start = fuzzy.FuzzyDate(datetime.date.today())
    time_period_end = fuzzy.FuzzyDate(datetime.date.today())
    due_date = fuzzy.FuzzyDate(datetime.date.today())
    total = dict(
        [('c', 0), ('d', 0), ('v', random.randint(0, 3000))])

    class Meta:
        model = IndicatorReport


class RatioIndicatorReportFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "ratio_indicator_report_%d" % n)
    time_period_start = fuzzy.FuzzyDate(datetime.date.today())
    time_period_end = fuzzy.FuzzyDate(datetime.date.today())
    due_date = fuzzy.FuzzyDate(datetime.date.today())
    total = dict(
        [('c', 0), ('d', random.randint(3000, 6000)), ('v', random.randint(0, 3000))])

    class Meta:
        model = IndicatorReport


class CountryProgrammeOutputFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "country_programme_%d" % n)
    lower_level_output = factory.RelatedFactory('core.factories.LowerLevelOutputFactory', 'indicator')

    class Meta:
        model = CountryProgrammeOutput


class LowerLevelOutputFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "lower_level_output_%d" % n)

    class Meta:
        model = LowerLevelOutput


class IndicatorLocationDataFactory(factory.django.DjangoModelFactory):
    # disaggregation = JSONFactory()
    disaggregation = dict()
    num_disaggregation = 3
    level_reported = 3
    disaggregation_reported_on = list()

    class Meta:
        model = IndicatorLocationData
