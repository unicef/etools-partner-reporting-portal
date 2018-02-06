from collections import defaultdict

from unicef.models import LowerLevelOutput


def group_indicator_reports_by_lower_level_output(indicator_reports):
    results = defaultdict(list)
    for ir in indicator_reports:
        if type(ir.reportable.content_object) == LowerLevelOutput:
            results[ir.reportable.content_object.id].append(ir)

    return [
        results[key] for key in sorted(results.keys())
    ]
