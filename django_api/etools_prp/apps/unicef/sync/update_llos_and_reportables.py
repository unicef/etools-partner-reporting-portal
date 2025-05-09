from etools_prp.apps.indicator.models import Reportable, ReportableLocationGoal
from etools_prp.apps.unicef.models import LowerLevelOutput, ProgrammeDocument


def update_llos_and_reportables(pd: ProgrammeDocument):
    llos = LowerLevelOutput.objects.filter(cp_output__programme_document=pd)

    # Mark all LLO/reportables assigned to this PD as inactive
    llos.update(active=False)

    Reportable.objects.filter(lower_level_outputs__in=llos).update(active=False)

    # Mark all ReportableLocationGoal instances referred in LLO Reportables as inactive
    ReportableLocationGoal.objects.filter(reportable__lower_level_outputs__in=llos).update(is_active=False)
