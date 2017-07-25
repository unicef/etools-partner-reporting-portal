from django.conf import settings

from account.models import User
from cluster.models import Cluster, ClusterObjective, ClusterActivity
from partner.models import (
    Partner,
    PartnerProject,
    PartnerActivity,
)
from indicator.models import (
    IndicatorBlueprint,
    Reportable,
    IndicatorReport,
    IndicatorLocationData,
    Disaggregation,
    DisaggregationValue,
)
from unicef.models import (
    ProgressReport,
    Section,
    ProgrammeDocument,
    CountryProgrammeOutput,
    LowerLevelOutput,
)
from core.models import (
    Intervention,
    ResponsePlan,
    Location,
)
from core.factories import (
    UserFactory,
    PartnerFactory,
    IndicatorLocationDataFactory,
    InterventionFactory,
    ResponsePlanFactory,
    LocationFactory,
    QuantityReportableToLowerLevelOutputFactory,
    RatioReportableToLowerLevelOutputFactory,
    RatioReportableToClusterObjectiveFactory,
    QuantityReportableToPartnerProjectFactory,
    QuantityReportableToClusterObjectiveFactory,
    QuantityReportableToPartnerActivityFactory,
    QuantityIndicatorReportFactory,
    RatioIndicatorReportFactory,
    ProgressReportFactory,
    SectionFactory,
    ProgrammeDocumentFactory,
    ClusterObjectiveFactory,
    ClusterActivityFactory,
    ClusterFactory,
    DisaggregationFactory,
    DisaggregationValueFactory,
)

from _generate_disaggregation_fake_data import (
    generate_indicator_report_location_disaggregation_quantity_data,
    generate_indicator_report_location_disaggregation_ratio_data,
)


def clean_up_data():
    if settings.ENV == 'dev':
        print "Deleting all ORM objects"

        User.objects.all().delete()
        Cluster.objects.all().delete()
        ClusterObjective.objects.all().delete()
        ClusterActivity.objects.all().delete()
        Partner.objects.all().delete()
        PartnerProject.objects.all().delete()
        PartnerActivity.objects.all().delete()
        IndicatorBlueprint.objects.all().delete()
        Reportable.objects.all().delete()
        IndicatorReport.objects.all().delete()
        IndicatorLocationData.objects.all().delete()
        ProgressReport.objects.all().delete()
        ProgrammeDocument.objects.all().delete()
        CountryProgrammeOutput.objects.all().delete()
        LowerLevelOutput.objects.all().delete()
        Intervention.objects.all().delete()
        Location.objects.all().delete()
        Disaggregation.objects.all().delete()
        DisaggregationValue.objects.all().delete()

        print "All ORM objects deleted"


def generate_fake_data(quantity=40):
    if quantity < 40:
        quantity = 40

    admin, created = User.objects.get_or_create(username='admin', defaults={
        'email': 'admin@unicef.org',
        'is_superuser': True,
        'is_staff': True,
        'organization': 'Tivix'
    })
    admin.set_password('Passw0rd!')
    admin.save()
    print "Superuser created:{}/{}".format(admin.username, 'Passw0rd!')

    UserFactory.create_batch(quantity)
    print "{} User objects created".format(quantity)

    print "{} Partner objects created".format(quantity)

    SectionFactory.create_batch(quantity)
    print "{} Section objects created".format(quantity)

    ProgrammeDocumentFactory.create_batch(quantity)
    print "{} ProgrammeDocument objects created".format(quantity)

    # Linking the followings:
    # ProgressReport - ProgrammeDocument
    # created LowerLevelOutput - QuantityReportableToLowerLevelOutput
    # Section - ProgrammeDocument via QuantityReportableToLowerLevelOutput
    # ProgressReport - IndicatorReport from QuantityReportableToLowerLevelOutput
    for idx in xrange(quantity):
        pd = ProgrammeDocument.objects.all()[idx]
        progress_report = ProgressReportFactory(programme_document=pd)
        llo = LowerLevelOutput.objects.all()[idx]

        if idx < 20:
            reportable = QuantityReportableToLowerLevelOutputFactory(
                content_object=llo, indicator_report__progress_report=None)

        else:
            reportable = RatioReportableToLowerLevelOutputFactory(
                content_object=llo, indicator_report__progress_report=None)

        reportable.content_object \
            .indicator.programme_document.sections.add(
                Section.objects.all()[idx])

        indicator_report = reportable.indicator_reports.first()
        indicator_report.progress_report = progress_report
        indicator_report.save()

    print "{} ProgrammeDocument <-> QuantityReportableToLowerLevelOutput <-> IndicatorReport objects linked".format(quantity)

    # Intervention creates Cluster and Locations
    InterventionFactory.create_batch(
        quantity, locations=Location.objects.all())
    print "{} Intervention objects created".format(quantity)

    for intervention in Intervention.objects.all():
        for idx in xrange(3):
            ResponsePlanFactory(intervention=intervention)
    print "{} ResponsePlan objects created".format(quantity*3)

    # Linking ClusterActivity - PartnerActivity
    ClusterActivityFactory.create_batch(quantity)
    print "{} ClusterActivity objects created".format(quantity)

    for idx in xrange(quantity):
        cluster_activity = ClusterActivity.objects.all()[idx]
        PartnerFactory(partner_activity__cluster_activity=cluster_activity)
    print "{} ClusterActivity <-> PartnerActivity objects linked".format(quantity)

    # Cluster Indicator creations
    for idx in xrange(quantity):
        pp = PartnerProject.objects.all()[idx]
        co = ClusterObjective.objects.all()[idx]
        pa = PartnerActivity.objects.all()[idx]

        reportable_to_pp = QuantityReportableToPartnerProjectFactory(
            content_object=pp, indicator_report__progress_report=None
        )

        reportable_to_co = QuantityReportableToClusterObjectiveFactory(
            content_object=co, indicator_report__progress_report=None
        )

        reportable_to_pa = QuantityReportableToPartnerActivityFactory(
            content_object=pa, indicator_report__progress_report=None
        )

        # TODO: Add Ratio typed cluster indicators

    print "{} Cluster objects <-> QuantityReportable objects linked".format(quantity)

    print "Generating IndicatorLocationData for Quantity type"
    generate_indicator_report_location_disaggregation_quantity_data()

    print "Generating IndicatorLocationData for Ratio type"
    generate_indicator_report_location_disaggregation_ratio_data()

    admin.partner_id = Partner.objects.first().id
    admin.save()
