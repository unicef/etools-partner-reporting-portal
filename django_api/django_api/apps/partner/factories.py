from django.contrib.auth.models import Group

import factory
from factory import fuzzy

from account.factories import UserFactory
from core.factories import LocationFactory
from cluster.factories import ClusterFactory
from indicator.factories import ReportableFactory

from partner.models import (
    Partner,
    PartnerProject,
    PartnerActivity,
)


class PartnerFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "partner_%d" % n)
    user = factory.RelatedFactory(UserFactory, 'partner')
    partner_project = factory.RelatedFactory(PartnerProjectFactory, 'partner')
    activity = factory.RelatedFactory(PartnerActivityFactory, 'partner')

    @factory.post_generation
    def cluster(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for cluster in extracted:
                self.cluster.add(cluster)

    class Meta:
        model = Partner


class PartnerProjectFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "partner_project_%d" % n)
    activity = factory.RelatedFactory(PartnerActivity, 'project')
    reportable = factory.SubFactory(ReportableFactory, 'project')

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


class PartnerActivityFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "partner_activity_%d" % n)

    class Meta:
        model = PartnerActivity
