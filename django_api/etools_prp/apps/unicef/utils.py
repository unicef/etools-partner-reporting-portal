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
        if type(v) is str:
            d[k] = d[k].replace(',', '')
            d[k] = float(d[k]) if '.' in d[k] else int(d[k])


indicator_map = {
    "target": {"default": dict([('d', 1), ('v', 0)])},
    "baseline": {"default": dict([('d', 1), ('v', 0)])},
    "in_need": {"default": None},
    "total": {"default": dict([('c', 0), ('d', 1), ('v', 0)])}
}


def sanitize_indicator(indicator_item):
    for field, default_dict in indicator_map.items():
        indicator_dict = getattr(indicator_item, field)

        # if the field value is not a dict, then update with the default values
        if not isinstance(indicator_dict, dict):

            # handle in_need field null=True, where the default is None so no need to update
            if indicator_dict is None and default_dict['default'] is None:
                continue
            else:
                logger.warning(f'Expected dict on {field} for {indicator_item}, '
                               f'found {type(indicator_dict)}, updating to default dict values {default_dict["default"]}')
                setattr(indicator_item, field, default_dict['default'])
        else:
            # if there are missing keys in structure, update with default
            missing_keys = default_dict['default'].keys() - indicator_dict.keys()
            if missing_keys:
                for missing_key in missing_keys:
                    logger.warning(f'Adding missing key {missing_key}, as default is {default_dict["default"]}')
                    indicator_dict[missing_key] = default_dict['default'][missing_key]

            for key, value in indicator_dict.items():
                if value is None:
                    indicator_dict[key] = 0

                # if key is not in structure, remove it, else check for string value
                if key not in default_dict['default']:
                    logger.warning(f'Extra key found in structure, removing {key}: {indicator_dict[key]}')
                    del indicator_dict[key]

                elif isinstance(value, str):
                    try:
                        if value == 'None':
                            indicator_dict[key] = 0

                        numeric = float(value.replace(',', '')) if '.' in value else int(
                            value.replace(',', ''))
                        logger.warning(f'String value found on {indicator_item}, field: {field}, {indicator_dict}. '
                                       f'Updating {key} value "{value}" to number {numeric}')
                        indicator_dict[key] = numeric

                    except (ValueError, TypeError):
                        d = {"item": indicator_item, "field": field, "key": key}
                        logger.warning(f'Could not cast value "{value}" to number. Requires manual handling. {d}')

                setattr(indicator_item, field, indicator_dict)
