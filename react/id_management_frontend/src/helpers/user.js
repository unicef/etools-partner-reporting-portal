import {PRP_ROLE} from "../constants";

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

export function getMainPrpRole(prpRole) {
    if (prpRole[PRP_ROLE.IP_ADMIN]) return PRP_ROLE.IP_ADMIN;
    if (prpRole[PRP_ROLE.IP_AUTHORIZED_OFFICER]) return PRP_ROLE.IP_AUTHORIZED_OFFICER;
}

export function userRoleInWorkspace(user, workspace) {
    const roles = user.prp_roles.filter(role => role.workspace == workspace);

    return roles.length ? roles[0].role : null;
}