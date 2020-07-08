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


def HasAnyRoleCheck(request, roles):
    return request.user.prp_roles.filter(role__in=roles).exists()


class HasAnyRole(BasePermission):
    def __init__(self, *roles):
        self.roles = roles

    def has_permission(self, request, view):
        return HasAnyRoleCheck(request, self.roles)

    def __call__(self, *args, **kwargs):
        return self


class IsAuthenticated(BasePermission):
    """
    Allows access only to authenticated users.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated


def IsIMOForCurrentWorkspaceCheck(request):
    workspace_id = request.resolver_match.kwargs.get('workspace_id')
    if workspace_id:
        rules = [
            request.user.is_authenticated,
            request.user.prp_roles.filter(
                role=PRP_ROLE_TYPES.cluster_imo,
                cluster__response_plan__workspace__id=workspace_id,
            ).exists(),
        ]

        return all(rules)

    return False


def IsIMOCheck(request):
    rules = [
        request.user.is_authenticated,
        request.user.prp_roles.filter(role=PRP_ROLE_TYPES.cluster_imo).exists(),
    ]
    return all(rules)


def IsPartnerAuthorizedOfficerForCurrentWorkspaceCheck(request):
    workspace_id = request.resolver_match.kwargs.get('workspace_id')
    if workspace_id:
        rules = [
            request.user.is_authenticated,
            request.user.prp_roles.filter(
                role=PRP_ROLE_TYPES.ip_authorized_officer,
                workspace__id=workspace_id,
                is_active=True
            ).exists(),
        ]

        return all(rules)

    return False


def IsPartnerEditorForCurrentWorkspaceCheck(request):
    workspace_id = request.resolver_match.kwargs.get('workspace_id')
    if workspace_id:
        rules = [
            request.user.is_authenticated,
            request.user.prp_roles.filter(
                role=PRP_ROLE_TYPES.ip_editor,
                workspace__id=workspace_id,
            ).exists(),
        ]

        return all(rules)

    return False


def IsPartnerViewerForCurrentWorkspaceCheck(request):
    workspace_id = request.resolver_match.kwargs.get('workspace_id')
    if workspace_id:
        rules = [
            request.user.is_authenticated,
            request.user.prp_roles.filter(
                role=PRP_ROLE_TYPES.ip_viewer,
                workspace__id=workspace_id,
            ).exists(),
        ]

        return all(rules)

    return False


def IsPartnerAdminForCurrentWorkspaceCheck(request):
    workspace_id = request.resolver_match.kwargs.get('workspace_id')
    if workspace_id:
        rules = [
            request.user.is_authenticated,
            request.user.prp_roles.filter(
                role=PRP_ROLE_TYPES.ip_admin,
                workspace__id=workspace_id,
            ).exists(),
        ]

        return all(rules)

    return False


def IsClusterSystemAdminCheck(request):
    rules = [
        request.user.is_authenticated,
        request.user.prp_roles.filter(role=PRP_ROLE_TYPES.cluster_system_admin).exists(),
    ]
    return all(rules)


def IsClusterViewerForCurrentWorkspaceCheck(request):
    workspace_id = request.resolver_match.kwargs.get('workspace_id')
    if workspace_id:
        rules = [
            request.user.is_authenticated,
            request.user.prp_roles.filter(
                role=PRP_ROLE_TYPES.cluster_viewer,
                cluster__response_plan__workspace__id=workspace_id,
            ).exists(),
        ]

        return all(rules)

    return False


def IsClusterCoordinatorForCurrentWorkspaceCheck(request):
    workspace_id = request.resolver_match.kwargs.get('workspace_id')
    if workspace_id:
        rules = [
            request.user.is_authenticated,
            request.user.prp_roles.filter(
                role=PRP_ROLE_TYPES.cluster_coordinator,
                cluster__response_plan__workspace__id=workspace_id,
            ).exists(),
        ]

        return all(rules)

    return False


def IsClusterMemberForCurrentWorkspaceCheck(request):
    workspace_id = request.resolver_match.kwargs.get('workspace_id')
    if workspace_id:
        rules = [
            request.user.is_authenticated,
            request.user.prp_roles.filter(
                role=PRP_ROLE_TYPES.cluster_member,
                cluster__response_plan__workspace__id=workspace_id,
            ).exists(),
        ]

        return all(rules)

    return False


def IsIPAuthorizedOfficerCheck(request):
    rules = [
        request.user.is_authenticated,
        request.user.prp_roles.filter(role=PRP_ROLE_TYPES.ip_authorized_officer, is_active=True).exists(),
    ]
    return all(rules)


def IsIPAdminCheck(request):
    rules = [
        request.user.is_authenticated,
        request.user.prp_roles.filter(role=PRP_ROLE_TYPES.ip_admin).exists(),
    ]
    return all(rules)


def IsIPEditorCheck(request):
    rules = [
        request.user.is_authenticated,
        request.user.prp_roles.filter(role=PRP_ROLE_TYPES.ip_editor).exists(),
    ]
    return all(rules)


def IsIPViewerCheck(request):
    rules = [
        request.user.is_authenticated,
        request.user.prp_roles.filter(role=PRP_ROLE_TYPES.ip_viewer).exists(),
    ]
    return all(rules)


def has_permission_for_clusters_check(request, cluster_ids, roles):
    if request.user.is_cluster_system_admin:
        return True

    cluster_ids = set(cluster_ids)
    cluster_role_count = request.user.prp_roles.filter(cluster__in=cluster_ids, role__in=roles).distinct().count()

    if cluster_role_count == len(cluster_ids):
        return True
    return False


class IsPartnerAuthorizedOfficerForCurrentWorkspace(BasePermission):

    def has_permission(self, request, view):
        return IsPartnerAuthorizedOfficerForCurrentWorkspaceCheck(request)


class IsPartnerAdminForCurrentWorkspace(BasePermission):

    def has_permission(self, request, view):
        return IsPartnerAdminForCurrentWorkspaceCheck(request)


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
        return user.is_authenticated and user.is_superuser


class IsClusterSystemAdmin(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated and IsClusterSystemAdminCheck(request)


class IsIMO(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated and IsIMOCheck(request)


class IsIPAuthorizedOfficer(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated and IsIPAuthorizedOfficerCheck(request)


class IsIPAdmin(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated and IsIPAdminCheck(request)


class IsIPEditor(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated and IsIPEditorCheck(request)


class IsIPViewer(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated and IsIPViewerCheck(request)


class IsUNICEFAPIUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_unicef


class IsStaffUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff
