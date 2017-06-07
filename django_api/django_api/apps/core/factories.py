import datetime
import random

from django.contrib.auth.models import Group
from django.db.models.signals import post_save
from django.contrib.contenttypes.models import ContentType

from psycopg2.extras import NumericRange

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
    IndicatorDisaggregation,
    IndicatorDataSpecification,
    IndicatorReport,
    IndicatorLocationData,
)
from unicef.models import (
    Section,
    ProgressReport,
    ProgrammeDocument,
    CountryProgrammeOutput,
    LowerLevelOutput,
)
from core.common import FREQUENCY_LEVEL, PD_STATUS
from core.models import Intervention, Location
from core.countries import COUNTRIES_ALPHA2_CODE

PD_STATUS_LIST = [x[0] for x in PD_STATUS]
COUNTRIES_LIST = [x[0] for x in COUNTRIES_ALPHA2_CODE]


class PartnerFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "partner_%d" % n)
    total_ct_cp = fuzzy.FuzzyInteger(1000, 10000, 100)
    partner_activity = factory.RelatedFactory('core.factories.PartnerActivityFactory', 'partner')
    partner_project = factory.RelatedFactory('core.factories.PartnerProjectFactory', 'partner')
    user = factory.RelatedFactory('core.factories.UserFactory', 'partner')

    @factory.post_generation
    def cluster(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for cluster in extracted:
                self.cluster.add(cluster)

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
    status = fuzzy.FuzzyText()

    @factory.post_generation
    def cluster(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for cluster in extracted:
                self.cluster.add(cluster)

    @factory.post_generation
    def location(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for cluster in extracted:
                self.location.add(cluster)

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

    cluster = factory.RelatedFactory('core.factories.ClusterFactory', 'intervention')

    @factory.post_generation
    def locations(self, create, extracted, **kwargs):
        if not create:
            # Simple build, do nothing.
            return

        if extracted:
            # A list of groups were passed in, use them
            for location in extracted:
                self.locations.add(location)

    class Meta:
        model = Intervention


class ClusterFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "cluster_%d" % n)
    user = factory.SubFactory(UserFactory)

    objective = factory.RelatedFactory('core.factories.ClusterObjectiveFactory', 'cluster')

    class Meta:
        model = Cluster


class ClusterObjectiveFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "cluster_objective_%d" % n)

    objective = factory.RelatedFactory('core.factories.ClusterActivityFactory', 'cluster_objective')

    class Meta:
        model = ClusterObjective


class ClusterActivityFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "cluster_activity_%d" % n)

    class Meta:
        model = ClusterActivity


class IndicatorBlueprintFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "indicator_blueprint_%d" % n)

    class Meta:
        model = IndicatorBlueprint


class ReportableFactory(factory.django.DjangoModelFactory):
    blueprint = factory.SubFactory(IndicatorBlueprintFactory)
    project = factory.SubFactory(PartnerProjectFactory)
    object_id = factory.SelfAttribute('content_object.id')
    content_type = factory.LazyAttribute(
        lambda o: ContentType.objects.get_for_model(o.content_object))
    total = fuzzy.FuzzyInteger(10, 100, 5)

    class Meta:
        exclude = ['content_object']
        abstract = True


class ReportableToLowerLevelOutputFactory(ReportableFactory):
    content_object = factory.SubFactory('core.factories.LowerLevelOutputFactory')
    target = '5000'
    baseline = '0'

    indicator_report = factory.RelatedFactory('core.factories.IndicatorReportFactory', 'reportable')

    location = factory.RelatedFactory('core.factories.LocationFactory', 'reportable', parent=None)

    class Meta:
        model = Reportable


class ReportableToClusterActivityFactory(ReportableFactory):
    objective = factory.SubFactory(ClusterObjectiveFactory)
    content_object = factory.SubFactory('core.factories.ClusterActivityFactory')
    target = '5000'
    baseline = '0'

    class Meta:
        model = Reportable


class ReportableToPartnerActivityFactory(ReportableFactory):
    content_object = factory.SubFactory('core.factories.PartnerActivityFactory')
    target = '5000'
    baseline = '0'

    class Meta:
        model = Reportable


class IndicatorDisaggregationFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "indicator_disaggregation_%d" % n)
    indicator = factory.SubFactory(ReportableToLowerLevelOutputFactory)
    range = NumericRange(0, 200)

    class Meta:
        model = IndicatorDisaggregation


class IndicatorDataSpecificationFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "indicator_data_specification_%d" % n)
    indicator = factory.SubFactory(ReportableToLowerLevelOutputFactory)
    frequency = fuzzy.FuzzyInteger(100)

    class Meta:
        model = IndicatorDataSpecification


class LocationFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "location_%d" % n)

    class Meta:
        model = Location


class ProgressReportFactory(factory.django.DjangoModelFactory):
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
    frequency = FREQUENCY_LEVEL.weekly
    budget = fuzzy.FuzzyDecimal(low=1000.0, high=100000.0, precision=2)
    unicef_office = factory.Sequence(lambda n: "JCO country programme %d" % n)
    unicef_focal_point = factory.Sequence(lambda n: "Abdallah Yakhola %d" % n)
    partner_focal_point = factory.Sequence(lambda n: "Hanin Odeh %d" % n)

    cso_contribution = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    unicef_cash = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)
    in_kind_amount = fuzzy.FuzzyDecimal(low=10000.0, high=100000.0, precision=2)

    cp_output = factory.RelatedFactory('core.factories.CountryProgrammeOutputFactory', 'programme_document')

    class Meta:
        model = ProgrammeDocument


class IndicatorReportFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "indicator_report_%d" % n)
    time_period_start = fuzzy.FuzzyDate(datetime.date.today())
    time_period_end = fuzzy.FuzzyDate(datetime.date.today())
    progress_report = factory.SubFactory(ProgressReportFactory)
    due_date = fuzzy.FuzzyDate(datetime.date.today())
    total = fuzzy.FuzzyInteger(0, 3000, 100)

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
    disaggregation = {
        "extrashort": {
            "1-2m": {
                "male": random.randint(50, 200),
                "female": random.randint(50, 200),
                "other": random.randint(50, 200),
            },
            "3-5m": {
                "male": random.randint(50, 200),
                "female": random.randint(50, 200),
                "other": random.randint(50, 200),
            },
            "6-10m": {
                "male": random.randint(50, 200),
                "female": random.randint(50, 200),
                "other": random.randint(50, 200),
            }
        },

        "short": {
            "1-2m": {
                "male": random.randint(50, 200),
                "female": random.randint(50, 200),
                "other": random.randint(50, 200),
            },
            "3-5m": {
                "male": random.randint(50, 200),
                "female": random.randint(50, 200),
                "other": random.randint(50, 200),
            },
            "6-10m": {
                "male": random.randint(50, 200),
                "female": random.randint(50, 200),
                "other": random.randint(50, 200),
            }
        },

        "medium": {
            "1-2m": {
                "male": random.randint(50, 200),
                "female": random.randint(50, 200),
                "other": random.randint(50, 200),
            },
            "3-5m": {
                "male": random.randint(50, 200),
                "female": random.randint(50, 200),
                "other": random.randint(50, 200),
            },
            "6-10m": {
                "male": random.randint(50, 200),
                "female": random.randint(50, 200),
                "other": random.randint(50, 200),
            }
        },

        "tall": {
            "1-2m": {
                "male": random.randint(50, 200),
                "female": random.randint(50, 200),
                "other": random.randint(50, 200),
            },
            "3-5m": {
                "male": random.randint(50, 200),
                "female": random.randint(50, 200),
                "other": random.randint(50, 200),
            },
            "6-10m": {
                "male": random.randint(50, 200),
                "female": random.randint(50, 200),
                "other": random.randint(50, 200),
            }
        }
    }

    class Meta:
        model = IndicatorLocationData
