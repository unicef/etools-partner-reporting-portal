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