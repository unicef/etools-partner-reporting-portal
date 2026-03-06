from etools_prp.apps.indicator.models import Reportable, ReportableLocationGoal
from etools_prp.apps.unicef.models import LowerLevelOutput, ProgrammeDocument


def update_llos_and_reportables(pd: ProgrammeDocument):
    llos = LowerLevelOutput.objects.filter(cp_output__programme_document=pd)

    # Mark all LLO/reportables assigned to this PD as inactive
    llos.update(active=False)

    syncable_reports = pd.progress_reports.exclude(status='Acc')

    _to_inactivate = Reportable.objects.filter(lower_level_outputs__in=llos, indicator_reports__progress_report__in=syncable_reports, active=True).distinct()
    _to_inactivate.update(active=False)

    # Mark all ReportableLocationGoal instances referred in LLO Reportables as inactive
    ReportableLocationGoal.objects.filter(is_active=True, reportable__in=_to_inactivate).update(is_active=False)
