export const PORTALS = {
    CLUSTER: 'cluster-reporting',
    IP: 'ip-reporting'
};

export const SWITCH_PORTAL = 'SWITCH_PORTAL';

export function switchPortal(portal) {
    return { type: SWITCH_PORTAL, portal }
}