from datetime import date
from typing import Any, Union

from django.conf import settings

DATE_FORMAT = getattr(settings, "PRINT_DATA_FORMAT", "%d-%b-%Y")
MAX_CELL_CHARS = 2000


def cell_value_to_str(value: Any) -> str:
    if value is None or value == "":
        return ""
    if isinstance(value, date):
        return value.strftime(DATE_FORMAT)
    return str(value)


def safe_cell_text(cell: Any) -> str:
    value = getattr(cell, "value", cell)
    text = cell_value_to_str(value)
    if len(text) > MAX_CELL_CHARS:
        return text[:MAX_CELL_CHARS] + "..."
    return text


def normalize_table_rows(rows: list, fill: str = "") -> list:
    if not rows:
        return []
    max_cols = max(len(row) for row in rows)
    return [
        list(row) + [fill] * (max_cols - len(row))
        for row in rows
    ]
