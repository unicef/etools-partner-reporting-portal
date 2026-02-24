from abc import ABC, abstractmethod
from typing import Any, List, Optional, Sequence, Tuple, Union

from reportlab.platypus import Flowable, Paragraph, Spacer

from etools_prp.apps.pdf_reports.styles import PARAGRAPH_STYLES
from etools_prp.apps.pdf_reports.tables import create_platypus_table
from etools_prp.apps.pdf_reports.utils import safe_cell_text


class BaseComponent(ABC):
    @abstractmethod
    def render(self) -> List[Flowable]:
        pass


class Container(BaseComponent):
    def __init__(
        self,
        children: List[BaseComponent],
        padding: Optional[float] = None,
        background_color: Optional[Any] = None,
    ) -> None:
        self.children = children
        self.padding = padding
        self.background_color = background_color

    def render(self) -> List[Flowable]:
        result: List[Flowable] = []
        for child in self.children:
            result.extend(child.render())
        return result


class Text(BaseComponent):
    def __init__(
        self,
        content: str,
        style_name: str = "Normal",
        font_size: Optional[int] = None,
        bold: bool = False,
        alignment: int = 0,
    ) -> None:
        self.content = content
        self.style_name = style_name
        self.font_size = font_size
        self.bold = bold
        self.alignment = alignment

    def render(self) -> List[Flowable]:
        style = PARAGRAPH_STYLES[self.style_name]
        if self.font_size is not None or self.bold:
            from reportlab.lib.styles import ParagraphStyle
            style = ParagraphStyle(
                name=f"{style.name}_custom",
                parent=style,
                fontSize=self.font_size or style.fontSize,
                fontName="Helvetica-Bold" if self.bold else style.fontName,
                alignment=self.alignment,
            )
        return [Paragraph(self.content, style)]


class SpacerComponent(BaseComponent):
    def __init__(self, width: float = 1, height: float = 12) -> None:
        self.width = width
        self.height = height

    def render(self) -> List[Flowable]:
        return [Spacer(self.width, self.height)]


def _rows_and_overrides_from_cells(
    table_rows: List[List[Any]],
) -> Tuple[List[List[str]], List[Tuple[int, int, str, int, int]]]:
    if not table_rows:
        return [], []
    max_cols = max(len(row) for row in table_rows)
    rows: List[List[str]] = []
    overrides: List[Tuple[int, int, str, int, int]] = []
    for ri, row in enumerate(table_rows):
        row_data: List[str] = []
        for ci, cell in enumerate(row):
            text = safe_cell_text(cell)
            row_data.append(text)
            klass = getattr(cell, "klass", None)
            if klass:
                overrides.append((
                    ri,
                    ci,
                    klass,
                    getattr(cell, "colspan", 1) or 1,
                    getattr(cell, "rowspan", 1) or 1,
                ))
        while len(row_data) < max_cols:
            row_data.append("")
        rows.append(row_data)
    return rows, overrides


class TableComponent(BaseComponent):
    def __init__(
        self,
        headers: Optional[List[str]] = None,
        rows: Optional[List[List[Any]]] = None,
        column_widths: Optional[Sequence[Union[int, float]]] = None,
        repeat_header: bool = False,
        header_style: Optional[Any] = None,
        row_style: Optional[Any] = None,
        raw_table_rows: Optional[List[List[Any]]] = None,
    ) -> None:
        self.headers = headers or []
        self.rows = list(rows or [])
        self.column_widths = column_widths
        self.repeat_header = repeat_header
        self.header_style = header_style
        self.row_style = row_style
        self.raw_table_rows = raw_table_rows

    def render(self) -> List[Flowable]:
        if self.raw_table_rows is not None:
            string_rows, overrides = _rows_and_overrides_from_cells(self.raw_table_rows)
        else:
            all_rows = [self.headers] + self.rows if self.headers else self.rows
            if not all_rows:
                return []
            string_rows = [[str(c) for c in row] for row in all_rows]
            overrides = []
            if self.headers and self.header_style:
                overrides = [
                    (0, ci, "header", 1, 1)
                    for ci in range(len(self.headers))
                ]

        if not string_rows:
            return []

        repeat_rows = 1 if (self.repeat_header and (self.headers or self.raw_table_rows)) else 0
        tbl = create_platypus_table(
            string_rows,
            col_widths=self.column_widths,
            repeat_rows=repeat_rows,
            cell_style_overrides=overrides,
        )
        return [tbl]
