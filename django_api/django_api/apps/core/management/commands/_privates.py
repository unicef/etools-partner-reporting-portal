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
    IndicatorDisaggregation,
    IndicatorDataSpecification,
    IndicatorReport,
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
    ReportableToLowerLevelOutputFactory,
    IndicatorDisaggregationFactory,
    IndicatorDataSpecificationFactory,
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
        IndicatorDisaggregation.objects.all().delete()
        IndicatorDataSpecification.objects.all().delete()
        IndicatorReport.objects.all().delete()
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

    ClusterFactory.create_batch(quantity)
    print "{} Cluster objects created".format(quantity)

    ClusterObjectiveFactory.create_batch(quantity)
    print "{} ClusterObjective objects created".format(quantity)

    ClusterActivityFactory.create_batch(quantity)
    print "{} ClusterActivity objects created".format(quantity)

    PartnerFactory.create_batch(quantity)
    print "{} Partner objects created".format(quantity)

    PartnerProjectFactory.create_batch(quantity)
    print "{} PartnerProject objects created".format(quantity)

    PartnerActivityFactory.create_batch(quantity)
    print "{} PartnerActivity objects created".format(quantity)

    IndicatorBlueprintFactory.create_batch(quantity)
    print "{} IndicatorBlueprint objects created".format(quantity)

    ReportableToLowerLevelOutputFactory.create_batch(quantity)
    print "{} ReportableToLowerLevelOutput objects created".format(quantity)

    IndicatorDisaggregationFactory.create_batch(quantity)
    print "{} IndicatorDisaggregation objects created".format(quantity)

    IndicatorDataSpecificationFactory.create_batch(quantity)
    print "{} IndicatorDataSpecification objects created".format(quantity)

    ProgressReportFactory.create_batch(quantity)
    print "{} ProgressReport objects created".format(quantity)

    SectionFactory.create_batch(quantity)
    print "{} Section objects created".format(quantity)

    # TODO: more sens for IndicatorReport objects - important logic exist with frequency of PD
    # IndicatorReport will create LowerLevelOutput, CountryProgrammeOutput, and ProgrammeDocument automatically
    IndicatorReportFactory.create_batch(quantity)
    print "{} IndicatorReport objects created".format(quantity)

    for idx in xrange(quantity):
        indicator_report = IndicatorReport.objects.all()[idx]
        pd = indicator_report.reportable.content_object.indicator.programme_document

        pd.sections.add(Section.objects.all()[idx])

        inter = Intervention.objects.all()[idx]
        inter.locations.add(Location.objects.all()[idx])
