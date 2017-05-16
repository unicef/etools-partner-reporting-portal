from django.contrib.auth.models import Group

import factory
from factory import fuzzy

from partner.factories import PartnerActivityFactory
from indicator.factories import IndicatorBlueprint, ReportableFactory

from cluster.models import Cluster, ClusterObjective, ClusterActivity


class ClusterFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "cluster_%d" % n)
    intervention = factory.SubFactory(InterventionFactory)
    user = factory.SubFactory(UserFactory)
    objective = factory.RelatedFactory(ClusterObjectiveFactory, 'cluster')

    class Meta:
        model = Cluster


class ClusterObjectiveFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "cluster_objective_%d" % n)
    activity = factory.RelatedFactory(ClusterActivityFactory, 'cluster_objective')
    reportable = factory.RelatedFactory(ReportableFactory, 'objective')

    class Meta:
        model = ClusterObjective


class ClusterActivityFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "cluster_activity_%d" % n)
    indicator_blueprint = factory.RelatedFactory(IndicatorBlueprintFactory, 'cluster_activity')
    partner_activity = factory.RelatedFactory(PartnerActivityFactory, 'cluster_activity')

    class Meta:
        model = ClusterActivity
