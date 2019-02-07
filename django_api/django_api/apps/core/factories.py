import datetime
import json
import random
from collections import defaultdict
from dateutil.relativedelta import relativedelta

from django.contrib.contenttypes.models import ContentType
from django.db.models import signals

import factory
from factory import fuzzy
from faker import Faker

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
    ReportableLocationGoal,
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
    PRP_ROLE_TYPES,
    RESPONSE_PLAN_TYPE,
    PARTNER_TYPE,
    SHARED_PARTNER_TYPE,
    CSO_TYPES,
)
from core.models import (
    Country,
    Workspace,
    Location,
    ResponsePlan,
    GatewayType,
    CartoDBTable,
    PRPRole,
)
from core.countries import COUNTRIES_ALPHA2_CODE, COUNTRIES_ALPHA2_CODE_DICT


PRP_ROLE_TYPES_LIST = [x[0] for x in PRP_ROLE_TYPES]
IP_PRP_ROLE_TYPES_LIST = list(filter(lambda item: item.startswith('IP'), PRP_ROLE_TYPES_LIST))
CLUSTER_PRP_ROLE_TYPES_LIST = list(filter(lambda item: item.startswith('CLUSTER'), PRP_ROLE_TYPES_LIST))
PARTNER_PROJECT_STATUS_LIST = [x[0] for x in PARTNER_PROJECT_STATUS]
PD_STATUS_LIST = [x[0] for x in PD_STATUS]
COUNTRY_CODES_LIST = [x[0] for x in COUNTRIES_ALPHA2_CODE]
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
RESPONSE_PLAN_TYPE_LIST = [x[0] for x in RESPONSE_PLAN_TYPE]
PARTNER_TYPE_LIST = [x[0] for x in PARTNER_TYPE]
SHARED_PARTNER_TYPE_LIST = [x[0] for x in SHARED_PARTNER_TYPE]
CSO_TYPES_LIST = [x[0] for x in CSO_TYPES]

today = datetime.date.today()
beginning_of_this_year = datetime.date(today.year, 1, 1)
cs_date_1 = datetime.date(today.year, 1, 1)
cs_date_2 = datetime.date(today.year, 3, 24)
cs_date_3 = datetime.date(today.year, 5, 15)
faker = Faker()


def create_fake_multipolygon():
    from django.contrib.gis.geos import Polygon, MultiPolygon

    p1 = Polygon(((0, 0), (0, 1), (1, 1), (0, 0)))
    p2 = Polygon(((1, 1), (1, 2), (2, 2), (1, 1)))

    return MultiPolygon(p1, p2)


class TestDateRangeGenerator:

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


REPORTABLE_RANGE_GENERATORS = defaultdict(lambda: iter(TestDateRangeGenerator()))


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


class AbstractUserFactory(factory.django.DjangoModelFactory):
    first_name = factory.LazyFunction(faker.first_name)
    last_name = factory.LazyFunction(faker.last_name)
    organization = factory.LazyFunction(faker.last_name)
    email = factory.LazyFunction(faker.safe_email)
    position = factory.LazyFunction(faker.job)
    username = factory.LazyFunction(faker.user_name)
    password = factory.PostGenerationMethodCall('set_password', 'test')
    profile = factory.RelatedFactory('core.factories.UserProfileFactory', 'user')

    class Meta:
        model = User
        django_get_or_create = ('email', 'username')
        abstract = True


@factory.django.mute_signals(signals.post_save)
class UserProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UserProfile

    user = factory.SubFactory('core.factories.AbstractUserFactory', profile=None)


@factory.django.mute_signals(signals.post_save)
class PartnerUserFactory(AbstractUserFactory):
    """
    Arguments:
        partner {Partner} -- Partner ORM object

    Ex) PartnerUserFactory(partner=partner1)
    """

    # We are going to let PartnerFactory create PartnerUser
    partner = factory.SubFactory('core.factories.PartnerFactory', user=None)

    class Meta:
        model = User


@factory.django.mute_signals(signals.post_save)
class NonPartnerUserFactory(AbstractUserFactory):
    """
    Arguments:

    Ex) NonPartnerUserFactory()
    """

    class Meta:
        model = User


class AbstractPRPRoleFactory(factory.django.DjangoModelFactory):
    # We are going to manually fill foreignkeys
    user = factory.SubFactory('core.factories.UserFactory', prp_role=None)
    workspace = factory.SubFactory('core.factories.WorkspaceFactory', prp_role=None)
    is_active = True

    class Meta:
        model = PRPRole
        abstract = True


class IPPRPRoleFactory(AbstractPRPRoleFactory):
    """
    Arguments:
        user {User} -- User ORM object to bind
        workspace {Workspace} -- Workspace ORM object to bind for specific role on user
        role {str} Optional -- Argument to override role for Partner user

    Ex) IPPRPRoleFactory(user=user, workspace=workspace, role=PRP_ROLE_TYPES.ip_authorized_officer)
    """

    role = fuzzy.FuzzyChoice(IP_PRP_ROLE_TYPES_LIST)

    class Meta:
        model = PRPRole


class ClusterPRPRoleFactory(AbstractPRPRoleFactory):
    """
    Arguments:
        user {User} -- User ORM object to bind
        workspace {Workspace} -- Workspace ORM object to bind for specific role on user
        cluster {Cluster} -- Cluster ORM object to bind for specific role on user
        role {str} Optional -- Argument to override role for Cluster user

    Ex) ClusterPRPRoleFactory(user=user, workspace=workspace, cluster=cluster, role=PRP_ROLE_TYPES.cluster_imo)
    """

    cluster = factory.SubFactory('core.factories.ClusterFactory', prp_role=None)
    role = fuzzy.FuzzyChoice(CLUSTER_PRP_ROLE_TYPES_LIST)

    class Meta:
        model = PRPRole


class CountryFactory(factory.django.DjangoModelFactory):
    country_short_code = fuzzy.FuzzyChoice(COUNTRY_CODES_LIST)
    name = factory.LazyAttribute(lambda o: COUNTRIES_ALPHA2_CODE_DICT[o.country_short_code])
    long_name = factory.LazyAttribute(lambda o: COUNTRIES_ALPHA2_CODE_DICT[o.country_short_code])

    class Meta:
        model = Country


class WorkspaceFactory(factory.django.DjangoModelFactory):
    """
    Arguments:
        countries {List[Country]} -- a list of Country ORM objects

    Ex) WorkspaceFactory(countries=[country1, country2, ...])
    """

    title = factory.LazyAttribute(lambda o: o.countries[0].name)
    workspace_code = factory.LazyAttribute(lambda o: o.countries[0].country_short_code)
    business_area_code = factory.LazyFunction(lambda: faker.random_number(4, True))
    latitude = factory.LazyFunction(faker.geo_coordinate)
    longitude = factory.LazyFunction(faker.geo_coordinate)
    initial_zoom = 10

    @factory.post_generation
    def countries(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for country in extracted:
                self.countries.add(country)

    class Meta:
        model = Workspace
        django_get_or_create = ('workspace_code', )


class GatewayTypeFactory(factory.django.DjangoModelFactory):
    """
    Arguments:
        country {Country} -- Country ORM objects

    Ex) GatewayTypeFactory(country=country1)
    """

    name = factory.LazyAttribute(lambda o: "{}-Admin Level {}".format(o.country.country_short_code, o.admin_level))
    admin_level = factory.Sequence(lambda n: "%d" % n)

    # We are going to fill country manually
    country = factory.SubFactory('core.factories.CountryFactory', gateway_type=None)

    class Meta:
        model = GatewayType
        django_get_or_create = ('name', )


class CartoDBTableFactory(factory.django.DjangoModelFactory):
    """
    Arguments:
        location_type {GatewayType} -- GatewayType ORM objects
        country {Country} -- Country ORM objects

    Ex) CartoDBTableFactory(location_type=loc_type, country=country1)
    """
    domain = 'example'
    table_name = factory.LazyFunction(faker.uuid4)
    display_name = factory.LazyFunction(faker.city)
    # We are going to fill location type manually
    location_type = factory.SubFactory('core.factories.GatewayTypeFactory', carto_db_table=None)
    name_col = factory.LazyFunction(faker.word)
    pcode_col = factory.LazyFunction(faker.word)
    parent_code_col = ''
    parent = None
    # We are going to fill location type manually
    country = factory.SubFactory('core.factories.CountryFactory', carto_db_table=None)

    class Meta:
        model = CartoDBTable


class LocationFactory(factory.django.DjangoModelFactory):
    """
    Arguments:
        gateway {GatewayType} -- GatewayType ORM objects
        carto_db_table {Country} -- CartoDBTable ORM objects

    Ex) LocationFactory(gateway=b, carto_db_table=c)
    """
    external_id = factory.LazyFunction(lambda: faker.uuid4()[:32])
    external_source = factory.LazyFunction(faker.text)
    title = factory.LazyFunction(faker.city)
    # We are going to fill location type manually
    gateway = factory.SubFactory('core.factories.GatewayTypeFactory', location=None)
    # We are going to fill CartoDBTable manually
    carto_db_table = factory.SubFactory('core.factories.CartoDBTableFactory', location=None)
    latitude = factory.LazyFunction(faker.geo_coordinate)
    longitude = factory.LazyFunction(faker.geo_coordinate)
    p_code = factory.LazyAttribute(lambda o: "{}{}".format(o.gateway.country.country_short_code, faker.random_number(4)))
    parent = None
    geom = factory.LazyFunction(create_fake_multipolygon)
    point = None

    class Meta:
        model = Location


class ResponsePlanFactory(factory.django.DjangoModelFactory):
    """
    Arguments:
        workspace {Workspace} -- Workspace ORM objects

    Ex) ResponsePlanFactory(workspace=workspace1)
    """
    title = factory.LazyAttributeSequence(
        lambda o, n: "{} Response Plan {}".format(
            o.workspace.countries.first().name, n + beginning_of_this_year.year
        )
    )
    start = factory.Sequence(lambda n: beginning_of_this_year + relativedelta(years=n))
    end = factory.Sequence(lambda n: beginning_of_this_year + relativedelta(years=n) + datetime.timedelta(days=364))
    plan_type = RESPONSE_PLAN_TYPE.hrp
    plan_custom_type_label = ""
    workspace = factory.SubFactory('core.factories.WorkspaceFactory', response_plan=None)

    class Meta:
        model = ResponsePlan


class PartnerFactory(factory.django.DjangoModelFactory):
    """
    Arguments:
        clusters {List[Cluster]} Optional -- an optional list of Cluster ORM objects

    Ex) PartnerFactory(clusters=[cluster1, cluster2, ...])
    """

    title = factory.LazyFunction(faker.company)
    short_title = factory.LazyAttribute(lambda o: o.title)
    alternate_title = factory.LazyAttribute(lambda o: o.title)
    partner_type = PARTNER_TYPE.civil_society_org
    shared_partner = SHARED_PARTNER_TYPE.no
    cso_type = fuzzy.FuzzyChoice(CSO_TYPES)
    email = factory.LazyFunction(faker.ascii_safe_email)
    phone_number = factory.LazyFunction(faker.phone_number)
    last_assessment_date = None
    core_values_assessment_date = None
    street_address = factory.LazyFunction(faker.street_address)
    city = factory.LazyFunction(faker.city)
    postal_code = factory.LazyFunction(faker.postalcode)
    country_code = factory.LazyFunction(faker.country_code)
    total_ct_cp = fuzzy.FuzzyInteger(10000, 1000000, 2500)
    total_ct_cy = fuzzy.FuzzyInteger(10000, 500000, 6700)
    vendor_number = factory.LazyFunction(lambda: "{}".format(faker.random_number(10)))
    alternate_id = None
    rating = None
    basis_for_risk_rating = None
    ocha_external_id = None

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
    end_date = beginning_of_this_year + datetime.timedelta(days=180)
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
    display_type = fuzzy.FuzzyChoice(
        RATIO_DISPLAY_TYPE_CHOICES_LIST)

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

    class Meta:
        exclude = ['content_object']
        abstract = True


class ReportableLocationGoalFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ReportableLocationGoal


class LocationWithReportableLocationGoalFactory(factory.django.DjangoModelFactory):
    location = factory.SubFactory('core.factories.LocationFactory')
    reportable = factory.SubFactory('core.factories.ReportableFactory')
    target = dict(
        [('d', 1), ('v', random.randint(1000, 10000))])
    baseline = dict(
        [('d', 1), ('v', random.randint(0, 500))])
    in_need = dict(
        [('d', 1), ('v', random.randint(20000, 50000))])

    class Meta:
        model = ReportableLocationGoal
        django_get_or_create = ('location', 'reportable')


class QuantityReportableToLowerLevelOutputFactory(ReportableFactory):
    content_object = factory.SubFactory(
        'core.factories.LowerLevelOutputFactory')
    target = dict(
        [('d', 1), ('v', random.randint(1000, 10000))])
    baseline = dict(
        [('d', 1), ('v', random.randint(0, 500))])
    in_need = dict(
        [('d', 1), ('v', random.randint(20000, 50000))])
    total = dict(
        [('c', 0), ('d', 1), ('v', random.randint(0, 3000))])

    indicator_report = factory.RelatedFactory(
        'core.factories.QuantityIndicatorReportFactory', 'reportable')

    blueprint = factory.SubFactory(QuantityTypeIndicatorBlueprintFactory)

    class Meta:
        model = Reportable


class RatioReportableToLowerLevelOutputFactory(ReportableFactory):
    content_object = factory.SubFactory(
        'core.factories.LowerLevelOutputFactory')
    target = dict(
        [('d', random.randint(20000, 40000)), ('v', random.randint(10000, 20000))])
    baseline = dict(
        [('d', random.randint(200, 400)), ('v', random.randint(100, 200))])
    in_need = dict(
        [('d', random.randint(50000, 60000)), ('v', random.randint(30000, 40000))])
    total = dict(
        [('c', 0), ('d', random.randint(3000, 6000)), ('v', random.randint(0, 3000))])

    indicator_report = factory.RelatedFactory(
        'core.factories.RatioIndicatorReportFactory', 'reportable')

    blueprint = factory.SubFactory(RatioTypeIndicatorBlueprintFactory)

    class Meta:
        model = Reportable


class RatioReportableToClusterObjectiveFactory(ReportableFactory):
    content_object = factory.SubFactory(ClusterObjectiveFactory)
    target = dict(
        [('d', random.randint(20000, 40000)), ('v', random.randint(10000, 20000))])
    baseline = dict(
        [('d', random.randint(200, 400)), ('v', random.randint(100, 200))])
    in_need = dict(
        [('d', random.randint(50000, 60000)), ('v', random.randint(30000, 40000))])
    total = dict(
        [('c', 0), ('d', random.randint(3000, 6000)), ('v', random.randint(0, 3000))])

    indicator_report = factory.RelatedFactory(
        'core.factories.RatioIndicatorReportFactory', 'reportable')

    blueprint = factory.SubFactory(RatioTypeIndicatorBlueprintFactory)

    class Meta:
        model = Reportable


class QuantityReportableToPartnerProjectFactory(ReportableFactory):
    content_object = factory.SubFactory('core.factories.PartnerProjectFactory')
    target = dict(
        [('d', 1), ('v', random.randint(1000, 10000))])
    baseline = dict(
        [('d', 1), ('v', random.randint(0, 500))])
    in_need = dict(
        [('d', 1), ('v', random.randint(20000, 50000))])
    total = dict(
        [('c', 0), ('d', 1), ('v', random.randint(0, 3000))])

    indicator_report = factory.RelatedFactory(
        'core.factories.QuantityIndicatorReportFactory', 'reportable')

    blueprint = factory.SubFactory(QuantityTypeIndicatorBlueprintFactory)

    class Meta:
        model = Reportable


class QuantityReportableToClusterObjectiveFactory(ReportableFactory):
    content_object = factory.SubFactory(
        'core.factories.ClusterObjectiveFactory')
    target = dict(
        [('d', 1), ('v', random.randint(1000, 10000))])
    baseline = dict(
        [('d', 1), ('v', random.randint(0, 500))])
    in_need = dict(
        [('d', 1), ('v', random.randint(20000, 50000))])
    total = dict(
        [('c', 0), ('d', 1), ('v', random.randint(0, 3000))])

    indicator_report = factory.RelatedFactory(
        'core.factories.QuantityIndicatorReportFactory', 'reportable')

    blueprint = factory.SubFactory(QuantityTypeIndicatorBlueprintFactory)

    class Meta:
        model = Reportable


class QuantityReportableToClusterActivityFactory(ReportableFactory):
    content_object = factory.SubFactory(
        'core.factories.ClusterActivityFactory')
    target = dict(
        [('d', 1), ('v', random.randint(1000, 10000))])
    baseline = dict(
        [('d', 1), ('v', random.randint(0, 500))])
    in_need = dict(
        [('d', 1), ('v', random.randint(20000, 50000))])
    total = dict(
        [('c', 0), ('d', 1), ('v', random.randint(0, 3000))])

    indicator_report = factory.RelatedFactory(
        'core.factories.QuantityIndicatorReportFactory', 'reportable')

    blueprint = factory.SubFactory(QuantityTypeIndicatorBlueprintFactory)

    frequency = REPORTABLE_FREQUENCY_LEVEL.monthly

    class Meta:
        model = Reportable


class QuantityReportableToPartnerActivityFactory(ReportableFactory):
    content_object = factory.SubFactory(
        'core.factories.PartnerActivityFactory')
    target = dict(
        [('d', 1), ('v', random.randint(1000, 10000))])
    baseline = dict(
        [('d', 1), ('v', random.randint(0, 500))])
    in_need = dict(
        [('d', 1), ('v', random.randint(20000, 50000))])
    total = dict(
        [('c', 0), ('d', 1), ('v', random.randint(0, 3000))])
    frequency = REPORTABLE_FREQUENCY_LEVEL.monthly

    indicator_report = factory.RelatedFactory(
        'core.factories.QuantityIndicatorReportFactory', 'reportable')

    blueprint = factory.SubFactory(QuantityTypeIndicatorBlueprintFactory)

    class Meta:
        model = Reportable


class ProgressReportFactory(factory.django.DjangoModelFactory):
    start_date = beginning_of_this_year
    end_date = start_date + datetime.timedelta(days=30)
    due_date = start_date + datetime.timedelta(days=45)

    class Meta:
        django_get_or_create = (
            'programme_document', 'report_type', 'report_number'
        )
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
        django_get_or_create = ('email', )


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
    end_date = beginning_of_this_year + datetime.timedelta(days=364)
    status = fuzzy.FuzzyChoice(PD_STATUS_LIST)
    frequency = fuzzy.FuzzyChoice(PD_FREQUENCY_LEVEL_CHOICE_LIST)
    budget = fuzzy.FuzzyDecimal(low=1000.0, high=100000.0, precision=2)
    unicef_office = factory.Sequence(lambda n: "JCO country programme %d" % n)
    cso_contribution = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    total_unicef_cash = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    in_kind_amount = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    funds_received_to_date = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    partner = factory.SubFactory('core.factories.PartnerFactory')

    cp_output = factory.RelatedFactory(
        'core.factories.PDResultLinkFactory',
        'programme_document')
    workspace = factory.Iterator(Workspace.objects.all())

    class Meta:
        model = ProgrammeDocument

    @factory.post_generation
    def create_cpos(self, create, extracted, **kwargs):
        """
        Create 1-2 CP outputs per PD
        """
        if not create:
            return
        for i in range(random.randint(1, 2)):
            PDResultLinkFactory.create(programme_document=self)


class DisaggregationFactory(factory.django.DjangoModelFactory):
    active = True

    class Meta:
        model = Disaggregation
        django_get_or_create = ('name', 'response_plan')


class DisaggregationValueFactory(factory.django.DjangoModelFactory):
    active = True

    class Meta:
        model = DisaggregationValue
        django_get_or_create = ('disaggregation', 'value')


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
        django_get_or_create = ('external_id', 'external_cp_output_id')

    @factory.post_generation
    def create_llos(self, create, extracted, **kwargs):
        """
        Create 2-5 LLO's per Result link
        """
        if not create:
            return
        for i in range(random.randint(1, 3)):
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
