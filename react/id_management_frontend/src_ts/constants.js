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
    [PRP_ROLE.IP_AUTHORIZED_OFFICER]: [PRP_ROLE.IP_ADMIN, PRP_ROLE.IP_VIEWER, PRP_ROLE.IP_EDITOR],
    [PRP_ROLE.CLUSTER_IMO]: [PRP_ROLE.CLUSTER_MEMBER, PRP_ROLE.CLUSTER_COORDINATOR, PRP_ROLE.CLUSTER_VIEWER],
    [PRP_ROLE.CLUSTER_MEMBER]: [PRP_ROLE.CLUSTER_MEMBER, PRP_ROLE.CLUSTER_VIEWER],
    [PRP_ROLE.CLUSTER_SYSTEM_ADMIN]: [
        PRP_ROLE.CLUSTER_MEMBER,
        PRP_ROLE.CLUSTER_COORDINATOR,
        PRP_ROLE.CLUSTER_VIEWER,
        PRP_ROLE.CLUSTER_IMO
    ]
};

export const USER_TYPE = {
    CLUSTER_ADMIN: "CLUSTER_ADMIN",
    IMO: "IMO",
    PARTNER: "PARTNER"
};

export const USER_TYPE_ROLES = {
    [USER_TYPE.CLUSTER_ADMIN]: [PRP_ROLE.CLUSTER_SYSTEM_ADMIN],
    [USER_TYPE.IMO]: [PRP_ROLE.CLUSTER_IMO],
    [USER_TYPE.PARTNER]: [
        PRP_ROLE.CLUSTER_VIEWER,
        PRP_ROLE.CLUSTER_MEMBER,
        PRP_ROLE.CLUSTER_COORDINATOR,
        PRP_ROLE.IP_VIEWER,
        PRP_ROLE.IP_EDITOR,
        PRP_ROLE.IP_AUTHORIZED_OFFICER,
        PRP_ROLE.IP_ADMIN
    ]
};

export const USER_TYPE_OPTIONS = [
    {
        label: "Cluster Admin",
        value: USER_TYPE.CLUSTER_ADMIN
    },
    {
        label: "IMO",
        value: USER_TYPE.IMO
    },
    {
        label: "Partner user",
        value: USER_TYPE.PARTNER
    }
];

export const EDITABLE_USER_TYPES = {
    "RESTRICTED": [USER_TYPE.PARTNER]
};

const editableOptions = (editable, options, additions) => {
    let _options = {};

    for (let prop in editable) {
        let _editable = additions ? editable[prop].concat(additions[prop] || []) : editable[prop];
        _options[prop] = options.filter(option => _editable.indexOf(option.value) > -1)
    }

    return _options;
};

export const EDITABLE_PRP_ROLE_OPTIONS = editableOptions(EDITABLE_PRP_ROLES, PRP_ROLE_OPTIONS, {
    [PRP_ROLE.IP_ADMIN]: [PRP_ROLE.IP_ADMIN]
});

export const EDITABLE_USER_TYPE_OPTIONS = editableOptions(EDITABLE_USER_TYPES, USER_TYPE_OPTIONS);

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

export const USER_STATUS = {
    ACTIVE: "ACTIVE",
    INVITED: "INVITED",
    INCOMPLETE: "INCOMPLETE"
};

export const USER_STATUS_OPTIONS = [
    {
        label: "Active",
        value: USER_STATUS.ACTIVE
    },
    {
        label: "Invited",
        value: USER_STATUS.INVITED
    },
    {
        label: "Inactive",
        value: USER_STATUS.INCOMPLETE
    }
];
