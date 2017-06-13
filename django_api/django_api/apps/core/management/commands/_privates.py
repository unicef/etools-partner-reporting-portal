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
    Location,
)

from core.factories import (
    UserFactory,
    PartnerFactory,
    IndicatorLocationDataFactory,
    InterventionFactory,
    ReportableToLowerLevelOutputFactory,
    IndicatorReportFactory,
    ProgressReportFactory,
    SectionFactory,
    ProgrammeDocumentFactory,
    DisaggregationFactory,
    DisaggregationValueFactory,
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

        IndicatorLocationDataFactory(indicator_report=indicator_report, location=reportable.locations.first(), disaggregation_reported_on=list(reportable.disaggregation.values_list('id', flat=True)))
    print "{} ProgrammeDocument <-> ReportableToLowerLevelOutput <-> IndicatorReport objects linked".format(quantity)

    # Intervention creates Cluster and Locations
    InterventionFactory.create_batch(quantity, locations=Location.objects.all())
    print "{} Intervention objects created".format(quantity)

    # Linking ClusterActivity - PartnerActivity
    for idx in xrange(quantity):
        cluster_activity = ClusterActivity.objects.all()[idx]
        PartnerFactory(partner_activity__cluster_activity=cluster_activity)
    print "{} ClusterActivity <-> PartnerActivity objects linked".format(quantity)

    # Adding extra IndicatorReport to each ReportableToLowerLevelOutput
    locations = Location.objects.all()

    sample_disaggregation_value_map = {
        "height": ["tall", "medium", "short", "extrashort"],
        "age": ["1-2m", "3-5m", "6-10m"],
        "gender": ["male", "female", "other"],
    }

    for idx, reportable in enumerate(Reportable.objects.filter(lower_level_outputs__reportables__isnull=False)):
        # Disaggregation generation
        for disaggregation_title in ["height", "age", "gender"]:
            disaggregation = DisaggregationFactory(name=disaggregation_title, reportable=reportable)

            for value in sample_disaggregation_value_map[disaggregation_title]:
                disaggregation_value = DisaggregationValueFactory(value=value, disaggregation=disaggregation)

            print "Disaggregation (and DisaggregationValue) objects for ReportableToLowerLevelOutput {} created".format(idx)

        # -- Extra IndicatorReport and IndicatorLocationReport --
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
                    IndicatorLocationDataFactory(indicator_report=indicator_report, location=location, disaggregation_reported_on=list(reportable.disaggregation.values_list('id', flat=True)))

        # -- Extra IndicatorReport and IndicatorLocationReport --

    print "{} ReportableToLowerLevelOutput objects created".format(quantity)
    print "{} ProgressReport objects created".format(quantity)
    print "{} IndicatorLocationData objects created".format(quantity)
