from rest_framework.settings import api_settings
from rest_framework.views import exception_handler


def detailed_exception_handler(exc, context):

    response = exception_handler(exc, context)
    if isinstance(response.data, list):
        response.data = {
            api_settings.NON_FIELD_ERRORS_KEY: response.data
        }
    if hasattr(exc, 'get_codes'):
        response.data['error_codes'] = exc.get_codes()

    return response
