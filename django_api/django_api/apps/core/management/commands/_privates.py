from django.conf import settings

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
    IndicatorReport,
    IndicatorLocationData,
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
    Location,
)

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
    IndicatorLocationDataFactory,
    InterventionFactory,
    LocationFactory,
    ReportableToLowerLevelOutputFactory,
    IndicatorReportFactory,
    ProgressReportFactory,
    SectionFactory,
    ProgrammeDocumentFactory,
    CountryProgrammeOutputFactory,
    LowerLevelOutputFactory,
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

        print "All ORM objects deleted"


def generate_fake_data(quantity=3):
    admin, created = User.objects.get_or_create(username='admin', defaults={
        'email': 'admin@unicef.org',
        'is_superuser': True,
        'is_staff': True
    })
    admin.set_password('Passw0rd!')
    admin.save()
    print "Superuser created:{}/{}".format(admin.username, 'Passw0rd!')

    UserFactory.create_batch(quantity)
    print "{} User objects created".format(quantity)

    # Intervention creates Cluster and Locations
    InterventionFactory.create_batch(quantity)
    print "{} Intervention objects created".format(quantity)

    # Linking ClusterActivity - PartnerActivity
    for idx in xrange(quantity):
        cluster_activity = ClusterActivity.objects.all()[idx]
        PartnerFactory(partner_activity__cluster_activity=cluster_activity)

    print "{} Partner objects created".format(quantity)

    SectionFactory.create_batch(quantity)
    print "{} Section objects created".format(quantity)

    ProgrammeDocumentFactory.create_batch(quantity)
    print "{} ProgrammeDocument objects created".format(quantity)

    # Linking the followings:
    # created LowerLevelOutput - ReportableToLowerLevelOutput
    # Section - ProgrammeDocument via ReportableToLowerLevelOutput
    # ProgressReport - IndicatorReport from ReportableToLowerLevelOutput
    # IndicatorReport & Location from ReportableToLowerLevelOutput - IndicatorLocationData
    for idx in xrange(quantity):
        llo = LowerLevelOutput.objects.all()[idx]
        reportable = ReportableToLowerLevelOutputFactory(content_object=llo)

        reportable.content_object.indicator.programme_document.sections.add(Section.objects.all()[idx])

        indicator_report = reportable.indicator_reports.first()
        indicator_report.progress_report = ProgressReportFactory()
        indicator_report.save()

        indicator_location_data = IndicatorLocationDataFactory(indicator_report=indicator_report, location=reportable.locations.first())

    # Adding extra IndicatorReport to each ReportableToLowerLevelOutput
    locations = Location.objects.all()

    for reportable in Reportable.objects.filter(lower_level_outputs__reportables__isnull=False):
        if reportable.locations.count() != 0:
            first_reportable_location_id = reportable.locations.first().id

        else:
            first_reportable_location_id = None

        for location_idx in xrange(3):
            if first_reportable_location_id and first_reportable_location_id != locations[idx].id:
                reportable.locations.add(locations[idx])
                reportable.save()

        # Creating extra IndicatorReport object per location in reportable
        for location in reportable.locations.all():
            if first_reportable_location_id and location.id != first_reportable_location_id:
                indicator_report = IndicatorReportFactory(reportable=reportable)
                indicator_report.progress_report = reportable.indicator_reports.first().progress_report
                indicator_report.save()

                for extra_indicator_report_idx in xrange(3):
                    indicator_location_data = IndicatorLocationDataFactory(indicator_report=indicator_report, location=location)

    print "{} ReportableToLowerLevelOutput objects created".format(quantity)
    print "{} ProgressReport objects created".format(quantity)
    print "{} IndicatorLocationData objects created".format(quantity)
