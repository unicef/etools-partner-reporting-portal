import {PRP_ROLE, PRP_ROLE_OPTIONS} from "../constants";
import {api} from "../infrastructure/api";

export function hasAnyRole(user, roles) {
    const filtered = user.prp_roles.filter(item => roles.indexOf(item.role) > -1);

    return filtered.length > 0;
}

export function userRoleInWorkspace(user, workspace) {
    const roles = user.prp_roles.filter(role => role.workspace == workspace);

    return roles.length ? roles[0].role : null;
}

export function getRoleLabel(role) {
    return PRP_ROLE_OPTIONS.filter(option => option.value === role)[0].label;
}

export function getWorkspaceLabel(workspaceOptions, workspace) {
    return workspaceOptions.filter(option => option.value == workspace)[0].label;
}

export function logout() {
    api.post("account/user-logout/").then(() => {
        window.location.href = "/";
    });
}

export function userRoleInCluster(user, cluster) {
    const roles = user.prp_roles.filter(role => role.cluster == cluster || role.role === PRP_ROLE.CLUSTER_SYSTEM_ADMIN);

    return roles.length ? roles[0].role : null;
}

export function getUserRole(user, permission) {
    const userWorkspaceRole = permission.workspace && userRoleInWorkspace(user, permission.workspace.id);
    const userClusterRole = permission.cluster && userRoleInCluster(user, permission.cluster.id);
    return userClusterRole || userWorkspaceRole;
}