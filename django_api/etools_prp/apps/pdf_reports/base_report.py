from io import BytesIO
from typing import List, Optional, Union

from django.http import HttpResponse, StreamingHttpResponse

from reportlab.lib.pagesizes import A4, landscape  # noqa: F401 - landscape used in __init__
from reportlab.lib.units import cm
from reportlab.platypus import BaseDocTemplate, Flowable, PageTemplate, SimpleDocTemplate

from etools_prp.apps.pdf_reports.components import BaseComponent
from etools_prp.apps.pdf_reports.styles import DEFAULT_MARGIN_CM, PAGE_LANDSCAPE_A4, register_fonts


class BaseReport:
    filename: str = "report.pdf"
    pagesize = PAGE_LANDSCAPE_A4
    left_margin_cm: float = DEFAULT_MARGIN_CM
    right_margin_cm: float = DEFAULT_MARGIN_CM
    top_margin_cm: float = DEFAULT_MARGIN_CM
    bottom_margin_cm: float = DEFAULT_MARGIN_CM
    landscape: bool = True
    logo_path: Optional[str] = None

    def __init__(
        self,
        filename: Optional[str] = None,
        pagesize=None,
        landscape: Optional[bool] = None,
        logo_path: Optional[str] = None,
    ) -> None:
        if filename is not None:
            self.filename = filename
        if pagesize is not None:
            self.pagesize = pagesize
        if landscape is not None:
            self.landscape = landscape
        if self.landscape and self.pagesize == A4:
            self.pagesize = landscape(A4)
        if logo_path is not None:
            self.logo_path = logo_path

    def register_fonts(self) -> None:
        register_fonts()

    def add_header_footer(self, canvas, doc) -> None:
        canvas.saveState()
        page_num = canvas.getPageNumber()
        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(
            doc.pagesize[0] - self.right_margin_cm * cm,
            self.bottom_margin_cm * cm / 2,
            f"Page {page_num}",
        )
        if self.logo_path:
            try:
                canvas.drawImage(
                    self.logo_path,
                    self.left_margin_cm * cm,
                    doc.pagesize[1] - self.top_margin_cm * cm - 0.5 * cm,
                    width=1.5 * cm,
                    height=0.5 * cm,
                    preserveAspectRatio=True,
                )
            except Exception:
                pass
        canvas.restoreState()

    def _flowables(self, elements: List[Union[Flowable, BaseComponent]]) -> List[Flowable]:
        result: List[Flowable] = []
        for el in elements:
            if isinstance(el, BaseComponent):
                result.extend(el.render())
            else:
                result.append(el)
        return result

    def build(self, elements: List[Union[Flowable, BaseComponent]]) -> bytes:
        self.register_fonts()
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=self.pagesize,
            leftMargin=self.left_margin_cm * cm,
            rightMargin=self.right_margin_cm * cm,
            topMargin=self.top_margin_cm * cm,
            bottomMargin=self.bottom_margin_cm * cm,
        )
        flowables = self._flowables(elements)
        doc.build(flowables, onFirstPage=self.add_header_footer, onLaterPages=self.add_header_footer)
        return buffer.getvalue()

    def build_response(
        self,
        elements: List[Union[Flowable, BaseComponent]],
        stream: bool = True,
    ) -> Union[HttpResponse, StreamingHttpResponse]:
        pdf_bytes = self.build(elements)
        if stream:
            def iterate():
                buf = BytesIO(pdf_bytes)
                while True:
                    chunk = buf.read(8192)
                    if not chunk:
                        break
                    yield chunk

            response = StreamingHttpResponse(iterate(), content_type="application/pdf")
        else:
            response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{self.filename}"'
        response["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response["Pragma"] = "no-cache"
        response["Expires"] = "0"
        if stream:
            response["X-Accel-Buffering"] = "no"
        return response
