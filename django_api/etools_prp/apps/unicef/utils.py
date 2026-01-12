import logging
import tempfile

from django.contrib.auth import get_user_model
from django.http import FileResponse
from django.template.loader import render_to_string

from weasyprint import CSS, HTML
from weasyprint.text.fonts import FontConfiguration

logger = logging.getLogger(__name__)
User = get_user_model()
FIRST_NAME_MAX_LENGTH = User._meta.get_field('first_name').max_length
LAST_NAME_MAX_LENGTH = User._meta.get_field('last_name').max_length


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


def convert_string_values_to_numeric(d):
    """
    Convert numbers as strings into numeric
    "1500"->1500 "2,000.9"->2000.9  "2.5"->2.5
    :param d: dict
    """
    for k, v in d.items():
        if type(v) == str:
            d[k] = d[k].replace(',', '')
            d[k] = float(d[k]) if '.' in d[k] else int(d[k])
