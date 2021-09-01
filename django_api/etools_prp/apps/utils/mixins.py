from django.conf import settings
from django.contrib.auth import get_user_model

import jwt
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication

from etools_prp.apps.core.permissions import (
    AnyPermission,
    IsIMOForCurrentWorkspace,
    IsPartnerAdminForCurrentWorkspace,
    IsPartnerAuthorizedOfficerForCurrentWorkspace,
    IsPartnerEditorForCurrentWorkspace,
    IsPartnerViewerForCurrentWorkspace,
    IsUNICEFAPIUser,
)


class CustomJSONWebTokenAuthentication(JWTAuthentication):
    """
    Handles setting the tenant after a JWT successful authentication
    """

    def authenticate(self, request):

        def _get_validated_token(request):
            """basically override authenticate method but stop at checking token validity """
            header = self.get_header(request)
            if header is None:
                return None

            raw_token = self.get_raw_token(header)
            if raw_token is None:
                return None
            return self.get_validated_token(raw_token)

        try:
            user, jwt_value = super().authenticate(request)
        except TypeError:
            raise PermissionDenied(detail='No valid authentication provided')
        except AuthenticationFailed:
            # Try again
            if getattr(settings, 'JWT_ALLOW_NON_EXISTENT_USERS', False):
                try:
                    # try and see if the token is valid
                    payload = _get_validated_token(request)
                except (jwt.ExpiredSignatureError, jwt.DecodeError):
                    raise PermissionDenied(detail='Authentication Failed')
                else:
                    # signature is valid user does not exist... setting default authenticated user
                    user = get_user_model().objects.get(username=settings.DEFAULT_UNICEF_USER)
                    setattr(user, 'jwt_payload', payload)
                    # check if the original request was made by UNICEF user
                    if not payload['username'].endswith('@unicef.org'):
                        raise PermissionDenied('Requested by external user')
                    return user, payload

            else:
                raise PermissionDenied(detail='Authentication Failed')

        return user, jwt_value


class ListExportMixin:

    export_url_kwarg = 'export'
    exporters = {}

    def get_exporter_class(self):
        return self.exporters.get(self.request.query_params.get(self.export_url_kwarg))

    def get_permissions(self):
        if self.get_exporter_class():
            return (
                AnyPermission(
                    IsUNICEFAPIUser,
                    IsPartnerAuthorizedOfficerForCurrentWorkspace,
                    IsPartnerEditorForCurrentWorkspace,
                    IsPartnerViewerForCurrentWorkspace,
                    IsPartnerAdminForCurrentWorkspace,
                    IsIMOForCurrentWorkspace,
                ),
            )
        return super().get_permissions()

    def get(self, request, *args, **kwargs):
        exporter_class = self.get_exporter_class()
        if exporter_class:
            return exporter_class(
                self.filter_queryset(self.get_queryset()),
                request=request,
            ).get_as_response(request)

        return super().get(request, *args, **kwargs)


class ObjectExportMixin:

    export_url_kwarg = 'export'
    exporters = {}

    def get_exporter_class(self):
        return self.exporters.get(self.request.query_params.get(self.export_url_kwarg))

    def get_permissions(self):
        if self.get_exporter_class():
            return (
                AnyPermission(
                    IsUNICEFAPIUser,
                    IsPartnerAuthorizedOfficerForCurrentWorkspace,
                    IsPartnerEditorForCurrentWorkspace,
                    IsPartnerViewerForCurrentWorkspace,
                    IsPartnerAdminForCurrentWorkspace,
                    IsIMOForCurrentWorkspace,
                ),
            )
        return super().get_permissions()

    def get(self, request, *args, **kwargs):
        exporter_class = self.get_exporter_class()
        if exporter_class:
            return exporter_class(self.get_object()).get_as_response(request)

        return super().get(request, *args, **kwargs)
