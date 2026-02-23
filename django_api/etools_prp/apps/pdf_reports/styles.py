from typing import Any, List, Tuple

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import TableStyle

PAGE_LANDSCAPE_A4 = landscape(A4)
DEFAULT_MARGIN_CM = 1.0
LANDSCAPE_AVAILABLE_WIDTH_CM = 29.7 - 2 * DEFAULT_MARGIN_CM


def register_fonts() -> None:
    pass


def register_custom_font(name: str, ttf_path: str) -> None:
    try:
        pdfmetrics.registerFont(TTFont(name, ttf_path))
    except Exception:
        pass


def get_paragraph_styles() -> getSampleStyleSheet:
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="ReportTitle",
            parent=styles["Heading1"],
            fontSize=16,
            spaceAfter=12,
        )
    )
    styles.add(
        ParagraphStyle(
            name="ReportSubtitle",
            parent=styles["Normal"],
            fontSize=10,
            textColor=colors.HexColor("#555555"),
            spaceAfter=16,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CellText",
            parent=styles["Normal"],
            fontSize=9,
            wordWrap="CJK",
        )
    )
    return styles


PARAGRAPH_STYLES = get_paragraph_styles()

SECTION_BG = colors.HexColor("#243943")
SUBSECTION_BG = colors.HexColor("#2498FA")
HEADER_BG = colors.HexColor("#d9d9d9")
ALT_ROW_BG = colors.HexColor("#f5f5f5")

BASE_TABLE_COMMANDS: List[Tuple[Any, ...]] = [
    ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
    ("FONTSIZE", (0, 0), (-1, -1), 9),
    ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]

BASE_TABLE_STYLE = TableStyle(BASE_TABLE_COMMANDS)


def table_style_with_overrides(
    overrides: List[Tuple[Any, ...]],
) -> TableStyle:
    if not overrides:
        return BASE_TABLE_STYLE
    return TableStyle(list(BASE_TABLE_COMMANDS) + overrides)


def section_cell_commands(start: Tuple[int, int], end: Tuple[int, int]) -> List[Tuple[Any, ...]]:
    return [
        ("BACKGROUND", start, end, SECTION_BG),
        ("TEXTCOLOR", start, end, colors.white),
        ("FONTNAME", start, end, "Helvetica-Bold"),
    ]


def subsection_cell_commands(start: Tuple[int, int], end: Tuple[int, int]) -> List[Tuple[Any, ...]]:
    return [
        ("BACKGROUND", start, end, SUBSECTION_BG),
        ("TEXTCOLOR", start, end, colors.white),
        ("FONTNAME", start, end, "Helvetica-Bold"),
    ]


def header_cell_commands(start: Tuple[int, int], end: Tuple[int, int]) -> List[Tuple[Any, ...]]:
    return [
        ("BACKGROUND", start, end, HEADER_BG),
        ("FONTNAME", start, end, "Helvetica-Bold"),
    ]


def alternating_row_commands(
    start_row: int,
    end_row: int,
    num_cols: int,
) -> List[Tuple[Any, ...]]:
    commands: List[Tuple[Any, ...]] = []
    for r in range(start_row, end_row + 1):
        if (r - start_row) % 2 == 1:
            commands.append(("BACKGROUND", (0, r), (num_cols - 1, r), ALT_ROW_BG))
    return commands
