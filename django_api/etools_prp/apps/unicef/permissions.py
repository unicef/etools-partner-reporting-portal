from rest_framework.permissions import BasePermission

from etools_prp.apps.core.permissions import (
    IsPartnerAuthorizedOfficerForCurrentWorkspaceCheck,
    IsPartnerEditorForCurrentWorkspaceCheck,
)

SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')


class CanChangePDCalculationMethod(BasePermission):
    """
    Partner authorized officer and editor are allowed to change PD calculation
    method in PRP.
    """

    def has_permission(self, request, view):
        user = request.user
        if user.is_authenticated and request.method in SAFE_METHODS:
            return True

        partner_permission = (IsPartnerEditorForCurrentWorkspaceCheck(request) or
                              IsPartnerAuthorizedOfficerForCurrentWorkspaceCheck(request))

        return user.is_authenticated and partner_permission


class UnicefPartnershipManagerOrRead(BasePermission):
    """
    Partner authorized officer and editor are allowed to change PD calculation
    method in PRP.
    """

    def has_permission(self, request, view):
        user = request.user
        if user.is_authenticated and request.method in SAFE_METHODS:
            return True

        return (user.is_authenticated and user.is_superuser) or \
            (user.is_authenticated and hasattr(user, 'jwt_payload') and
             "groups" in user.jwt_payload and
             "Partnership Manager" in user.jwt_payload['groups'])
