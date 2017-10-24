from rest_framework.permissions import BasePermission

from .models import (
    PartnerAuthorizedOfficerRole,
    PartnerEditorRole,
    PartnerViewerRole
)


class IsAuthenticated(BasePermission):
    """
    Allows access only to authenticated users.
    """

    def has_permission(self, request, view):
        # we can extend permissions verification in future!
        return request.user.is_authenticated()


class IsPartnerAuthorizedOfficer(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated() and \
            user.groups.filter(
            name=PartnerAuthorizedOfficerRole.as_group().name).exists()


class IsPartnerEditor(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated() and \
            user.groups.filter(
            name=PartnerEditorRole.as_group().name).exists()


class IsPartnerEditorOrPartnerAuthorizedOfficer(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated() and (
            user.groups.filter(
                name=PartnerEditorRole.as_group().name).exists() or
            user.groups.filter(
                name=PartnerAuthorizedOfficerRole.as_group().name).exists()
        )
