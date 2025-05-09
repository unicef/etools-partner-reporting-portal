from etools_prp.apps.core.models import Location
from etools_prp.apps.indicator.models import Reportable, ReportableLocationGoal


def update_create_reportable_location_goals(reportable: Reportable, locations: list):
    rlgs = ReportableLocationGoal.objects.filter(reportable=reportable)

    # If the locations for this reportable has been created before
    if rlgs.exists():
        existing_locs = set(rlgs.values_list('location', flat=True))
        new_locs = set(map(lambda x: x.id, locations)) - existing_locs

        # Creating M2M Through model instances for new locations
        reportable_location_goals = [
            ReportableLocationGoal(
                reportable=reportable,
                location=loc,
                is_active=True,
            ) for loc in Location.objects.filter(id__in=new_locs)
        ]
    else:
        # Creating M2M Through model instances
        reportable_location_goals = [
            ReportableLocationGoal(
                reportable=reportable,
                location=loc,
                is_active=True,
            ) for loc in locations
        ]

    ReportableLocationGoal.objects.bulk_create(reportable_location_goals)

    ReportableLocationGoal.objects.filter(reportable=reportable, location__in=locations).update(is_active=True)
