from rest_framework.permissions import BasePermission

from .models import (
    PartnerAuthorizedOfficerRole,
    PartnerEditorRole,
    IMORole,
    PartnerViewerRole,
)


class AnyPermission(BasePermission):
    """
    Works like an OR clause between provided auth backends
    """

    def __init__(self, *permission_classes):
        self.permission_classes = permission_classes

    def has_permission(self, request, view):
        for permission_class in self.permission_classes:
            if permission_class().has_permission(request, view):
                return True
        return False

    # Bit hacky but is needed since passed permission_classes are called before before verified
    def __call__(self, *args, **kwargs):
        return self


class IsAuthenticated(BasePermission):
    """
    Allows access only to authenticated users.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated()


def IsIMOForCurrentWorkspaceCheck(request):
    rules = [
        IMORole.as_group().user_set.filter(pk=request.user.pk).exists()
    ]
    workspace_id = request.resolver_match.kwargs.get('workspace_id')
    if workspace_id:
        rules.append(
            request.user.workspaces.filter(id=workspace_id).exists()
        )
    return all(rules)


def IsPartnerAuthorizedOfficerCheck(request):
    rules = [
        request.user.is_authenticated(),
        PartnerAuthorizedOfficerRole.as_group().user_set.filter(pk=request.user.pk).exists(),
    ]
    return all(rules)


class IsPartnerAuthorizedOfficer(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated() and user.groups.filter(
            name=PartnerAuthorizedOfficerRole.as_group().name).exists()


class IsPartnerEditor(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated() and user.groups.filter(name=PartnerEditorRole.as_group().name).exists()


class IsPartnerViewer(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated() and user.groups.filter(name=PartnerViewerRole.as_group().name).exists()


class IsPartnerEditorOrPartnerAuthorizedOfficer(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated() and (
            user.groups.filter(name=PartnerEditorRole.as_group().name).exists() or
            user.groups.filter(name=PartnerAuthorizedOfficerRole.as_group().name).exists()
        )


class IsIMO(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated() and user.groups.filter(name=IMORole.as_group().name).exists()


class IsIMOForCurrentWorkspace(IsAuthenticated):

    def has_permission(self, request, view):
        if super(IsIMOForCurrentWorkspace, self).has_permission(request, view):
            return IsIMOForCurrentWorkspaceCheck(request)

        return False


class IsPartnerEditorOrPartnerAuthorizedOfficerOrIMOForCurrentWorkspace(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated() and (
            user.groups.filter(name=PartnerEditorRole.as_group().name).exists() or
            user.groups.filter(name=PartnerAuthorizedOfficerRole.as_group().name).exists() or
            IsIMOForCurrentWorkspaceCheck(request)
        )


class IsPartnerAuthorizedOfficerOrIMOForCurrentWorkspace(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated() and (
            IsPartnerAuthorizedOfficerCheck(request) or
            IsIMOForCurrentWorkspaceCheck(request)
        )


class IsSuperuser(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated() and user.is_superuser
