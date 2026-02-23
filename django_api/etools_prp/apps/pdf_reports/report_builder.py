from typing import Any, List, Optional

from etools_prp.apps.pdf_reports.components import (
    Container,
    SpacerComponent,
    TableComponent,
    Text,
)


class ReportBuilder:
    def __init__(self) -> None:
        self._elements: List[Any] = []

    def add_title(self, text: str, style_name: str = "ReportTitle") -> "ReportBuilder":
        self._elements.append(Text(text, style_name=style_name))
        self._elements.append(SpacerComponent(1, 12))
        return self

    def add_subtitle(self, text: str) -> "ReportBuilder":
        self._elements.append(Text(text, style_name="ReportSubtitle"))
        self._elements.append(SpacerComponent(1, 12))
        return self

    def add_spacer(self, height: float = 12) -> "ReportBuilder":
        self._elements.append(SpacerComponent(1, height))
        return self

    def add_table(
        self,
        headers: Optional[List[str]] = None,
        rows: Optional[List[List[Any]]] = None,
        column_widths: Optional[List[float]] = None,
        repeat_header: bool = False,
        raw_table_rows: Optional[List[List[Any]]] = None,
    ) -> "ReportBuilder":
        comp = TableComponent(
            headers=headers,
            rows=rows,
            column_widths=column_widths,
            repeat_header=repeat_header,
            raw_table_rows=raw_table_rows,
        )
        self._elements.append(comp)
        self._elements.append(SpacerComponent(1, 12))
        return self

    def add_section(self, *children: Any) -> "ReportBuilder":
        container = Container(children=list(children))
        self._elements.append(container)
        return self

    def build_elements(self) -> List[Any]:
        return list(self._elements)

    @staticmethod
    def from_context(data: dict) -> List[Any]:
        """Build the report structure from context: title + one TableComponent per table in sections."""
        builder = ReportBuilder()
        if data.get("title"):
            builder.add_title(data["title"])
        for section in data.get("sections", []):
            for table_rows in section.get("tables", []):
                if table_rows:
                    builder.add_table(raw_table_rows=table_rows)
        return builder.build_elements()
