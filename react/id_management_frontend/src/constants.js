import {PORTALS} from "./actions";

export const PRP_ROLE = {
    IP_AUTHORIZED_OFFICER: "IP_AUTHORIZED_OFFICER",
    IP_EDITOR: "IP_EDITOR",
    IP_VIEWER: "IP_VIEWER",
    IP_ADMIN: "IP_ADMIN",
    CLUSTER_IMO: "CLUSTER_IMO",
    CLUSTER_SYSTEM_ADMIN: "CLUSTER_SYSTEM_ADMIN",
    CLUSTER_VIEWER: "CLUSTER_VIEWER",
    CLUSTER_COORDINATOR: "CLUSTER_COORDINATOR",
    CLUSTER_MEMBER: "CLUSTER_MEMBER"
};

function getRoles(prefix) {
    return Object.values(PRP_ROLE).filter(role => role.startsWith(prefix));
}

const PRP_ROLES_IP = getRoles("IP");
const PRP_ROLES_CLUSTER = getRoles("CLUSTER");

export const PRP_ROLE_OPTIONS = [
    {
        value: "IP_AUTHORIZED_OFFICER",
        label: "IP Authorized officer"
    },
    {
        value: "IP_EDITOR",
        label: "IP Editor"
    },
    {
        value: "IP_VIEWER",
        label: "IP Viewer"
    },
    {
        value: "IP_ADMIN",
        label: "IP Admin"
    },
    {
        value: "CLUSTER_IMO",
        label: "Cluster IMO"
    },
    {
        value: "CLUSTER_SYSTEM_ADMIN",
        label: "Cluster System admin"
    },
    {
        value: "CLUSTER_VIEWER",
        label: "Cluster Viewer"
    },
    {
        value: "CLUSTER_COORDINATOR",
        label: "Cluster Coordinator"
    },
    {
        value: "CLUSTER_MEMBER",
        label: "Cluster Member"
    },
];

export const PRP_ROLE_IP_OPTIONS = PRP_ROLE_OPTIONS.filter(option => PRP_ROLES_IP.indexOf(option.value) > -1);
export const PRP_ROLE_CLUSTER_OPTIONS = PRP_ROLE_OPTIONS.filter(option => PRP_ROLES_CLUSTER.indexOf(option.value) > -1);

export const EDITABLE_PRP_ROLES = {
    [PRP_ROLE.IP_ADMIN]: [PRP_ROLE.IP_VIEWER, PRP_ROLE.IP_EDITOR],
    [PRP_ROLE.IP_AUTHORIZED_OFFICER]: [PRP_ROLE.IP_ADMIN],
    [PRP_ROLE.CLUSTER_IMO]: [PRP_ROLE.CLUSTER_MEMBER, PRP_ROLE.CLUSTER_COORDINATOR, PRP_ROLE.CLUSTER_VIEWER],
    [PRP_ROLE.CLUSTER_MEMBER]: [PRP_ROLE.CLUSTER_MEMBER, PRP_ROLE.CLUSTER_VIEWER],
    [PRP_ROLE.CLUSTER_SYSTEM_ADMIN]: [
        PRP_ROLE.CLUSTER_MEMBER,
        PRP_ROLE.CLUSTER_COORDINATOR,
        PRP_ROLE.CLUSTER_VIEWER,
        PRP_ROLE.CLUSTER_IMO
    ]
};

const getEditablePrpRoleOptions = () => {
    let options = {};

    for (let prop in EDITABLE_PRP_ROLES) {
        options[prop] = PRP_ROLE_OPTIONS.filter(option => EDITABLE_PRP_ROLES[prop].indexOf(option.value) > -1)
    }

    return options;
};

export const EDITABLE_PRP_ROLE_OPTIONS = getEditablePrpRoleOptions();

export const PORTAL_ACCESS = {
    [PORTALS.CLUSTER]: [
        PRP_ROLE.CLUSTER_IMO,
        PRP_ROLE.CLUSTER_MEMBER,
        PRP_ROLE.CLUSTER_SYSTEM_ADMIN
    ],
    [PORTALS.IP]: [
        PRP_ROLE.IP_ADMIN,
        PRP_ROLE.IP_AUTHORIZED_OFFICER
    ]
};

export const PORTAL_TYPE = {
    [PORTALS.CLUSTER]: "CLUSTER",
    [PORTALS.IP]: "IP"
};