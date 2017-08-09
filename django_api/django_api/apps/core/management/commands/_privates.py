from django.conf import settings

from account.models import (
    User,
    UserProfile,
)
from cluster.models import (
    Cluster,
    ClusterObjective,
    ClusterActivity,
)
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
    Section,
    ProgrammeDocument,
    ProgressReport,
    CountryProgrammeOutput,
    LowerLevelOutput,
)
from core.models import (
    Intervention,
    ResponsePlan,
    Location,
)
from core.factories import (
    QuantityReportableToLowerLevelOutputFactory,
    RatioReportableToLowerLevelOutputFactory,
    RatioReportableToClusterObjectiveFactory,
    QuantityReportableToPartnerProjectFactory,
    QuantityReportableToClusterObjectiveFactory,
    QuantityReportableToPartnerActivityFactory,
    QuantityIndicatorReportFactory,
    RatioIndicatorReportFactory,
    QuantityTypeIndicatorBlueprintFactory,
    RatioTypeIndicatorBlueprintFactory,
    UserFactory,
    UserProfileFactory,
    ClusterFactory,
    ClusterObjectiveFactory,
    ClusterActivityFactory,
    PartnerFactory,
    PartnerProjectFactory,
    PartnerActivityFactory,
    IndicatorLocationDataFactory,
    DisaggregationFactory,
    DisaggregationValueFactory,
    SectionFactory,
    ProgrammeDocumentFactory,
    ProgressReportFactory,
    CountryProgrammeOutputFactory,
    LowerLevelOutputFactory,
    InterventionFactory,
    ResponsePlanFactory,
    LocationFactory,
)

from _generate_disaggregation_fake_data import (
    generate_indicator_report_location_disaggregation_quantity_data,
    generate_indicator_report_location_disaggregation_ratio_data,
)


def clean_up_data():
    if settings.ENV == 'dev':
        print "Deleting all ORM objects"

        User.objects.all().delete()
        UserProfile.objects.all().delete()
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
        Disaggregation.objects.all().delete()
        DisaggregationValue.objects.all().delete()
        Section.objects.all().delete()
        ProgrammeDocument.objects.all().delete()
        ProgressReport.objects.all().delete()
        CountryProgrammeOutput.objects.all().delete()
        LowerLevelOutput.objects.all().delete()
        Intervention.objects.all().delete()
        ResponsePlan.objects.all().delete()
        Location.objects.all().delete()

        print "All ORM objects deleted"


def generate_fake_data(quantity=40):
    if not settings.IS_TEST and quantity < 40:
        quantity = 40

    admin, created = User.objects.get_or_create(username='admin', defaults={
        'email': 'admin@unicef.org',
        'is_superuser': True,
        'is_staff': True,
        'organization': 'Tivix'
    })
    admin.set_password('Passw0rd!')
    admin.save()
    print "Superuser created: {}/{}".format(admin.username, 'Passw0rd!')

    SectionFactory.create_batch(quantity)
    print "{} Section objects created".format(quantity)

    ProgrammeDocumentFactory.create_batch(quantity)
    print "{} ProgrammeDocument objects created".format(quantity)

    # Linking the followings:
    # ProgressReport - ProgrammeDocument
    # created LowerLevelOutput - QuantityReportableToLowerLevelOutput
    # Section - ProgrammeDocument via QuantityReportableToLowerLevelOutput
    # ProgressReport - IndicatorReport from
    # QuantityReportableToLowerLevelOutput
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

    # Creating ClusterActivity objects
    # Which creates ClusterObjective, its Cluster,
    # ResponsePlan and Intervention
    ClusterActivityFactory.create_batch(quantity)
    print "{} ClusterActivity objects created".format(quantity)
    print "{} ClusterObjective objects created".format(quantity)
    print "{} Cluster objects created".format(quantity)
    print "{} ResponsePlan objects created".format(quantity)
    print "{} Intervention objects created".format(quantity)
    print "{} User objects created".format(quantity)

    # Intervention <-> Locations
    for intervention in Intervention.objects.all():
        intervention.locations.add(*list(Location.objects.all()))
    print "{} Intervention objects linked to Locations".format(quantity)

    # Extra ResponsePlan creation
    # Intervention <-> ResponsePlan <-> Cluster
    for idx in xrange(quantity):
        intervention = Intervention.objects.all()[idx]

        for _ in xrange(3):
            response_plan = ResponsePlanFactory(intervention=intervention)

            cluster = ClusterFactory()
            cluster.response_plan = response_plan
            cluster.save()

    print "{} Extra ResponsePlan & Cluster objects created".format(quantity * 3)

    for cluster in Cluster.objects.all():
        for _ in xrange(3):
            objective = ClusterObjectiveFactory(cluster=cluster)
            activity = ClusterActivityFactory(cluster_objective=objective)

    print "{} Extra Cluster objective and activity objects created".format(quantity * 3)

    # Creating PartnerActivity from ClusterActivity
    for cluster in Cluster.objects.all():
        partner = PartnerFactory(partner_activity=None, partner_project=None)

        for objective in cluster.cluster_objectives.all():
            project = PartnerProjectFactory(partner=partner)
            project.clusters.add(cluster)

            for activity in objective.cluster_activities.all():
                partner_activity = PartnerActivityFactory(
                    project=project,
                    partner=project.partner,
                    cluster_activity=activity)

    print "{} Partner & PartnerProject & PartnerActivity from ClusterActivity objects created".format(quantity * 3)

    # Creating PartnerActivity from Custom activity
    for partner in Partner.objects.all():
        for _ in xrange(3):
            project = PartnerProjectFactory(partner=partner)
            partner_activity = PartnerActivityFactory(
                project=project,
                partner=project.partner,
            )

    print "{} Partner & PartnerProject & PartnerActivity from Custom activity objects created".format(quantity * 3)

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
