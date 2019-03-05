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
    PartnerProjectFunding,
)
from indicator.models import (
    IndicatorBlueprint,
    Reportable,
    IndicatorReport,
    IndicatorLocationData,
    Disaggregation,
    DisaggregationValue,
    ReportableLocationGoal,
    ReportingEntity,
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
    REPORTING_TYPES,
    PRP_ROLE_TYPES,
    CLUSTER_TYPES,
    CSO_TYPES,
    PARTNER_TYPE,
    SHARED_PARTNER_TYPE,
    INDICATOR_REPORT_STATUS,
    FREQUENCY_LEVEL,
    PD_FREQUENCY_LEVEL,
    REPORTABLE_FREQUENCY_LEVEL,
    PD_DOCUMENT_TYPE,
    PROGRESS_REPORT_STATUS,
    PD_STATUS,
    RESPONSE_PLAN_TYPE,
    OVERALL_STATUS,
    PARTNER_PROJECT_STATUS,
    PARTNER_ACTIVITY_STATUS,
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
PARTNER_ACTIVITY_STATUS_LIST = [x[0] for x in PARTNER_ACTIVITY_STATUS]
REPORTING_TYPES_LIST = [x[0] for x in REPORTING_TYPES]
PD_STATUS_LIST = [x[0] for x in PD_STATUS]
PD_DOCUMENT_TYPE_LIST = [x[0] for x in PD_DOCUMENT_TYPE]
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
PROGRESS_REPORT_STATUS_LIST = [x[0] for x in PROGRESS_REPORT_STATUS]
FREQUENCY_LEVEL_LIST = [x[0] for x in FREQUENCY_LEVEL]

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
    latitude = factory.LazyFunction(faker.latitude)
    longitude = factory.LazyFunction(faker.longitude)
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
    latitude = factory.LazyFunction(faker.latitude)
    longitude = factory.LazyFunction(faker.longitude)
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
    start = factory.Sequence(lambda n: beginning_of_this_year + relativedelta(years=n-1))
    end = factory.Sequence(lambda n: beginning_of_this_year + relativedelta(years=n-1) + datetime.timedelta(days=364))
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
    cso_type = fuzzy.FuzzyChoice(CSO_TYPES_LIST)
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


class ClusterFactory(factory.django.DjangoModelFactory):
    """
    Arguments:
        response_plan {ResponsePlan} -- ResponsePlan ORM object to bind

    Ex) ClusterFactory(response_plan=response_plan)
    """

    type = fuzzy.FuzzyChoice(CLUSTER_TYPES_LIST)
    imported_type = factory.LazyAttribute(lambda o: o.type)
    response_plan = factory.SubFactory('core.factories.ResponsePlanFactory', cluster=None)

    class Meta:
        model = Cluster


class PartnerProjectFactory(factory.django.DjangoModelFactory):
    """
    Arguments:
        partner {Partner} -- Partner ORM object to bind
        clusters {Cluster} -- a list of Cluster ORM objects to bind
        locations {Location} -- a list of Location ORM objects to bind
        additional_partners {Partner} Optional -- an optional list of Partner ORM objects to bind

    Ex) PartnerProjectFactory(
            partner=partner1,
            clusters=[cluster1, cluster2, ...],
            locations=[loc1, loc2, ...],
            additional_partners=[partner2, ...]
        )
    """

    code = None
    type = None
    title = factory.LazyAttributeSequence(lambda o, n: "{} Project {}".format(o.partner.title, n))
    description = factory.LazyFunction(faker.text)
    additional_information = factory.LazyFunction(faker.url)
    custom_fields = list()
    start_date = beginning_of_this_year
    end_date = today
    status = fuzzy.FuzzyChoice(PARTNER_PROJECT_STATUS_LIST)
    agency_name = None
    agency_type = None
    prioritization = None
    total_budget = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    funding_source = factory.LazyFunction(faker.company)
    partner = factory.SubFactory('core.factories.PartnerFactory', partner_project=None)

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

    @factory.post_generation
    def additional_partners(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for additional_partner in extracted:
                self.additional_partners.add(additional_partner)

    class Meta:
        model = PartnerProject


class PartnerProjectFundingFactory(factory.django.DjangoModelFactory):
    """
    Arguments:
        project {PartnerProject} -- Partner Project ORM object to bind

    Ex) PartnerProjectFundingFactory(
            project=project1,
        )
    """

    project = factory.SubFactory('core.factories.PartnerProjectFactory', partner_project_funding=None)
    required_funding = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    internal_funding = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    cerf_funding = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    cbpf_funding = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    bilateral_funding = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    unicef_funding = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    wfp_funding = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)

    class Meta:
        model = PartnerProjectFunding


class AbstractPartnerActivityFactory(factory.django.DjangoModelFactory):
    project = factory.SubFactory('core.factories.PartnerProjectFactory', partner_activity=None)
    partner = factory.LazyAttribute(lambda o: o.project.partner)
    start_date = beginning_of_this_year
    end_date = beginning_of_this_year + datetime.timedelta(days=180)
    status = fuzzy.FuzzyChoice(PARTNER_ACTIVITY_STATUS_LIST)

    @factory.post_generation
    def locations(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for location in extracted:
                self.locations.add(location)

    class Meta:
        model = PartnerActivity
        abstract = True


class ClusterActivityPartnerActivityFactory(AbstractPartnerActivityFactory):
    """
    Arguments:
        cluster_activity {ClusterActivity} -- Cluster Activity ORM object to bind
        project {PartnerProject} -- PartnerProject ORM object to bind

    Ex) ClusterActivityPartnerActivityFactory(
            cluster_activity=cluster_activity1,
            project=project1,
        )
    """

    title = factory.LazyAttribute(lambda o: "from ClusterActivity {}".format(o.cluster_activity.title))
    cluster_activity = factory.SubFactory('core.factories.ClusterActivityFactory', partner_activity=None)
    cluster_objective = None

    class Meta:
        model = PartnerActivity


class CustomPartnerActivityFactory(AbstractPartnerActivityFactory):
    """
    Arguments:
        cluster_objective {ClusterObjective} -- Cluster Objective ORM object to bind
        project {PartnerProject} -- PartnerProject ORM object to bind

    Ex) ClusterActivityPartnerActivityFactory(
            cluster_objective=cluster_objective1,
            project {PartnerProject} -- PartnerProject ORM object to bind
        )
    """

    title = factory.LazyAttribute(lambda o: "{} -- Custom".format(o.project.title))
    cluster_activity = None
    cluster_objective = factory.SubFactory('core.factories.ClusterObjectiveFactory', partner_activity=None)

    class Meta:
        model = PartnerActivity


class ClusterObjectiveFactory(factory.django.DjangoModelFactory):
    """
    Arguments:
        cluster {Cluster} -- Cluster ORM object to bind

    Ex) ClusterObjectiveFactory(
            cluster=cluster1,
            locations=[loc1, loc2, ...]
        )
    """
    title = factory.LazyAttributeSequence(lambda o, n: "{} -- Objective {}".format(o.cluster.type, n))
    cluster = factory.SubFactory('core.factories.ClusterFactory', cluster_objective=None)

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
    """
    Arguments:
        cluster_objective {ClusterObjective} -- ClusterObjective ORM object to bind

    Ex) ClusterActivityFactory(
            cluster_objective=cluster_objective1,
            locations=[loc1, loc2, ...]
        )
    """
    title = factory.LazyAttributeSequence(lambda o, n: "{} -- Activity {}".format(o.cluster_objective.cluster.type, n))
    cluster_objective = factory.SubFactory('core.factories.ClusterObjectiveFactory', cluster_activity=None)

    @factory.post_generation
    def locations(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for location in extracted:
                self.locations.add(location)

    class Meta:
        model = ClusterActivity


class AbstractIndicatorBlueprintFactory(factory.django.DjangoModelFactory):
    description = None
    code = None
    subdomain = None
    disaggregatable = True

    class Meta:
        model = IndicatorBlueprint
        abstract = True


class QuantityTypeIndicatorBlueprintFactory(AbstractIndicatorBlueprintFactory):
    """
    Arguments:

    Ex) QuantityTypeIndicatorBlueprintFactory()
    """

    title = factory.Sequence(lambda n: "Quantity Indicator {}".format(n))
    unit = IndicatorBlueprint.NUMBER
    calculation_formula_across_locations = fuzzy.FuzzyChoice(
        QUANTITY_CALC_CHOICES_LIST)
    calculation_formula_across_periods = fuzzy.FuzzyChoice(
        QUANTITY_CALC_CHOICES_LIST)
    display_type = IndicatorBlueprint.NUMBER

    class Meta:
        model = IndicatorBlueprint


class RatioTypeIndicatorBlueprintFactory(AbstractIndicatorBlueprintFactory):
    """
    Arguments:

    Ex) QuantityTypeIndicatorBlueprintFactory()
    """

    title = factory.Sequence(lambda n: "Ratio Indicator {}".format(n))
    unit = IndicatorBlueprint.PERCENTAGE
    calculation_formula_across_locations = fuzzy.FuzzyChoice(
        RATIO_CALC_CHOICES_LIST)
    calculation_formula_across_periods = fuzzy.FuzzyChoice(
        RATIO_CALC_CHOICES_LIST)
    display_type = fuzzy.FuzzyChoice(
        RATIO_DISPLAY_TYPE_CHOICES_LIST)

    class Meta:
        model = IndicatorBlueprint


class DisaggregationFactory(factory.django.DjangoModelFactory):
    """
    Arguments:
        response_plan {ResponsePlan} -- ResponsePlan ORM object to bind

    Ex) DisaggregationFactory(response_plan=response_plan1)
    """

    active = True
    name = factory.LazyFunction(faker.word)
    response_plan = factory.SubFactory('core.factories.ResponsePlanFactory', disaggregation=None)

    class Meta:
        model = Disaggregation
        django_get_or_create = ('name', 'response_plan')


class IPDisaggregationFactory(factory.django.DjangoModelFactory):
    """
    Ex) DisaggregationFactory()
    """

    active = True
    name = factory.LazyFunction(faker.word)

    class Meta:
        model = Disaggregation
        django_get_or_create = ('name',)


class DisaggregationValueFactory(factory.django.DjangoModelFactory):
    """
    Arguments:
        disaggregation {Disaggregation} -- Disaggregation ORM object to bind

    Ex) DisaggregationFactory(disaggregation=disaggregation1)
    """

    active = True
    value = factory.LazyFunction(faker.word)
    disaggregation = factory.SubFactory('core.factories.DisaggregationFactory', disaggregation_value=None)

    class Meta:
        model = DisaggregationValue
        django_get_or_create = ('disaggregation', 'value')


class AbstractReportableFactory(factory.django.DjangoModelFactory):
    object_id = factory.SelfAttribute('content_object.id')
    content_type = factory.LazyAttribute(
        lambda o: ContentType.objects.get_for_model(o.content_object))
    cs_dates = [cs_date_1, cs_date_2, cs_date_3]
    frequency = fuzzy.FuzzyChoice(REPORTABLE_FREQUENCY_LEVEL_CHOICE_LIST)
    active = True
    assumptions = None
    means_of_verification = None
    comments = None
    measurement_specifications = None
    context_code = None
    location_admin_refs = None
    is_cluster_indicator = False
    is_unicef_hf_indicator = False
    contributes_to_partner = False
    parent_indicator = None
    ca_indicator_used_by_reporting_entity = None
    start_date_of_reporting_period = beginning_of_this_year

    @factory.post_generation
    def locations(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for location in extracted:
                self.locations.add(location)

    @factory.post_generation
    def disaggregations(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for disaggregation in extracted:
                self.disaggregations.add(disaggregation)

    class Meta:
        exclude = ['content_object']
        abstract = True


class QuantityReportableBaseFactory(AbstractReportableFactory):
    target = dict(
        [('d', 1), ('v', random.randint(1000, 10000))])
    baseline = dict(
        [('d', 1), ('v', random.randint(0, 500))])
    in_need = dict(
        [('d', 1), ('v', random.randint(20000, 50000))])
    total = dict(
        [('c', 0), ('d', 1), ('v', random.randint(0, 3000))])
    label = factory.LazyFunction(faker.word)
    numerator_label = None
    denominator_label = None
    blueprint = factory.SubFactory(
        'core.factories.QuantityTypeIndicatorBlueprintFactory', reportable=None)

    class Meta:
        model = Reportable
        abstract = True


class RatioReportableBaseFactory(AbstractReportableFactory):
    target = dict(
        [('d', random.randint(20000, 40000)), ('v', random.randint(10000, 20000))])
    baseline = dict(
        [('d', random.randint(200, 400)), ('v', random.randint(100, 200))])
    in_need = dict(
        [('d', random.randint(50000, 60000)), ('v', random.randint(30000, 40000))])
    total = dict(
        [('c', 0), ('d', random.randint(3000, 6000)), ('v', random.randint(0, 3000))])
    label = None
    numerator_label = factory.LazyFunction(faker.word)
    denominator_label = factory.LazyFunction(faker.word)
    blueprint = factory.SubFactory(
        'core.factories.RatioTypeIndicatorBlueprintFactory', reportable=None)

    class Meta:
        model = Reportable
        abstract = True


class QuantityReportableToLowerLevelOutputFactory(QuantityReportableBaseFactory):
    """
    Arguments:
        content_object {LowerLevelOutput} -- LowerLevelOutput ORM object to bind
        blueprint {IndicatorBlueprint} -- IndicatorBlueprint ORM object to bind

    Ex) QuantityReportableToLowerLevelOutputFactory(
            content_object=lower_level_output1, blueprint=blueprint1
        )
    """
    content_object = factory.SubFactory(
        'core.factories.LowerLevelOutputFactory', reportable=None)

    class Meta:
        model = Reportable


class QuantityReportableToPartnerProjectFactory(QuantityReportableBaseFactory):
    """
    Arguments:
        content_object {PartnerProject} -- PartnerProject ORM object to bind
        blueprint {IndicatorBlueprint} -- IndicatorBlueprint ORM object to bind

    Ex) QuantityReportableToPartnerProjectFactory(
            content_object=project1, blueprint=blueprint1
        )
    """

    content_object = factory.SubFactory('core.factories.PartnerProjectFactory', reportable=None)

    class Meta:
        model = Reportable


class QuantityReportableToClusterObjectiveFactory(QuantityReportableBaseFactory):
    """
    Arguments:
        content_object {ClusterObjective} -- ClusterObjective ORM object to bind
        blueprint {IndicatorBlueprint} -- IndicatorBlueprint ORM object to bind

    Ex) QuantityReportableToClusterObjectiveFactory(
            content_object=objective1, blueprint=blueprint1
        )
    """
    content_object = factory.SubFactory(
        'core.factories.ClusterObjectiveFactory', reportable=None)

    class Meta:
        model = Reportable


class QuantityReportableToClusterActivityFactory(QuantityReportableBaseFactory):
    """
    Arguments:
        content_object {ClusterActivity} -- ClusterActivity ORM object to bind
        blueprint {IndicatorBlueprint} -- IndicatorBlueprint ORM object to bind

    Ex) QuantityReportableToClusterActivityFactory(
            content_object=activity1, blueprint=blueprint1
        )
    """
    content_object = factory.SubFactory(
        'core.factories.ClusterActivityFactory', reportable=None)

    class Meta:
        model = Reportable


class QuantityReportableToPartnerActivityFactory(QuantityReportableBaseFactory):
    """
    Arguments:
        content_object {PartnerActivity} -- PartnerActivity ORM object to bind
        blueprint {IndicatorBlueprint} -- IndicatorBlueprint ORM object to bind

    Ex) QuantityReportableToPartnerActivityFactory(
            content_object=activity1, blueprint=blueprint1
        )
    """

    content_object = factory.SubFactory(
        'core.factories.PartnerActivityFactory', reportable=None)

    class Meta:
        model = Reportable


class RatioReportableToLowerLevelOutputFactory(RatioReportableBaseFactory):
    """
    Arguments:
        content_object {LowerLevelOutput} -- LowerLevelOutput ORM object to bind
        blueprint {IndicatorBlueprint} -- IndicatorBlueprint ORM object to bind

    Ex) RatioReportableToLowerLevelOutputFactory(
            content_object=lower_level_output1, blueprint=blueprint1
        )
    """
    content_object = factory.SubFactory(
        'core.factories.LowerLevelOutputFactory', reportable=None)

    class Meta:
        model = Reportable


class RatioReportableToPartnerProjectFactory(RatioReportableBaseFactory):
    """
    Arguments:
        content_object {PartnerProject} -- PartnerProject ORM object to bind
        blueprint {IndicatorBlueprint} -- IndicatorBlueprint ORM object to bind

    Ex) RatioReportableToPartnerProjectFactory(
            content_object=project1, blueprint=blueprint1
        )
    """
    content_object = factory.SubFactory('core.factories.PartnerProjectFactory', reportable=None)

    class Meta:
        model = Reportable


class RatioReportableToClusterObjectiveFactory(RatioReportableBaseFactory):
    """
    Arguments:
        content_object {ClusterObjective} -- ClusterObjective ORM object to bind
        blueprint {IndicatorBlueprint} -- IndicatorBlueprint ORM object to bind

    Ex) RatioReportableToClusterObjectiveFactory(
            content_object=objective1, blueprint=blueprint1
        )
    """

    content_object = factory.SubFactory(
        'core.factories.ClusterObjectiveFactory', reportable=None)

    class Meta:
        model = Reportable


class RatioReportableToClusterActivityFactory(RatioReportableBaseFactory):
    """
    Arguments:
        content_object {ClusterActivity} -- ClusterActivity ORM object to bind
        blueprint {IndicatorBlueprint} -- IndicatorBlueprint ORM object to bind

    Ex) RatioReportableToClusterActivityFactory(
            content_object=activity1, blueprint=blueprint1
        )
    """

    content_object = factory.SubFactory(
        'core.factories.ClusterActivityFactory', reportable=None)

    class Meta:
        model = Reportable


class RatioReportableToPartnerActivityFactory(RatioReportableBaseFactory):
    """
    Arguments:
        content_object {PartnerActivity} -- PartnerActivity ORM object to bind
        blueprint {IndicatorBlueprint} -- IndicatorBlueprint ORM object to bind

    Ex) RatioReportableToPartnerActivityFactory(
            content_object=activity1, blueprint=blueprint1
        )
    """

    content_object = factory.SubFactory(
        'core.factories.PartnerActivityFactory', reportable=None)

    class Meta:
        model = Reportable


class SectionFactory(factory.django.DjangoModelFactory):
    """
    Arguments:

    Ex) SectionFactory()
    """

    name = factory.LazyFunction(faker.word)

    class Meta:
        model = Section


class PersonFactory(factory.django.DjangoModelFactory):
    """
    Arguments:

    Ex) PersonFactory()
    """

    name = factory.LazyFunction(faker.name)
    title = factory.LazyFunction(faker.job)
    phone_number = factory.LazyFunction(faker.phone_number)
    email = factory.LazyFunction(faker.ascii_safe_email)
    active = True

    class Meta:
        model = Person
        django_get_or_create = ('email', )


class AbstractReportingPeriodDatesFactory(factory.django.DjangoModelFactory):
    programme_document = factory.SubFactory('core.factories.ProgrammeDocumentFactory', reporting_period_date=None)
    description = factory.LazyFunction(faker.sentence)

    class Meta:
        model = ReportingPeriodDates


class QPRReportingPeriodDatesFactory(AbstractReportingPeriodDatesFactory):
    """
    Arguments:

    Ex) QPRReportingPeriodDatesFactory(programme_document=programme_document1)
    """

    start_date = factory.Sequence(lambda n: beginning_of_this_year + relativedelta(months=3 * (n - 1)))
    end_date = factory.Sequence(lambda n: beginning_of_this_year + relativedelta(months=3 * (n - 1)) + relativedelta(months=3))
    due_date = factory.Sequence(lambda n: beginning_of_this_year + relativedelta(months=3 * (n - 1)) + relativedelta(months=3, days=1))
    report_type = 'QPR'

    class Meta:
        model = ReportingPeriodDates


class HRReportingPeriodDatesFactory(AbstractReportingPeriodDatesFactory):
    """
    Arguments:

    Ex) HRReportingPeriodDatesFactory(programme_document=programme_document1)
    """

    start_date = factory.Sequence(lambda n: beginning_of_this_year + relativedelta(months=1 * (n - 1)))
    end_date = factory.Sequence(lambda n: beginning_of_this_year + relativedelta(months=1 * (n - 1)) + relativedelta(months=1))
    due_date = factory.Sequence(lambda n: beginning_of_this_year + relativedelta(months=1 * (n - 1)) + relativedelta(months=1, days=1))
    report_type = 'HR'

    class Meta:
        model = ReportingPeriodDates


class ProgrammeDocumentFactory(factory.django.DjangoModelFactory):
    """
    Arguments:
        workspace {Workspace} -- Workspace ORM object to bind
        partner {Partner} -- Partner ORM object to bind
        sections {Section} -- A list of Section ORM objects to bind
        unicef_officers {Person} -- A list of Person ORM objects to bind
        unicef_focal_point {Person} -- A list of Person ORM objects to bind
        partner_focal_point {Person} -- A list of Person ORM objects to bind

    Ex) ProgrammeDocumentFactory(
            workspace=workspace1,
            partner=partner1,
            sections=[section1, ],
            unicef_officers=[unicef_officer, ],
            unicef_focal_point=[unicef_focal_point1, ],
            partner_focal_point=[partner_focal_point1, ]
        )
    """

    agreement = factory.LazyFunction(lambda: faker.uuid4()[:255])
    document_type = PD_DOCUMENT_TYPE.PD
    reference_number = factory.LazyFunction(lambda: faker.uuid4()[:255])
    title = factory.LazyFunction(faker.sentence)
    unicef_office = factory.LazyFunction(faker.city)
    workspace = factory.SubFactory('core.factories.WorkspaceFactory', programme_document=None)
    partner = factory.SubFactory('core.factories.PartnerFactory', programme_document=None)
    start_date = beginning_of_this_year
    end_date = datetime.date(today.year, 12, 31)
    status = fuzzy.FuzzyChoice(PD_STATUS_LIST)
    contributing_to_cluster = True
    frequency = fuzzy.FuzzyChoice(PD_FREQUENCY_LEVEL_CHOICE_LIST)
    budget = fuzzy.FuzzyDecimal(low=1000.0, high=100000.0, precision=2)
    cso_contribution = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    total_unicef_cash = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    in_kind_amount = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    funds_received_to_date = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    budget_currency = factory.LazyFunction(faker.currency_code)
    cso_contribution_currency = factory.LazyAttribute(lambda o: o.budget_currency)
    total_unicef_cash_currency = factory.LazyAttribute(lambda o: o.budget_currency)
    in_kind_amount_currency = factory.LazyAttribute(lambda o: o.budget_currency)
    funds_received_to_date_currency = factory.LazyAttribute(lambda o: o.budget_currency)
    amendments = list()

    @factory.post_generation
    def sections(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for section in extracted:
                self.sections.add(section)

    @factory.post_generation
    def unicef_officers(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for unicef_officer in extracted:
                self.unicef_officers.add(unicef_officer)

    @factory.post_generation
    def unicef_focal_point(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for unicef_focal_point in extracted:
                self.unicef_focal_point.add(unicef_focal_point)

    @factory.post_generation
    def partner_focal_point(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for partner_focal_point in extracted:
                self.partner_focal_point.add(partner_focal_point)

    class Meta:
        model = ProgrammeDocument


class PDResultLinkFactory(factory.django.DjangoModelFactory):
    """
    Arguments:
        programme_document {ProgrammeDocument} -- ProgrammeDocument ORM object to bind

    Ex) PDResultLinkFactory(
            programme_document=programme_document1,
        )
    """

    external_id = factory.LazyFunction(lambda: faker.uuid4()[:32])
    programme_document = factory.SubFactory('core.factories.ProgrammeDocumentFactory', cp_outputs=None)
    external_cp_output_id = factory.LazyFunction(lambda: faker.random_number(7, True))
    title = factory.LazyFunction(faker.sentence)

    class Meta:
        model = PDResultLink
        django_get_or_create = ('external_id', 'external_cp_output_id')


class LowerLevelOutputFactory(factory.django.DjangoModelFactory):
    """
    Arguments:
        cp_output {PDResultLink} -- PDResultLink ORM object to bind

    Ex) LowerLevelOutputFactory(
            cp_output=cp_output1,
        )
    """
    title = factory.LazyFunction(faker.sentence)
    cp_output = factory.SubFactory('core.factories.PDResultLinkFactory', lower_level_output=None)
    active = True

    class Meta:
        model = LowerLevelOutput


class LocationWithReportableLocationGoalFactory(factory.django.DjangoModelFactory):
    """
    Arguments:
        location {Location} -- Location ORM object to bind
        reportable {Reportable} -- Reportable ORM object to bind

    Ex) LocationWithReportableLocationGoalFactory(
            location=location1,
            reportable=reportable1,
        )
    """

    location = factory.SubFactory('core.factories.LocationFactory', location_goal=None)
    reportable = factory.SubFactory('core.factories.ReportableFactory', location_goal=None)
    target = dict(
        [('d', 1), ('v', random.randint(1000, 10000))])
    baseline = dict(
        [('d', 1), ('v', random.randint(0, 500))])
    in_need = dict(
        [('d', 1), ('v', random.randint(20000, 50000))])

    class Meta:
        model = ReportableLocationGoal
        django_get_or_create = ('location', 'reportable')


class ProgressReportFactory(factory.django.DjangoModelFactory):
    """
    Arguments:
        start_date {datetime.date} -- Datetime date object for start date
        end_date {datetime.date} -- Datetime date object for end date
        due_date {datetime.date} -- Datetime date object for due date
        report_number {int} -- Report number
        report_type {str} -- Report type: QPR, HR, SR
        is_final {bool} -- A flag for final report
        programme_document {ProgrammeDocument} -- ProgrammeDocument ORM object to bind
        submitted_by {User} -- User ORM object to bind
        submitting_user {User} -- User ORM object to bind

    Ex) ProgressReportFactory(
            start_date=start_date1,
            end_date=end_date1,
            due_date=due_date1,
            report_number=1,
            report_type="QPR",
            is_final=False,
            programme_document=programme_document1,
            submitted_by=submitted_by1,
            submitting_user=submitting_user1,
        )
    """
    start_date = factory.LazyFunction(faker.date)
    end_date = factory.LazyFunction(faker.date)
    due_date = factory.LazyFunction(faker.date)
    partner_contribution_to_date = factory.LazyFunction(faker.text)
    challenges_in_the_reporting_period = factory.LazyFunction(faker.text)
    proposed_way_forward = factory.LazyFunction(faker.text)
    review_date = due_date
    submission_date = due_date
    programme_document = factory.SubFactory('core.factories.ProgrammeDocument', progress_report=None)
    submitted_by = factory.SubFactory('core.factories.AbstractUserFactory', progress_report=None)
    submitting_user = factory.SubFactory('core.factories.AbstractUserFactory', progress_report=None)
    reviewed_by_email = factory.LazyFunction(faker.ascii_safe_email)
    reviewed_by_name = factory.LazyFunction(faker.name)
    sent_back_feedback = factory.LazyFunction(faker.text)
    narrative = factory.LazyFunction(faker.text)
    reviewed_by_external_id = factory.LazyFunction(lambda: faker.random_number(4, True))
    status = fuzzy.FuzzyChoice(PROGRESS_REPORT_STATUS_LIST)
    review_overall_status = fuzzy.FuzzyChoice(PROGRESS_REPORT_STATUS_LIST)
    attachment = None

    class Meta:
        django_get_or_create = (
            'programme_document', 'report_type', 'report_number'
        )
        model = ProgressReport


class AbstractIndicatorReportFactory(factory.django.DjangoModelFactory):
    title = factory.LazyAttribute(lambda o: o.reportable.blueprint.title)
    time_period_start = factory.LazyAttribute(lambda o: o.time_period[0])
    time_period_end = factory.LazyAttribute(lambda o: o.time_period[1])
    due_date = factory.LazyAttribute(lambda o: o.time_period[1] + relativedelta(days=1))
    submission_date = due_date
    review_date = due_date
    total = dict([('c', 0), ('d', 0), ('v', random.randint(0, 3000))])
    overall_status = fuzzy.FuzzyChoice(OVERALL_STATUS_LIST)
    report_status = fuzzy.FuzzyChoice(REPORT_STATUS_LIST)
    frequency = fuzzy.FuzzyChoice(FREQUENCY_LEVEL_LIST)
    reportable = factory.SubFactory('core.factories.AbstractReportableFactory', indicator_report=None)
    remarks = factory.LazyFunction(faker.text)
    narrative_assessment = factory.LazyFunction(faker.sentence)
    sent_back_feedback = factory.LazyFunction(faker.text)
    parent = None
    progress_report = None
    reporting_entity = None

    @factory.lazy_attribute
    def time_period(self):
        return next(REPORTABLE_RANGE_GENERATORS[self.reportable.id])

    class Meta:
        model = IndicatorReport
        abstract = True
        exclude = ('time_period', )


class ClusterIndicatorReportFactory(AbstractIndicatorReportFactory):
    """
    Arguments:
        reportable {Reportable} -- Reportable ORM object to bind

    Ex) ClusterIndicatorReportFactory(
            reportable=reportable1,
        )
    """
    progress_report = None
    reporting_entity = ReportingEntity.objects.get(title="Cluster")

    class Meta:
        model = IndicatorReport
        exclude = ('time_period', )


class ProgressReportIndicatorReportFactory(AbstractIndicatorReportFactory):
    """
    Arguments:
        reportable {Reportable} -- Reportable ORM object for start date
        progress_report {ProgressReport} -- ProgressReport ORM object to bind

    Ex) ProgressReportIndicatorReportFactory(
            reportable=reportable1,
            progress_report=progress_report1,
        )
    """
    progress_report = factory.SubFactory('core.factories.ProgressReportFactory', indicator_report=None)
    reporting_entity = ReportingEntity.objects.get(title="UNICEF")

    class Meta:
        model = IndicatorReport
        exclude = ('time_period', )


class IndicatorLocationDataFactory(factory.django.DjangoModelFactory):
    """
    Arguments:
        indicator_report {IndicatorReport} -- IndicatorReport ORM object to bind
        location {Location} -- Location ORM object to bind

    Ex) IndicatorLocationDataFactory(
            indicator_report=indicator_report1,
            location=location1,
        )
    """
    num_disaggregation = 3
    level_reported = 3
    disaggregation = dict()
    disaggregation_reported_on = list()
    is_locked = False
    percentage_allocated = fuzzy.FuzzyDecimal(0, 100)
    indicator_report = factory.SubFactory('core.factories.IndicatorReportFactory', location_data=None)
    location = factory.SubFactory('core.factories.LocationFactory', location_data=None)

    class Meta:
        model = IndicatorLocationData
