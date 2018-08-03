import {PRP_ROLE, PRP_ROLE_OPTIONS} from "../constants";
import {api} from "../infrastructure/api";

export function hasAnyRole(user, roles) {
    const filtered = user.prp_roles.filter(item => roles.indexOf(item.role) > -1);

    return filtered.length > 0;
}

const roleFlags = [PRP_ROLE.IP_ADMIN, PRP_ROLE.IP_AUTHORIZED_OFFICER];

export function getPrpRoleFlags(user) {
    let flags = {};

    roleFlags.forEach(flag => flags[flag] = hasAnyRole(user, [flag]));

    return flags;
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
    api.post("account/user-logout/").then(() => {window.location.href = "/";});
}

