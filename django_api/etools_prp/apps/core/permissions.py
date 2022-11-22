from rest_framework.permissions import BasePermission, IsAuthenticated, SAFE_METHODS

from etools_prp.apps.unicef.models import ProgressReport

from .common import PRP_ROLE_TYPES

#######################################################
# Base permission classes to be extended
#######################################################


class HasConditionalPermission(IsAuthenticated):
    """ Add an additional condition for authenticated users """
    def condition_check(self, request):
        return False

    def has_permission(self, request, view):
        return super().has_permission(request, view) and self.condition_check(request)


class HasWorkspacePermission(HasConditionalPermission):
    """ Check that the view is associated to a workspace """
    workspace_field = 'workspace_id'

    def has_permission(self, request, view):
        self.workspace_id = request.resolver_match.kwargs.get(self.workspace_field)
        return super().has_permission(request, view) and self.workspace_id and self.condition_check(request)


class PermissionGetObjectMixin:
    """ Check that that exist an instance for a specific model """
    model = None
    pk_field = 'pk'

    def get_object(self, request):
        pk = request.resolver_match.kwargs.get(self.pk_field)
        try:
            return self.model.objects.get(pk=pk)
        except self.model.DoesNotExist:
            return None


#######################################################
# Generic classes
#######################################################


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


class HasAnyRole(HasConditionalPermission):
    def __init__(self, *roles):
        self.roles = roles

    def __call__(self, *args, **kwargs):
        return self

    def condition_check(self, request):
        return request.user.prp_roles.filter(realms__group__name__in=self.roles).exists()


class IsSafe(BasePermission):

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS


class IsSuperuser(HasConditionalPermission):

    def condition_check(self, request):
        return request.user.is_superuser


class IsUNICEFAPIUser(HasConditionalPermission):
    def condition_check(self, request):
        return request.user.is_unicef


#######################################################
# PRP classes
#######################################################

class IsPartnerAuthorizedOfficerForCurrentWorkspace(HasWorkspacePermission):

    def condition_check(self, request):
        return request.user.prp_roles.filter(
            name=PRP_ROLE_TYPES.ip_authorized_officer,
        ).exists()


class IsPartnerAdminForCurrentWorkspace(HasWorkspacePermission):

    def condition_check(self, request):
        return request.user.prp_roles.filter(
            name=PRP_ROLE_TYPES.ip_admin,
        ).exists()


class IsPartnerEditorForCurrentWorkspace(HasWorkspacePermission):

    def condition_check(self, request):
        return request.user.prp_roles.filter(
            name=PRP_ROLE_TYPES.ip_editor,
        ).exists()


class IsPartnerViewerForCurrentWorkspace(HasWorkspacePermission):

    def condition_check(self, request):
        return request.user.prp_roles.filter(
            name=PRP_ROLE_TYPES.ip_viewer,
        ).exists()


class IsIMOForCurrentWorkspace(HasWorkspacePermission):

    def condition_check(self, request):
        return request.user.prp_roles.filter(
            name=PRP_ROLE_TYPES.cluster_imo,
            realms__partner__clusters__response_plan__workspace__id=self.workspace_id,
        ).exists()


class IsClusterSystemAdmin(HasConditionalPermission):

    def condition_check(self, request):
        return request.user.prp_roles.filter(name=PRP_ROLE_TYPES.cluster_system_admin).exists()


class IsIMO(HasConditionalPermission):

    def condition_check(self, request):
        return request.user.prp_roles.filter(name=PRP_ROLE_TYPES.cluster_imo).exists()


class IsIPAuthorizedOfficer(HasConditionalPermission):

    def condition_check(self, request):
        return request.user.prp_roles.filter(name=PRP_ROLE_TYPES.ip_authorized_officer).exists()


class IsIPAdmin(HasConditionalPermission):

    def condition_check(self, request):
        return request.user.prp_roles.filter(name=PRP_ROLE_TYPES.ip_admin).exists()


class IsIPEditor(HasConditionalPermission):
    def condition_check(self, request):
        return request.user.prp_roles.filter(name=PRP_ROLE_TYPES.ip_editor).exists()


class IsIPViewer(HasConditionalPermission):

    def condition_check(self, request):
        return request.user.prp_roles.filter(name=PRP_ROLE_TYPES.ip_viewer).exists()


class HasPartnerAccessForProgressReport(HasConditionalPermission, PermissionGetObjectMixin):
    model = ProgressReport

    def condition_check(self, request):
        obj = self.get_object(request)
        return obj and obj.programme_document.partner == request.user.partner


class UnicefPartnershipManager(IsAuthenticated):
    """
    Partner authorized officer and editor are allowed to change PD calculation
    method in PRP.
    """

    def has_permission(self, request, view):

        jwt = getattr(request.user, 'jwt_payload', None)
        return hasattr(request.user, 'jwt_payload') and "groups" in jwt and "Partnership Manager" in jwt['groups']


def has_permission_for_clusters_check(request, cluster_ids, roles):
    if request.user.is_cluster_system_admin:
        return True

    cluster_ids = set(cluster_ids)
    cluster_role_count = request.user.old_prp_roles.filter(cluster__in=cluster_ids, role__in=roles).distinct().count()

    if cluster_role_count == len(cluster_ids):
        return True
    return False


# def IsClusterViewerForCurrentWorkspaceCheck(request):
#     workspace_id = request.resolver_match.kwargs.get('workspace_id')
#     if workspace_id:
#         rules = [
#             request.user.prp_roles.filter(
#                 role=PRP_ROLE_TYPES.cluster_viewer,
#                 cluster__response_plan__workspace__id=workspace_id,
#             ).exists(),
#         ]
#
#         return all(rules)
#
#     return False
#
#
# def IsClusterCoordinatorForCurrentWorkspaceCheck(request):
#     workspace_id = request.resolver_match.kwargs.get('workspace_id')
#     if workspace_id:
#         rules = [
#             request.user.prp_roles.filter(
#                 role=PRP_ROLE_TYPES.cluster_coordinator,
#                 cluster__response_plan__workspace__id=workspace_id,
#             ).exists(),
#         ]
#
#         return all(rules)
#
#     return False
#
#
# def IsClusterMemberForCurrentWorkspaceCheck(request):
#     workspace_id = request.resolver_match.kwargs.get('workspace_id')
#     if workspace_id:
#         rules = [
#             request.user.prp_roles.filter(
#                 role=PRP_ROLE_TYPES.cluster_member,
#                 cluster__response_plan__workspace__id=workspace_id,
#             ).exists(),
#         ]
#
#         return all(rules)
#
#     return False
