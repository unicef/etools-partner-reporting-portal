from typing import Any

from etools_prp.apps.core.models import Workspace
from etools_prp.apps.unicef.models import ProgrammeDocument, ReportingPeriodDates
from etools_prp.apps.unicef.serializers import PMPReportingPeriodDatesSerializer, PMPReportingPeriodDatesSRSerializer
from etools_prp.apps.unicef.sync.utils import process_model


def update_create_qpr_n_hr_date_periods(item: Any, pd: ProgrammeDocument, workspace: Workspace) -> Any:

    reporting_requirements = item['reporting_requirements']
    for reporting_requirement in reporting_requirements:
        reporting_requirement['programme_document'] = pd.id
        reporting_requirement['external_business_area_code'] = workspace.business_area_code
        process_model(
            ReportingPeriodDates,
            PMPReportingPeriodDatesSerializer,
            reporting_requirement,
            {
                'external_id': reporting_requirement['id'],
                'report_type': reporting_requirement['report_type'],
                'programme_document': pd.id,
                'external_business_area_code': workspace.business_area_code,
            },
        )

    return item


def update_create_sr_date_periods(item: Any, pd: ProgrammeDocument, workspace: Workspace) -> Any:

    special_reports = item['special_reports'] if 'special_reports' in item else []
    for special_report in special_reports:
        special_report['programme_document'] = pd.id
        special_report['report_type'] = 'SR'
        special_report['external_business_area_code'] = workspace.business_area_code
        process_model(
            ReportingPeriodDates,
            PMPReportingPeriodDatesSRSerializer,
            special_report,
            {
                'external_id': special_report['id'],
                'report_type': 'SR',
                'programme_document': pd.id,
                'external_business_area_code': workspace.business_area_code,
            },
        )

    return item
