from django.contrib.auth.models import Group

import factory
from factory import fuzzy

from indicator.factories import IndicatorReportFactory

from core.models import Intervention, Location


class InterventionFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "intervention_%d" % n)

    class Meta:
        model = Intervention


class LocationFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "location_%d" % n)
    indicator_report = factory.RelatedFactory(IndicatorReportFactory, 'location')

    class Meta:
        model = Location
