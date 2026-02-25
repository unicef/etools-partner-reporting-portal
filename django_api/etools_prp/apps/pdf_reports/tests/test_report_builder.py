"""Unit tests for ReportBuilder."""
from unittest import TestCase

from etools_prp.apps.pdf_reports.components import Container, SpacerComponent, TableComponent, Text
from etools_prp.apps.pdf_reports.report_builder import ReportBuilder


class TestReportBuilderMethods(TestCase):
    """Test ReportBuilder fluent methods: add_title, add_table, add_section, build_elements."""

    def test_add_title(self):
        builder = ReportBuilder()
        result = builder.add_title("My Title")
        self.assertIs(result, builder)
        self.assertEqual(len(builder._elements), 2)  # Text + SpacerComponent
        self.assertIsInstance(builder._elements[0], Text)
        self.assertEqual(builder._elements[0].content, "My Title")
        self.assertEqual(builder._elements[0].style_name, "ReportTitle")
        self.assertIsInstance(builder._elements[1], SpacerComponent)

    def test_add_table_with_rows(self):
        builder = ReportBuilder()
        rows = [["H1", "H2"], ["a", "b"]]
        result = builder.add_table(rows=rows)
        self.assertIs(result, builder)
        self.assertEqual(len(builder._elements), 2)  # TableComponent + SpacerComponent
        self.assertIsInstance(builder._elements[0], TableComponent)
        self.assertEqual(builder._elements[0].rows, rows)
        self.assertEqual(builder._elements[0].headers, [])
        self.assertIsNone(builder._elements[0].raw_table_rows)

    def test_add_table_with_raw_rows(self):
        builder = ReportBuilder()
        raw = [["A", "B"], ["1", "2"]]
        result = builder.add_table(raw_table_rows=raw)
        self.assertIs(result, builder)
        self.assertIsInstance(builder._elements[0], TableComponent)
        self.assertEqual(builder._elements[0].raw_table_rows, raw)
        self.assertEqual(builder._elements[0].rows, [])

    def test_add_section(self):
        builder = ReportBuilder()
        child = Text("Section content")
        result = builder.add_section(child)
        self.assertIs(result, builder)
        self.assertEqual(len(builder._elements), 1)
        self.assertIsInstance(builder._elements[0], Container)
        self.assertEqual(len(builder._elements[0].children), 1)
        self.assertIs(builder._elements[0].children[0], child)

    def test_build_elements_returns_copy(self):
        builder = ReportBuilder()
        builder.add_title("T")
        first = builder.build_elements()
        second = builder.build_elements()
        # Two calls return equal but distinct lists
        self.assertEqual(first, second)
        self.assertIsNot(first, second)
        self.assertIsNot(first, builder._elements)
        # Mutating the returned list must not affect the builder
        first.append("mutate")
        self.assertEqual(len(builder.build_elements()), 2)
        self.assertEqual(len(second), 2)


class TestReportBuilderFromContext(TestCase):
    """Test ReportBuilder.from_context with different context shapes."""

    def test_from_context_empty_context_returns_empty(self):
        self.assertEqual(ReportBuilder.from_context({}), [])

    def test_from_context_without_title_has_no_text_element(self):
        """Tables without a title should not produce a title Text component."""
        data = {"tables": [[["H"], ["v"]]]}
        elements = ReportBuilder.from_context(data)
        self.assertFalse(any(isinstance(e, Text) for e in elements))
        self.assertEqual(len([e for e in elements if isinstance(e, TableComponent)]), 1)

    def test_from_context_with_title_and_tables(self):
        """Context with top-level 'title' and 'tables' (single progress report export)."""
        data = {
            "title": "Progress Summary",
            "tables": [
                [["Header A", "Header B"], ["Row1 A", "Row1 B"]],
                [["X", "Y"], ["1", "2"]],
            ],
        }
        elements = ReportBuilder.from_context(data)
        # Text, SpacerComponent, TableComponent, SpacerComponent, TableComponent, SpacerComponent
        self.assertEqual(len(elements), 6)
        self.assertEqual(elements[0].content, "Progress Summary")
        self.assertEqual(len([e for e in elements if isinstance(e, TableComponent)]), 2)

    def test_from_context_with_sections(self):
        """Context with 'sections' (list progress report export)."""
        data = {
            "title": "Multiple Reports",
            "sections": [
                {"tables": [[["H1", "H2"], ["a", "b"]]]},
                {"tables": [[["Col1"], ["x"]]]},
            ],
        }
        elements = ReportBuilder.from_context(data)
        self.assertEqual(len([e for e in elements if isinstance(e, TableComponent)]), 2)
        self.assertEqual(elements[0].content, "Multiple Reports")

    def test_from_context_ignores_empty_tables(self):
        """Empty table rows are skipped (not added as TableComponent)."""
        data = {
            "title": "Report",
            "tables": [[], [["A"], ["1"]]],
        }
        elements = ReportBuilder.from_context(data)
        self.assertEqual(len([e for e in elements if isinstance(e, TableComponent)]), 1)
        self.assertEqual(elements[0].content, "Report")
