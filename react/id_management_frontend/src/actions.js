export const PORTALS = {
    CLUSTER: 'CLUSTER',
    IP: 'IP'
};

export const SWITCH_PORTAL = 'SWITCH_PORTAL';

export function switchPortal(portal) {
    return { type: SWITCH_PORTAL, portal }
}