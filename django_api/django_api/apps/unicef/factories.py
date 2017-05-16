from django.contrib.auth.models import Group

import factory
from factory import fuzzy

from core.factories import LocationFactory
from cluster.factories import ClusterFactory
from indicator.factories import ReportableFactory, IndicatorReportFactory

from unicef.models import (
    ProgressReport,
    ProgrammeDocument,
    CountryProgrammeOutput,
    LowerLevelOutput,
)


class ProgressReportFactory(factory.django.DjangoModelFactory):
    indicator_report = factory.RelatedFactory(IndicatorReportFactory, 'progress_report')

    class Meta:
        model = ProgressReport


class ProgrammeDocumentFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "programme_document_%d" % n)
    country_programme = factory.RelatedFactory(CountryProgrammeOutputFactory, 'programme_document')

    class Meta:
        model = ProgrammeDocument


class CountryProgrammeOutputFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "country_programme_%d" % n)
    lower_level_output = factory.RelatedFactory(LowerLevelOutputFactory, 'indicator')

    class Meta:
        model = CountryProgrammeOutput


class LowerLevelOutputFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "lower_level_output_%d" % n)

    class Meta:
        model = LowerLevelOutput
