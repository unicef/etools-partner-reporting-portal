from rest_framework.permissions import BasePermission


from core.models import (
    PartnerAuthorizedOfficerRole,
    PartnerEditorRole,
)


SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')


class CanChangePDCalculationMethod(BasePermission):
    """
    Partner authorized officer and editor are allowed to change PD calculation
    method in PRP.
    """

    def has_permission(self, request, view):
        user = request.user
        if user.is_authenticated() and request.method in SAFE_METHODS:
            return True

        return user.is_authenticated() and \
            user.groups.filter(
            name__in=[
                PartnerAuthorizedOfficerRole.as_group().name,
                PartnerEditorRole.as_group().name
            ]).exists()


class UnicefPartnershipManagerOrRead(BasePermission):
    """
    Partner authorized officer and editor are allowed to change PD calculation
    method in PRP.
    """

    def has_permission(self, request, view):
        user = request.user
        if user.is_authenticated() and request.method in SAFE_METHODS:
            return True

        return (user.is_authenticated() and user.is_superuser) or \
            (user.is_authenticated and hasattr(user, 'jwt_payload') and
             hasattr(user, 'jwt_payload') and "groups" in user.jwt_payload and
             "Partnership Manager" in user.jwt_payload['groups'])
