from typing import List, Optional, Sequence, Tuple, Union

from reportlab.lib.units import cm
from reportlab.platypus import Table

from etools_prp.apps.pdf_reports.styles import (
    LANDSCAPE_AVAILABLE_WIDTH_CM,
    header_cell_commands,
    section_cell_commands,
    subsection_cell_commands,
    table_style_with_overrides,
)


def col_widths_equal(num_cols: int, total_width_cm: float = LANDSCAPE_AVAILABLE_WIDTH_CM) -> List[float]:
    width_cm = total_width_cm / num_cols
    return [width_cm * cm] * num_cols


def build_table_style_overrides(
    cell_styles: List[Tuple[int, int, str, int, int]],
) -> List[Tuple]:
    overrides: List[Tuple] = []
    for ri, ci, klass, colspan, rowspan in cell_styles:
        start = (ci, ri)
        end = (ci + colspan - 1, ri + rowspan - 1)
        if klass == "section":
            overrides.extend(section_cell_commands(start, end))
        elif klass == "subsection":
            overrides.extend(subsection_cell_commands(start, end))
        else:
            overrides.extend(header_cell_commands(start, end))
    return overrides


def create_platypus_table(
    rows: List[List[str]],
    col_widths: Optional[Sequence[Union[int, float]]] = None,
    repeat_rows: int = 0,
    cell_style_overrides: Optional[List[Tuple[int, int, str, int, int]]] = None,
) -> Table:
    if not rows:
        raise ValueError("rows must not be empty")
    num_cols = len(rows[0])
    if col_widths is None:
        col_widths = col_widths_equal(num_cols)
    tbl = Table(rows, colWidths=list(col_widths), repeatRows=repeat_rows)
    overrides = build_table_style_overrides(cell_style_overrides or [])
    tbl.setStyle(table_style_with_overrides(overrides))
    return tbl
