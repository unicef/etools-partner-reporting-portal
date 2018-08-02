export const PORTALS = {
    CLUSTER: 'cluster-reporting',
    IP: 'ip-reporting'
};

export const SWITCH_PORTAL = 'SWITCH_PORTAL';

export function switchPortal(portal) {
    return {type: SWITCH_PORTAL, portal}
}

export const USER_PROFILE = 'USER_PROFILE';

export function userProfile(user) {
    return {type: USER_PROFILE, user}
}

export const EXPANDED_ROW_IDS = 'EXPANDED_ROW_IDS';

export function expandedRowIds(ids) {
    return {type: EXPANDED_ROW_IDS, ids}
}

export const WORKSPACES = 'WORKSPACES';

export function workspaces(data) {
    return {type: WORKSPACES, data};
}