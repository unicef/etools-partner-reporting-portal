import logging
import os
import tempfile

from django.contrib.auth import get_user_model
from django.http import StreamingHttpResponse
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

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    temp_file_path = temp_file.name
    try:
        temp_file.write(result)
        temp_file.flush()
        temp_file.close()

        def file_iterator(file_path, chunk_size=8192):
            with open(file_path, 'rb') as file_obj:
                while True:
                    chunk = file_obj.read(chunk_size)
                    if not chunk:
                        break
                    yield chunk
            try:
                os.unlink(file_path)
            except OSError:
                pass

        response = StreamingHttpResponse(
            file_iterator(temp_file_path),
            content_type='application/pdf'
        )
        response['Content-Disposition'] = f'attachment; filename="{template}.pdf"'

        response['X-Accel-Buffering'] = 'no'
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'

        return response

    except Exception:
        try:
            if not temp_file.closed:
                temp_file.close()
            os.unlink(temp_file_path)
        except OSError:
            pass
        raise


def convert_string_values_to_numeric(d):
    r"""
    Convert numbers as strings into numeric
    "1500"->1500 "2,000.9"->2000.9  "2.5"->2.5
    :param d: dict
    """
    for k, v in d.items():
        if type(v) is str:
            d[k] = d[k].replace(',', '')
            d[k] = float(d[k]) if '.' in d[k] else int(d[k])


indicator_map = {
    "target": {"default": dict([('d', 1), ('v', 0)])},
    "baseline": {"default": dict([('d', 1), ('v', 0)])},
}


def sanitize_indicator(indicator_item):
    for field, default_dict in indicator_map.items():
        indicator_dict = indicator_item.get(field)

        # if the field value is not a dict, then update with the default values
        if not isinstance(indicator_dict, dict):

            # handle in_need field null=True, where the default is None so no need to update
            if indicator_dict is None and default_dict['default'] is None:
                continue
            else:
                indicator_item[field] = default_dict['default']
        else:
            # if there are missing keys in structure, update with default
            missing_keys = default_dict['default'].keys() - indicator_dict.keys()
            if missing_keys:
                for missing_key in missing_keys:
                    indicator_dict[missing_key] = default_dict['default'][missing_key]

            for key, value in indicator_dict.items():
                if value is None:
                    indicator_dict[key] = 0

                # if key is not in structure, remove it, else check for string value
                if key not in default_dict['default']:
                    del indicator_dict[key]

                elif isinstance(value, str):
                    try:
                        if value == 'None':
                            indicator_dict[key] = 0
                        else:
                            numeric = float(value.replace(',', '')) if '.' in value else int(
                                value.replace(',', ''))
                            indicator_dict[key] = numeric

                    except (ValueError, TypeError):
                        d = {"item": indicator_item["id"], "field": field, "key": key}
                        logger.warning(f'Could not cast value "{value}" to number. Requires manual handling. {d}')
                indicator_item[field] = indicator_dict
