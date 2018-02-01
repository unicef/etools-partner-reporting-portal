import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.exceptions import PermissionDenied, AuthenticationFailed
from rest_framework_jwt.authentication import JSONWebTokenAuthentication, jwt_decode_handler


class CustomJSONWebTokenAuthentication(JSONWebTokenAuthentication):
    """
    Handles setting the tenant after a JWT successful authentication
    """
    def enforce_csrf(self, request):
        return

    def authenticate(self, request):

        jwt_value = self.get_jwt_value(request)
        if jwt_value is None:
            # no JWT token return to skip this authentication mechanism
            return None

        try:
            user, jwt_value = super(CustomJSONWebTokenAuthentication, self).authenticate(request)
        except TypeError:
            raise PermissionDenied(detail='No valid authentication provided')
        except AuthenticationFailed:
            # Try again
            if getattr(settings, 'JWT_ALLOW_NON_EXISTENT_USERS', False):
                try:
                    # try and see if the token is valid
                    payload = jwt_decode_handler(jwt_value)
                except (jwt.ExpiredSignature, jwt.DecodeError):
                    raise PermissionDenied(detail='Authentication Failed')
                else:
                    # signature is valid user does not exist... setting default authenticated user
                    user = get_user_model().objects.get(username=settings.DEFAULT_UNICEF_USER)
                    setattr(user, 'jwt_payload', payload)
            else:
                raise PermissionDenied(detail='Authentication Failed')

        return user, jwt_value


class ListExportMixin(object):

    export_url_kwarg = 'export'
    exporters = {}

    def get(self, request, *args, **kwargs):
        exporter_class = self.exporters.get(self.request.query_params.get(self.export_url_kwarg))
        if exporter_class:
            return exporter_class(
                self.filter_queryset(self.get_queryset())
            ).get_as_response()

        return super(ListExportMixin, self).get(request, *args, **kwargs)
