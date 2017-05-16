from django.contrib.auth.models import Group

import factory
from factory import fuzzy

from core.factories import LocationFactory

from indicator.models import (
    IndicatorBlueprint,
    Reportable,
    IndicatorDisaggregation,
    IndicatorDataSpecification,
    IndicatorReport,
)


class IndicatorBlueprintFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "indicator_blueprint_%d" % n)
    reportable = factory.RelatedFactory(ReportableFactory, 'blueprint')

    class Meta:
        model = IndicatorBlueprint


class ReportableFactory(factory.django.DjangoModelFactory):
    location = factory.RelatedFactory(LocationFactory, 'reportable')
    indicator_disaggregation = factory.RelatedFactory(IndicatorDisaggregation, 'indicator')
    indicator_data_specification = factory.RelatedFactory(IndicatorDataSpecification, 'indicator')
    indicator_report = factory.RelatedFactory(IndicatorReport, 'reportable')

    class Meta:
        model = Reportable


class IndicatorDisaggregationFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "indicator_disaggregation_%d" % n)

    class Meta:
        model = IndicatorDisaggregation


class IndicatorDataSpecificationFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "indicator_data_specification_%d" % n)

    class Meta:
        model = IndicatorDataSpecification


class IndicatorReportFactory(factory.django.DjangoModelFactory):
    title = factory.Sequence(lambda n: "indicator_report_%d" % n)

    class Meta:
        model = IndicatorReport
