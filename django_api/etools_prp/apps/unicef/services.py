import logging
from typing import Dict, List, Tuple

from django.db.models import QuerySet
from django.http import Http404

from rest_framework.exceptions import ValidationError

from etools_prp.apps.indicator.disaggregators import QuantityIndicatorDisaggregator, RatioIndicatorDisaggregator
from etools_prp.apps.indicator.models import IndicatorBlueprint, IndicatorLocationData, IndicatorReport
from etools_prp.apps.indicator.utilities import convert_string_number_to_float
from etools_prp.apps.unicef.models import LowerLevelOutput, ProgressReport

logger = logging.getLogger(__name__)


class ProgressReportHFDataService:
    """
    Service class for handling High Frequency data operations for Progress Reports.

    This service encapsulates all business logic related to pulling and processing
    high frequency data from HR reports into QPR reports.
    """

    @staticmethod
    def get_progress_report(workspace_id: int, report_id: int) -> ProgressReport:
        """
        Retrieve a ProgressReport by workspace and report ID.
        Args:
            workspace_id: ID of the workspace
            report_id: ID of the progress report
        Returns:
            ProgressReport instance
        Raises:
            Http404: If the report doesn't exist
        """
        try:
            return ProgressReport.objects.select_related('programme_document').get(
                programme_document__workspace=workspace_id,
                pk=report_id,
            )
        except ProgressReport.DoesNotExist as exp:
            logger.exception(
                "ProgressReport not found",
                extra={
                    "workspace_id": workspace_id,
                    "report_id": report_id,
                    "exception": str(exp),
                }
            )
            raise Http404(f"ProgressReport with id {report_id} not found")

    @staticmethod
    def validate_and_get_hf_reports(
            progress_report: ProgressReport,
            indicator_report_id: int
    ) -> Tuple[IndicatorReport, QuerySet[ProgressReport]]:
        """
        Validate the request and get related HF reports.
        Args:
            progress_report: The target QPR progress report
            indicator_report_id: ID of the indicator report to process
        Returns:
            Tuple of (indicator_report, hf_reports)
        Raises:
            ValidationError: For various validation failures
        """
        # Validate report type
        if progress_report.report_type != "QPR":
            raise ValidationError("This Progress Report is not QPR type.")

        # Get and validate indicator report
        try:
            indicator_report = IndicatorReport.objects.select_related(
                'reportable__blueprint'
            ).get(id=indicator_report_id)
        except IndicatorReport.DoesNotExist:
            raise ValidationError("Specified IndicatorReport does not exist.")

        # Validate reportable type
        if not isinstance(indicator_report.reportable.content_object, LowerLevelOutput):
            raise ValidationError("Operation only allowed for Lower Level Output reportables.")

        # Validate programme document alignment
        pd_from_reportable = indicator_report.reportable.content_object.cp_output.programme_document
        if progress_report.programme_document != pd_from_reportable:
            raise ValidationError("Reportable does not belong to the specified progress report.")

        # Get related HF reports
        hf_reports = ProgressReport.objects.filter(
            programme_document=progress_report.programme_document,
            report_type="HR",
            start_date__gte=progress_report.start_date,
            end_date__lte=progress_report.end_date,
        ).prefetch_related('indicator_reports')

        # Validate HF reports exist for this indicator
        target_hf_irs = IndicatorReport.objects.filter(
            id__in=hf_reports.values_list('indicator_reports', flat=True),
            time_period_start__gte=progress_report.start_date,
            time_period_end__lte=progress_report.end_date,
            reportable=indicator_report.reportable,
        )

        if not target_hf_irs.exists():
            raise ValidationError("This HR indicator does not have any High frequency reports within this QPR period.")

        return indicator_report, hf_reports

    @staticmethod
    def calculate_location_totals(
            indicator_report: IndicatorReport,
            hf_reports: QuerySet[ProgressReport],
            location_ids: List[int],
            progress_report: ProgressReport
    ) -> Dict[int, Dict[str, Dict]]:
        """
        Calculate consolidated location totals from HF reports.
        Args:
            indicator_report: The target indicator report
            hf_reports: Related HF progress reports
            location_ids: List of location IDs to process
            progress_report: The target QPR progress report
        Returns:
            Dictionary mapping location IDs to their consolidated data
        """
        # Get relevant indicator reports and location data
        ir_ids = hf_reports.values_list('indicator_reports', flat=True)
        target_hf_irs = IndicatorReport.objects.filter(
            id__in=ir_ids,
            time_period_start__gte=progress_report.start_date,
            time_period_end__lte=progress_report.end_date,
            reportable=indicator_report.reportable,
        )
        target_hf_ilds = IndicatorLocationData.objects.filter(
            indicator_report__in=target_hf_irs,
        ).select_related('location')

        # Initialize result structure
        calculated = {
            loc_id: {
                'total': {'c': 0, 'd': 0, 'v': 0},
                'data': {}
            }
            for loc_id in location_ids
        }

        # Process each location
        for loc_id in location_ids:
            location_data = target_hf_ilds.filter(location_id=loc_id) \
                .exclude(disaggregation={'()': {'c': 0, 'd': 0, 'v': 0}})

            if not location_data.exists():
                continue

            first_data = location_data.first()
            target_disaggregation_reported_on = sorted(first_data.disaggregation_reported_on)
            all_empty = all(not dr for dr in location_data.values_list('disaggregation_reported_on', flat=True))
            all_matched = all(
                sorted(dr) == target_disaggregation_reported_on
                for dr in location_data.values_list('disaggregation_reported_on', flat=True)
            )

            if all_empty or not all_matched:
                calculated[loc_id] = ProgressReportHFDataService._calculate_simple_totals(
                    location_data,
                    indicator_report,
                    calculated[loc_id]
                )
            else:
                calculated[loc_id] = ProgressReportHFDataService._calculate_disaggregated_totals(
                    location_data,
                    indicator_report,
                    first_data.disaggregation.keys(),
                    calculated[loc_id]
                )

        return calculated

    @staticmethod
    def _calculate_simple_totals(location_data, indicator_report, result) -> Dict:
        """Calculate totals when disaggregation doesn't match or is empty."""
        for ild in location_data:
            result['total']['v'] += ild.disaggregation['()']['v']

            if indicator_report.reportable.blueprint.unit == IndicatorBlueprint.NUMBER:
                result['total']['d'] = 1
            else:
                result['total']['d'] += ild.disaggregation['()']['d']

        if result['total']['d'] == 0:
            result['total']['c'] = 0
        else:
            result['total']['c'] = convert_string_number_to_float(result['total']['v']) / result['total']['d']

        result['total']['c'] = result['total']['c'] or 0
        return result

    @staticmethod
    def _calculate_disaggregated_totals(location_data, indicator_report, target_keys, result) -> Dict:
        """Calculate totals when disaggregation data is consistent."""
        for ild in location_data:
            if ild.disaggregation['()'] == {'c': 0, 'd': 0, 'v': 0}:
                continue

            for key in target_keys:
                if key not in result['data']:
                    result['data'][key] = {'c': 0, 'd': 0, 'v': 0}

                result['data'][key]['v'] += ild.disaggregation[key]['v']

                if indicator_report.reportable.blueprint.unit == IndicatorBlueprint.NUMBER:
                    result['data'][key]['d'] = 1
                else:
                    result['data'][key]['d'] += ild.disaggregation[key]['d']

                if result['data'][key]['d'] == 0:
                    result['data'][key]['c'] = 0
                else:
                    result['data'][key]['c'] = convert_string_number_to_float(
                        result['data'][key]['v']) / result['data'][key]['d']

                result['data'][key]['c'] = result['data'][key]['c'] or 0

        return result

    @staticmethod
    def update_indicator_data(
            indicator_report: IndicatorReport,
            consolidated_data: Dict[int, Dict[str, Dict]]
    ) -> Dict[str, float]:
        """
        Update indicator location data with consolidated values.
        Args:
            indicator_report: The target indicator report to update
            consolidated_data: Calculated location totals
        Returns:
            Dictionary with the new total values
        Raises:
            ValidationError: If no valid data is available to pull
        """
        data_available = False

        # Update each location data point
        for ild in indicator_report.indicator_location_data.select_related('location').all():
            loc_id = ild.location.id
            data_dict = consolidated_data.get(loc_id, {'total': {'c': 0, 'd': 0, 'v': 0}, 'data': {}})

            if data_dict['data']:
                ild.disaggregation = data_dict['data']
                data_available = True
            else:
                ild.disaggregation = {'()': data_dict['total']}
                if data_dict['total']['v'] > 0:
                    data_available = True

            # Apply appropriate post-processing based on indicator type
            if indicator_report.reportable.blueprint.unit == IndicatorBlueprint.NUMBER:
                QuantityIndicatorDisaggregator.post_process(ild)
            elif indicator_report.reportable.blueprint.unit == IndicatorBlueprint.PERCENTAGE:
                RatioIndicatorDisaggregator.post_process(ild)

            ild.save()

        if not data_available:
            raise ValidationError(
                "This indicator does not have available data to pull. Enter data for HR report on this indicator first.")

        # Recalculate report totals
        if indicator_report.reportable.blueprint.unit == IndicatorBlueprint.NUMBER:
            QuantityIndicatorDisaggregator.calculate_indicator_report_total(indicator_report)
        elif indicator_report.reportable.blueprint.unit == IndicatorBlueprint.PERCENTAGE:
            RatioIndicatorDisaggregator.calculate_indicator_report_total(indicator_report)

        return indicator_report.total
