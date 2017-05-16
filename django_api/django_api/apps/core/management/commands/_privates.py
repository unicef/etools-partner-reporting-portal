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
    ProgrammeDocument,
    CountryProgrammeOutput,
    LowerLevelOutput,
)


def clean_up_data():
    if settings['ENV'] == 'dev':
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
        IndicatorDisaggregation.objects.all().delete()
        IndicatorDataSpecification.objects.all().delete()
        IndicatorReport.objects.all().delete()
        ProgressReport.objects.all().delete()
        ProgrammeDocument.objects.all().delete()
        CountryProgrammeOutput.objects.all().delete()
        LowerLevelOutput.objects.all().delete()
