from django.core.management.base import BaseCommand

from _privates import clean_up_data

from core.factories import (
    UserFactory,
    UserProfileFactory,
    ClusterFactory,
    ClusterObjectiveFactory,
    ClusterActivityFactory,
    PartnerFactory,
    PartnerProjectFactory,
    PartnerActivityFactory,
    IndicatorBlueprintFactory,
    ReportableFactory,
    IndicatorDisaggregationFactory,
    IndicatorDataSpecificationFactory,
    IndicatorReportFactory,
    ProgressReportFactory,
    ProgrammeDocumentFactory,
    CountryProgrammeOutputFactory,
    LowerLevelOutputFactory,
)


class Command(BaseCommand):
    help = 'Creates a set of ORM objects for initial data'

    def add_arguments(self, parser):
        parser.add_arguments('clean_before', nargs='+', type=bool)

    def handle(self, *args, **options):
        if 'clean_before' in options:
            clean_up_data()

        UserFactory.create_batch(3)
        UserProfileFactory.create_batch(3)
        ClusterFactory.create_batch(3)
        ClusterObjectiveFactory.create_batch(3)
        ClusterActivityFactory.create_batch(3)
        PartnerFactory.create_batch(3)
        PartnerProjectFactory.create_batch(3)
        PartnerActivityFactory.create_batch(3)
        IndicatorBlueprintFactory.create_batch(3)
        ReportableToIndicatorReportFactory.create_batch(3)
        ReportableToClusterActivityFactory.create_batch(3)
        ReportableToPartnerActivityFactory.create_batch(3)
        IndicatorDisaggregationFactory.create_batch(3)
        IndicatorDataSpecificationFactory.create_batch(3)
        IndicatorReportFactory.create_batch(3)
        ProgressReportFactory.create_batch(3)
        ProgrammeDocumentFactory.create_batch(3)
        CountryProgrammeOutputFactory.create_batch(3)
        LowerLevelOutputFactory.create_batch(3)
