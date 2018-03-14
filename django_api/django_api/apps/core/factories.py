import datetime
import json
import random

from collections import defaultdict
from dateutil.relativedelta import relativedelta
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
    Person,
    ProgressReport,
    ProgrammeDocument,
    PDResultLink,
    LowerLevelOutput,
    ReportingPeriodDates,
)
from core.common import (
    PD_STATUS,
    PD_FREQUENCY_LEVEL,
    REPORTABLE_FREQUENCY_LEVEL,
    INDICATOR_REPORT_STATUS,
    PARTNER_PROJECT_STATUS,
    OVERALL_STATUS,
    CLUSTER_TYPES,
)
from core.models import (
    Country,
    Workspace,
    Location,
    ResponsePlan,
    GatewayType,
    CartoDBTable,
)
from core.countries import COUNTRIES_ALPHA2_CODE

PARTNER_PROJECT_STATUS_LIST = [x[0] for x in PARTNER_PROJECT_STATUS]
PD_STATUS_LIST = [x[0] for x in PD_STATUS]
COUNTRIES_LIST = [x[0] for x in COUNTRIES_ALPHA2_CODE]
COUNTRY_NAMES_LIST = [x[1] for x in COUNTRIES_ALPHA2_CODE]
CALC_CHOICES_LIST = [x[0] for x in IndicatorBlueprint.CALC_CHOICES]
DISPLAY_TYPE_CHOICES_LIST = [x[0]
                             for x in IndicatorBlueprint.DISPLAY_TYPE_CHOICES]
QUANTITY_CALC_CHOICES_LIST = [x[0]
                              for x in IndicatorBlueprint.QUANTITY_CALC_CHOICES]
QUANTITY_DISPLAY_TYPE_CHOICES_LIST = [
    x[0] for x in IndicatorBlueprint.QUANTITY_DISPLAY_TYPE_CHOICES]
RATIO_CALC_CHOICES_LIST = [x[0] for x in IndicatorBlueprint.RATIO_CALC_CHOICES]
RATIO_DISPLAY_TYPE_CHOICES_LIST = [
    x[0] for x in IndicatorBlueprint.RATIO_DISPLAY_TYPE_CHOICES]
PD_FREQUENCY_LEVEL_CHOICE_LIST = [x[0] for x in PD_FREQUENCY_LEVEL]
REPORTABLE_FREQUENCY_LEVEL_CHOICE_LIST = [x[0] for x in REPORTABLE_FREQUENCY_LEVEL]
OVERALL_STATUS_LIST = [x[0] for x in OVERALL_STATUS]
REPORT_STATUS_LIST = [x[0] for x in INDICATOR_REPORT_STATUS]
CLUSTER_TYPES_LIST = [x[0] for x in CLUSTER_TYPES]

today = datetime.date.today()
beginning_of_this_year = datetime.date(today.year, 1, 1)


class RangeGenerator:

    def __init__(self):
        self.start = beginning_of_this_year
        self.end = beginning_of_this_year + relativedelta(months=1)

    def __next__(self):
        return_value = self.start, self.end
        self.start -= relativedelta(months=1)
        self.end -= relativedelta(months=1)
        return return_value

    def __iter__(self):
        return self


REPORTABLE_RANGE_GENERATORS = defaultdict(lambda: iter(RangeGenerator()))

cs_date_1 = datetime.date(today.year, 1, 1)

cs_date_2 = datetime.date(today.year, 3, 24)

cs_date_3 = datetime.date(today.year, 5, 15)


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
    partner_activity = factory.RelatedFactory(
        'core.factories.PartnerActivityFactory', 'partner')
    partner_project = factory.RelatedFactory(
        'core.factories.PartnerProjectFactory', 'partner')
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
    project = factory.SubFactory('core.factories.PartnerProjectFactory')

    start_date = beginning_of_this_year
    end_date = beginning_of_this_year + datetime.timedelta(days=30)
    status = fuzzy.FuzzyChoice(PARTNER_PROJECT_STATUS_LIST)

    @factory.post_generation
    def locations(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for location in extracted:
                self.locations.add(location)

    class Meta:
        model = PartnerActivity


class PartnerProjectFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "partner_project_%d" % n)
    start_date = beginning_of_this_year
    end_date = today

    description = factory.Sequence(lambda n: "description %d" % n)
    additional_information = factory.Sequence(
        lambda n: "additional_information %d" % n)
    total_budget = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)

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
            for location in extracted:
                self.locations.add(location)

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

        # Note: If the signal was defined with a dispatch_uid, include that in
        # both calls.
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


class CountryFactory(factory.django.DjangoModelFactory):
    name = fuzzy.FuzzyChoice(COUNTRY_NAMES_LIST)

    class Meta:
        model = Country


class WorkspaceFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "workspace_%d" % n)
    workspace_code = fuzzy.FuzzyChoice(COUNTRIES_LIST)

    class Meta:
        model = Workspace
        django_get_or_create = ('workspace_code', )


class ResponsePlanFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "response plan %d" % n)
    start = beginning_of_this_year
    end = beginning_of_this_year + datetime.timedelta(days=364)

    cluster = factory.RelatedFactory(
        'core.factories.ClusterFactory',
        'response_plan')
    workspace = factory.SubFactory('core.factories.WorkspaceFactory')

    class Meta:
        model = ResponsePlan


class ClusterFactory(factory.django.DjangoModelFactory):
    type = fuzzy.FuzzyChoice(CLUSTER_TYPES_LIST)

    response_plan = factory.SubFactory(ResponsePlanFactory)

    class Meta:
        model = Cluster


class ClusterObjectiveFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "cluster_objective_%d" % n)

    activity = factory.RelatedFactory(
        'core.factories.ClusterActivityFactory',
        'cluster_objective')
    cluster = factory.SubFactory(ClusterFactory)

    @factory.post_generation
    def locations(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for location in extracted:
                self.locations.add(location)

    class Meta:
        model = ClusterObjective


class ClusterActivityFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "cluster_activity_%d" % n)
    cluster_objective = factory.SubFactory(ClusterObjectiveFactory)

    @factory.post_generation
    def locations(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for location in extracted:
                self.locations.add(location)

    class Meta:
        model = ClusterActivity


class QuantityTypeIndicatorBlueprintFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "quantity_indicator_%d" % n)
    unit = IndicatorBlueprint.NUMBER
    calculation_formula_across_locations = fuzzy.FuzzyChoice(
        QUANTITY_CALC_CHOICES_LIST)
    calculation_formula_across_periods = fuzzy.FuzzyChoice(
        QUANTITY_CALC_CHOICES_LIST)
    display_type = IndicatorBlueprint.NUMBER

    class Meta:
        model = IndicatorBlueprint


class RatioTypeIndicatorBlueprintFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "ratio_indicator_%d" % n)
    unit = IndicatorBlueprint.PERCENTAGE
    calculation_formula_across_locations = fuzzy.FuzzyChoice(
        RATIO_CALC_CHOICES_LIST)
    calculation_formula_across_periods = fuzzy.FuzzyChoice(
        RATIO_CALC_CHOICES_LIST)
    display_type = IndicatorBlueprint.PERCENTAGE

    class Meta:
        model = IndicatorBlueprint


class ReportableFactory(factory.django.DjangoModelFactory):
    object_id = factory.SelfAttribute('content_object.id')
    content_type = factory.LazyAttribute(
        lambda o: ContentType.objects.get_for_model(o.content_object))

    # Commented out so that we can create Disaggregation and DisaggregationValue objects manually
    # disaggregation = factory.RelatedFactory('core.factories.DisaggregationFactory', 'reportable')

    cs_dates = [cs_date_1, cs_date_2, cs_date_3]
    frequency = fuzzy.FuzzyChoice(REPORTABLE_FREQUENCY_LEVEL_CHOICE_LIST)

    @factory.post_generation
    def locations(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for location in extracted:
                self.locations.add(location)

    class Meta:
        exclude = ['content_object']
        abstract = True


class QuantityReportableToLowerLevelOutputFactory(ReportableFactory):
    content_object = factory.SubFactory(
        'core.factories.LowerLevelOutputFactory')
    target = '5000'
    baseline = '0'

    indicator_report = factory.RelatedFactory(
        'core.factories.QuantityIndicatorReportFactory', 'reportable')

    blueprint = factory.SubFactory(QuantityTypeIndicatorBlueprintFactory)

    total = dict(
        [('c', 0), ('d', 0), ('v', random.randint(0, 3000))])

    class Meta:
        model = Reportable


class RatioReportableToLowerLevelOutputFactory(ReportableFactory):
    content_object = factory.SubFactory(
        'core.factories.LowerLevelOutputFactory')
    target = '5000'
    baseline = '0'

    indicator_report = factory.RelatedFactory(
        'core.factories.RatioIndicatorReportFactory', 'reportable')

    blueprint = factory.SubFactory(RatioTypeIndicatorBlueprintFactory)

    total = dict(
        [('c', 0), ('d', random.randint(3000, 6000)), ('v', random.randint(0, 3000))])

    class Meta:
        model = Reportable


class RatioReportableToClusterObjectiveFactory(ReportableFactory):
    content_object = factory.SubFactory(ClusterObjectiveFactory)
    target = '5000'
    baseline = '0'

    indicator_report = factory.RelatedFactory(
        'core.factories.RatioIndicatorReportFactory', 'reportable')

    blueprint = factory.SubFactory(RatioTypeIndicatorBlueprintFactory)

    total = dict(
        [('c', 0), ('d', random.randint(3000, 6000)), ('v', random.randint(0, 3000))])


class QuantityReportableToPartnerProjectFactory(ReportableFactory):
    content_object = factory.SubFactory('core.factories.PartnerProjectFactory')
    target = '5000'
    baseline = '0'

    indicator_report = factory.RelatedFactory(
        'core.factories.QuantityIndicatorReportFactory', 'reportable')

    blueprint = factory.SubFactory(QuantityTypeIndicatorBlueprintFactory)

    total = dict(
        [('c', 0), ('d', 0), ('v', random.randint(0, 3000))])

    class Meta:
        model = Reportable


class QuantityReportableToClusterObjectiveFactory(ReportableFactory):
    content_object = factory.SubFactory(
        'core.factories.ClusterObjectiveFactory')
    target = '5000'
    baseline = '0'

    indicator_report = factory.RelatedFactory(
        'core.factories.QuantityIndicatorReportFactory', 'reportable')

    blueprint = factory.SubFactory(QuantityTypeIndicatorBlueprintFactory)

    total = dict(
        [('c', 0), ('d', 0), ('v', random.randint(0, 3000))])

    class Meta:
        model = Reportable


class QuantityReportableToClusterActivityFactory(ReportableFactory):
    content_object = factory.SubFactory(
        'core.factories.ClusterActivityFactory')
    target = '5000'
    baseline = '0'

    indicator_report = factory.RelatedFactory(
        'core.factories.QuantityIndicatorReportFactory', 'reportable')

    blueprint = factory.SubFactory(QuantityTypeIndicatorBlueprintFactory)

    total = dict(
        [('c', 0), ('d', 0), ('v', random.randint(0, 3000))])

    class Meta:
        model = Reportable


class QuantityReportableToPartnerActivityFactory(ReportableFactory):
    content_object = factory.SubFactory(
        'core.factories.PartnerActivityFactory')
    target = '5000'
    baseline = '0'

    indicator_report = factory.RelatedFactory(
        'core.factories.QuantityIndicatorReportFactory', 'reportable')

    blueprint = factory.SubFactory(QuantityTypeIndicatorBlueprintFactory)

    total = dict(
        [('c', 0), ('d', 0), ('v', random.randint(0, 3000))])

    class Meta:
        model = Reportable


class LocationFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "location_%d" % n)
    gateway = factory.SubFactory('core.factories.GatewayTypeFactory')

    class Meta:
        model = Location


class ProgressReportFactory(factory.django.DjangoModelFactory):
    start_date = beginning_of_this_year
    end_date = start_date + datetime.timedelta(days=30)
    due_date = start_date + datetime.timedelta(days=45)

    class Meta:
        model = ProgressReport


class SectionFactory(factory.django.DjangoModelFactory):
    name = factory.Sequence(lambda n: "Section %d" % n)

    class Meta:
        model = Section


class PersonFactory(factory.django.DjangoModelFactory):
    name = factory.Sequence(lambda n: "Person_%d" % n)
    title = factory.Sequence(lambda n: "Title_%d" % n)
    phone_number = factory.Sequence(lambda n: "+12 442-113-1%d" % n)
    email = factory.Sequence(lambda n: "person_%d@uniceftest.org" % n)

    class Meta:
        model = Person


class ReportingPeriodDatesFactory(factory.django.DjangoModelFactory):
    start_date = beginning_of_this_year
    end_date = start_date + datetime.timedelta(days=30)
    due_date = start_date + datetime.timedelta(days=45)
    programme_document = factory.Iterator(ProgrammeDocument.objects.all())

    class Meta:
        model = ReportingPeriodDates


class ProgrammeDocumentFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "programme_document_%d" % n)
    agreement = factory.Sequence(lambda n: "JOR/PCA2017%d" % n)
    reference_number = factory.Sequence(lambda n: "reference_number_%d" % n)
    start_date = beginning_of_this_year
    end_date = today + datetime.timedelta(days=70)
    status = fuzzy.FuzzyChoice(PD_STATUS_LIST)
    frequency = fuzzy.FuzzyChoice(PD_FREQUENCY_LEVEL_CHOICE_LIST)
    budget = fuzzy.FuzzyDecimal(low=1000.0, high=100000.0, precision=2)
    unicef_office = factory.Sequence(lambda n: "JCO country programme %d" % n)
    cso_contribution = fuzzy.FuzzyDecimal(
        low=10000.0, high=100000.0, precision=2)
    total_unicef_cash = fuzzy.FuzzyDecimal(
        low=10000.0, high=100000.0, precision=2)
    in_kind_amount = fuzzy.FuzzyDecimal(
        low=10000.0, high=100000.0, precision=2)
    funds_received_to_date = fuzzy.FuzzyDecimal(
        low=10000.0, high=100000.0, precision=2)
    partner = factory.SubFactory('core.factories.PartnerFactory')
    # workspace = factory.SubFactory('core.factories.WorkspaceFactory')

    cp_output = factory.RelatedFactory(
        'core.factories.PDResultLinkFactory',
        'programme_document')
    workspace = factory.Iterator(Workspace.objects.all())

    class Meta:
        model = ProgrammeDocument

    @factory.post_generation
    def create_cpos(self, create, extracted, **kwargs):
        """
        Create 2-3 CP outputs per PD
        """
        if not create:
            return
        for i in range(random.randint(2, 3)):
            PDResultLinkFactory.create(programme_document=self)


class DisaggregationFactory(factory.django.DjangoModelFactory):
    active = True

    class Meta:
        model = Disaggregation


class DisaggregationValueFactory(factory.django.DjangoModelFactory):
    active = True

    class Meta:
        model = DisaggregationValue


class QuantityIndicatorReportFactory(factory.django.DjangoModelFactory):

    title = factory.Sequence(lambda n: "quantity_indicator_report_%d" % n)
    time_period_start = factory.LazyAttribute(lambda o: o.time_period[0])
    time_period_end = factory.LazyAttribute(lambda o: o.time_period[1])
    due_date = factory.LazyAttribute(lambda o: o.time_period[1] + relativedelta(days=random.randint(2, 10)))
    total = dict([('c', 0), ('d', 0), ('v', random.randint(0, 3000))])
    overall_status = fuzzy.FuzzyChoice(OVERALL_STATUS_LIST)
    report_status = fuzzy.FuzzyChoice(REPORT_STATUS_LIST)
    submission_date = factory.LazyAttribute(lambda o: o.time_period[1] + relativedelta(days=random.randint(2, 10)))

    @factory.lazy_attribute
    def time_period(self):
        return next(REPORTABLE_RANGE_GENERATORS[self.reportable.id])

    class Meta:
        model = IndicatorReport
        exclude = ('time_period', )


class RatioIndicatorReportFactory(QuantityIndicatorReportFactory):
    title = factory.Sequence(lambda n: "ratio_indicator_report_%d" % n)
    total = dict([('c', 0), ('d', random.randint(3000, 6000)), ('v', random.randint(0, 3000))])


class PDResultLinkFactory(factory.django.DjangoModelFactory):
    external_id = factory.Sequence(lambda n: "%d" % n)
    external_cp_output_id = factory.Sequence(lambda n: "%d" % (n % 4))
    title = factory.Sequence(lambda n: "result link to country_programme_{}".format(n % 4))
    lower_level_output = factory.RelatedFactory('core.factories.LowerLevelOutputFactory', 'cp_output')

    class Meta:
        model = PDResultLink

    @factory.post_generation
    def create_llos(self, create, extracted, **kwargs):
        """
        Create 2-5 LLO's per Result link
        """
        if not create:
            return
        for i in range(random.randint(2, 5)):
            LowerLevelOutputFactory.create(cp_output=self)


class LowerLevelOutputFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "lower_level_output_%d" % n)

    class Meta:
        model = LowerLevelOutput


class IndicatorLocationDataFactory(factory.django.DjangoModelFactory):
    disaggregation = dict()
    num_disaggregation = 3
    level_reported = 3
    disaggregation_reported_on = list()

    class Meta:
        model = IndicatorLocationData
        django_get_or_create = ('indicator_report', 'location')


class GatewayTypeFactory(factory.django.DjangoModelFactory):
    name = factory.Sequence(lambda n: "gateway_type_%d" % n)
    admin_level = fuzzy.FuzzyInteger(1, 5, 1)

    class Meta:
        model = GatewayType


class CartoDBTableFactory(factory.django.DjangoModelFactory):
    domain = factory.Sequence(lambda n: "domain_%d" % n)
    api_key = factory.Sequence(lambda n: "api_key_%d" % n)
    table_name = factory.Sequence(lambda n: "table_name_%d" % n)

    class Meta:
        model = CartoDBTable
