import logging
import time

from django.template.loader import render_to_string

from weasyprint import CSS, HTML
from weasyprint.text.fonts import FontConfiguration

from etools_prp.apps.unicef.exports.progress_reports import ProgressReportListPDFExporter

logger = logging.getLogger(__name__)


class PDFExporterService:

    def __init__(self):
        self.font_config = FontConfiguration()

    def generate_pdf_bytes(self, queryset):
        start_time = time.time()

        exporter = ProgressReportListPDFExporter(queryset)
        context = exporter.get_context()

        html_string = render_to_string(f"{exporter.template_name}.html", context)
        css = CSS(
            string=render_to_string(f"{exporter.template_name}.css"),
            font_config=self.font_config,
        )

        html = HTML(string=html_string)
        pdf_bytes = html.write_pdf(
            stylesheets=[css],
            font_config=self.font_config,
            optimize_size=('fonts',),
            presentational_hints=True,
        )

        generation_time = time.time() - start_time

        return pdf_bytes, generation_time
