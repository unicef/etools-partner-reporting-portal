from typing import Any, Dict, List, Optional

from etools_prp.apps.pdf_reports.base_report import BaseReport
from etools_prp.apps.pdf_reports.report_builder import ReportBuilder


class IndicatorsReport(BaseReport):
    def __init__(
        self,
        data: Dict[str, Any],
        filename: Optional[str] = None,
        landscape: bool = True,
        logo_path: Optional[str] = None,
    ) -> None:
        super().__init__(filename=filename, landscape=landscape, logo_path=logo_path)
        self.data = data
        if filename is None and data.get("title"):
            safe_title = (data["title"] or "indicators")[:80].replace("/", "-")
            self.filename = f"{safe_title}.pdf"

    def build_elements(self) -> List[Any]:
        """Build report structure from self.data via ReportBuilder.from_context (title + tables)."""
        return ReportBuilder.from_context(self.data)

    def build_response(self, stream: bool = True):
        elements = self.build_elements()
        return super().build_response(elements, stream=stream)
