import { computePermissions } from "./permissions";
export function clusterOptions(state) {
    return Array.isArray(state.clusters) ? state.clusters.map(item => ({
        value: String(item.id),
        label: item.full_title
    })) : [];
}
export function clusterForPartnerOptions(state) {
    return Array.isArray(state.clustersForPartner) ? state.clustersForPartner.map(item => ({
        value: String(item.id),
        label: item.full_title
    })) : [];
}
export function portal(state) {
    return state.portal;
}
export function workspaceOptions(state) {
    return state.workspaces.map(item => ({ value: String(item.id), label: item.title }));
}
export function partnerOptions(state) {
    return Array.isArray(state.partners) ? state.partners.map(item => ({
        value: String(item.id),
        label: item.title
    })) : [];
}
export function user(state) {
    return state.user;
}
export function partnerTypeOptions(state) {
    return state.options.partner_type || [];
}
export function permissions(state) {
    return computePermissions(state);
}
