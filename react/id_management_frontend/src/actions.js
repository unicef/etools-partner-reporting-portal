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

export const CLUSTERS = 'CLUSTERS';

export function clusters(data) {
    return {type: CLUSTERS, data};
}

export const CLUSTERS_FOR_PARTNER = 'CLUSTERS_FOR_PARTNER';

export function clustersForPartner(data) {
    return {type: CLUSTERS_FOR_PARTNER, data};
}

export const OPTIONS = 'OPTIONS';

export function options(data, fields) {
    return {type: OPTIONS, data, fields}
}

export const PARTNERS = 'PARTNERS';

export function partners(data) {
    return {type: PARTNERS, data};
}

export const APPEND_PARTNER = 'APPEND_PARTNER';

export function append_partner(data) {
    return {type: APPEND_PARTNER, data};
}

export const PARTNER_DETAILS = 'PARTNER_DETAILS';

export function partnerDetails(data) {
    return {type: PARTNER_DETAILS, data};
}

export const ERROR = 'ERROR';

export function error(message) {
    return {type: ERROR, message};
}

export const OTHER_AO = 'OTHER_AO';

export function otherAo(results) {
    return {type: OTHER_AO, results};
}