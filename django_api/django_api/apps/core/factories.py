import datetime

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
    IndicatorDisaggregation,
    IndicatorDataSpecification,
    IndicatorReport,
)
from unicef.models import (
    ProgressReport,
    ProgrammeDocument,
    CountryProgrammeOutput,
    LowerLevelOutput,
)


from core.models import Intervention, Location


class PartnerFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "partner_%d" % n)

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
    cluster_activity = factory.SubFactory('core.factories.ClusterActivityFactory')
    partner = factory.SubFactory(PartnerFactory)

    class Meta:
        model = PartnerActivity


class PartnerProjectFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "partner_project_%d" % n)
    partner = factory.SubFactory(PartnerFactory)
    start_date = fuzzy.FuzzyDate(datetime.date.today())
    end_date = fuzzy.FuzzyDate(datetime.date.today())
    status = fuzzy.FuzzyText()
    budget = fuzzy.FuzzyFloat(1000)

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
    username = factory.Sequence(lambda n: "user_%d" % n)
    email = factory.Sequence(lambda n: "user{}@notanemail.com".format(n))
    password = factory.PostGenerationMethodCall('set_password', 'test')

    profile = factory.RelatedFactory(UserProfileFactory, 'user')
    partner = factory.SubFactory(PartnerFactory)

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
    country_code = 'US'
    status = 'Dra'
    start = fuzzy.FuzzyDate(datetime.date.today())
    end = fuzzy.FuzzyDate(datetime.date.today())
    signed_by_unicef_date = fuzzy.FuzzyDate(datetime.date.today())
    signed_by_partner_date = fuzzy.FuzzyDate(datetime.date.today())

    class Meta:
        model = Intervention


class ClusterFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "cluster_%d" % n)
    intervention = factory.SubFactory(InterventionFactory)
    user = factory.SubFactory(UserFactory)

    class Meta:
        model = Cluster


class ClusterObjectiveFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "cluster_objective_%d" % n)
    cluster = factory.SubFactory(ClusterFactory)

    class Meta:
        model = ClusterObjective


class ClusterActivityFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "cluster_activity_%d" % n)
    cluster_objective = factory.SubFactory(ClusterObjectiveFactory)

    class Meta:
        model = ClusterActivity


class IndicatorBlueprintFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "indicator_blueprint_%d" % n)
    cluster_activity = factory.SubFactory(ClusterActivityFactory)

    class Meta:
        model = IndicatorBlueprint


class ReportableFactory(factory.django.DjangoModelFactory):
    blueprint = factory.SubFactory(IndicatorBlueprintFactory)
    project = factory.SubFactory(PartnerProjectFactory)
    objective = factory.SubFactory(ClusterObjectiveFactory)
    object_id = factory.SelfAttribute('content_object.id')
    content_type = factory.LazyAttribute(
        lambda o: ContentType.objects.get_for_model(o.content_object))

    class Meta:
        exclude = ['content_object']
        abstract = True


class ReportableToIndicatorReportFactory(ReportableFactory):
    content_object = factory.SubFactory('core.factories.IndicatorReportFactory')

    class Meta:
        model = Reportable


class ReportableToClusterActivityFactory(ReportableFactory):
    content_object = factory.SubFactory('core.factories.ClusterActivityFactory')

    class Meta:
        model = Reportable


class ReportableToPartnerActivityFactory(ReportableFactory):
    content_object = factory.SubFactory('core.factories.PartnerActivityFactory')

    class Meta:
        model = Reportable


class IndicatorDisaggregationFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "indicator_disaggregation_%d" % n)
    indicator = factory.SubFactory(ReportableToPartnerActivityFactory)

    class Meta:
        model = IndicatorDisaggregation


class IndicatorDataSpecificationFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "indicator_data_specification_%d" % n)
    indicator = factory.SubFactory(ReportableToPartnerActivityFactory)

    class Meta:
        model = IndicatorDataSpecification


class LocationFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "location_%d" % n)
    reportable = factory.SubFactory(ReportableToPartnerActivityFactory)

    class Meta:
        model = Location


class IndicatorReportFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "indicator_report_%d" % n)
    location = factory.SubFactory(LocationFactory)
    reportable = factory.SubFactory(ReportableToPartnerActivityFactory)

    class Meta:
        model = IndicatorReport


class ProgressReportFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ProgressReport


class ProgrammeDocumentFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "programme_document_%d" % n)

    class Meta:
        model = ProgrammeDocument


class CountryProgrammeOutputFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "country_programme_%d" % n)
    programme_document = factory.SubFactory(ProgrammeDocumentFactory)

    class Meta:
        model = CountryProgrammeOutput


class LowerLevelOutputFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "lower_level_output_%d" % n)
    indicator = factory.SubFactory(CountryProgrammeOutputFactory)

    class Meta:
        model = LowerLevelOutput
