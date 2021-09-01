import tempfile

from django.http import FileResponse
from django.template.loader import render_to_string

from weasyprint import CSS, HTML
from weasyprint.text.fonts import FontConfiguration


def render_pdf_to_response(request, template, data):
    font_config = FontConfiguration()
    html_string = render_to_string(f"{template}.html", data)
    html = HTML(string=html_string)
    css = CSS(
        string=render_to_string(f"{template}.css"),
        font_config=font_config,
    )
    result = html.write_pdf(stylesheets=[css], font_config=font_config)

    with tempfile.NamedTemporaryFile(delete=True) as output:
        output.write(result)
        output.flush()
        response = FileResponse(
            open(output.name, "rb"),
            as_attachment=True,
            filename=f"{template}.pdf",
        )

    return response
