from rest_framework.permissions import BasePermission

from .common import PRP_ROLE_TYPES


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


def IsForCurrentWorkspaceCheck(request):
    workspace_id = request.resolver_match.kwargs.get('workspace_id')
    if workspace_id:
        return request.user.workspaces.filter(id=workspace_id).exists()

    return False


def IsIMOForCurrentWorkspaceCheck(request):
    rules = [
        request.user.is_authenticated(),
        request.user.prp_roles.filter(role=PRP_ROLE_TYPES.imo_cluster).exists(),
        IsForCurrentWorkspaceCheck(request),
    ]
    return all(rules)


def IsPartnerAuthorizedOfficerForCurrentWorkspaceCheck(request):
    rules = [
        request.user.is_authenticated(),
        request.user.prp_roles.filter(role=PRP_ROLE_TYPES.ip_authorized_officer).exists(),
        IsForCurrentWorkspaceCheck(request),
    ]
    return all(rules)


def IsPartnerEditorForCurrentWorkspaceCheck(request):
    rules = [
        request.user.is_authenticated(),
        request.user.prp_roles.filter(role=PRP_ROLE_TYPES.ip_editor).exists(),
        IsForCurrentWorkspaceCheck(request),
    ]
    return all(rules)


def IsPartnerViewerForCurrentWorkspaceCheck(request):
    rules = [
        request.user.is_authenticated(),
        request.user.prp_roles.filter(role=PRP_ROLE_TYPES.ip_viewer).exists(),
        IsForCurrentWorkspaceCheck(request),
    ]
    return all(rules)


def IsPartnerAdminForCurrentWorkspaceCheck(request):
    rules = [
        request.user.is_authenticated(),
        request.user.prp_roles.filter(role=PRP_ROLE_TYPES.ip_admin).exists(),
        IsForCurrentWorkspaceCheck(request),
    ]
    return all(rules)


def IsClusterSystemAdminCheck(request):
    rules = [
        request.user.is_authenticated(),
        request.user.prp_roles.filter(role=PRP_ROLE_TYPES.cluster_system_admin).exists(),
    ]
    return all(rules)


def IsClusterViewerForCurrentWorkspaceCheck(request):
    rules = [
        request.user.is_authenticated(),
        request.user.prp_roles.filter(role=PRP_ROLE_TYPES.cluster_viewer).exists(),
        IsForCurrentWorkspaceCheck(request),
    ]
    return all(rules)


def IsClusterCoordinatorForCurrentWorkspaceCheck(request):
    rules = [
        request.user.is_authenticated(),
        request.user.prp_roles.filter(role=PRP_ROLE_TYPES.cluster_coordinator).exists(),
        IsForCurrentWorkspaceCheck(request),
    ]
    return all(rules)


def IsClusterMemberForCurrentWorkspaceCheck(request):
    rules = [
        request.user.is_authenticated(),
        request.user.prp_roles.filter(role=PRP_ROLE_TYPES.cluster_member).exists(),
        IsForCurrentWorkspaceCheck(request),
    ]
    return all(rules)


class IsPartnerAuthorizedOfficerForCurrentWorkspace(BasePermission):

    def has_permission(self, request, view):
        return IsPartnerAuthorizedOfficerForCurrentWorkspaceCheck(request)


class IsPartnerEditorForCurrentWorkspace(BasePermission):

    def has_permission(self, request, view):
        return IsPartnerEditorForCurrentWorkspaceCheck(request)


class IsPartnerViewerForCurrentWorkspace(BasePermission):

    def has_permission(self, request, view):
        return IsPartnerViewerForCurrentWorkspaceCheck(request)


class IsIMOForCurrentWorkspace(IsAuthenticated):

    def has_permission(self, request, view):
        return IsIMOForCurrentWorkspaceCheck(request)


class IsSuperuser(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated() and user.is_superuser
