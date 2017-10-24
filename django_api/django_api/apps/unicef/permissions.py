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
