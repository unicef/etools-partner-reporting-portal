from django.contrib.auth.models import Group

import factory
from factory import fuzzy

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
    cluster = factory.SubFactory(ClusterFactory)
    partner_project = factory.RelatedFactory(PartnerProjectFactory, 'partner')
    activity = factory.RelatedFactory(PartnerActivityFactory, 'partner')

    class Meta:
        model = Partner


class PartnerProjectFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "partner_project_%d" % n)
    cluster = factory.SubFactory(ClusterFactory)
    location = factory.SubFactory(LocationFactory)
    activity = factory.RelatedFactory(PartnerActivity, 'project')
    reportable = factory.SubFactory(ReportableFactory, 'project')

    class Meta:
        model = PartnerProject


class PartnerActivityFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "partner_activity_%d" % n)

    class Meta:
        model = PartnerActivity
