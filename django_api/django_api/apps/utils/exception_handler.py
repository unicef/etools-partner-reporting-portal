from rest_framework.settings import api_settings
from rest_framework.views import exception_handler


def _make_sure_values_are_lists(mapping):
    if not hasattr(mapping, 'items'):
        return mapping

    for key, val in mapping.items():
        if hasattr(val, 'items'):
            mapping[key] = _make_sure_values_are_lists(val)
        elif not isinstance(val, list):
            mapping[key] = [val]
    return mapping


def detailed_exception_handler(exc, context):

    response = exception_handler(exc, context)

    if response:
        if isinstance(response.data, list):
            response.data = {
                api_settings.NON_FIELD_ERRORS_KEY: response.data
            }
        elif hasattr(response.data, 'items'):
            response.data = _make_sure_values_are_lists(response.data)

        if hasattr(exc, 'get_codes'):
            response.data['error_codes'] = _make_sure_values_are_lists(exc.get_codes())

    return response
