import store from "./store";
import { api } from "./infrastructure/api";
import { clusters, clustersForPartner, options, otherAo, partnerDetails, partners, userProfile, workspaces } from "./actions";
import { PRP_ROLE } from "./constants";
export const FETCH_OPTIONS = {
    CLUSTERS: "CLUSTERS",
    CLUSTERS_FOR_PARTNER: "CLUSTERS_FOR_PARTNER",
    PARTNERS: "PARTNERS",
    USER_PROFILE: "USER_PROFILE",
    WORKSPACES: "WORKSPACES",
    PARTNER_DETAILS: "PARTNER_DETAILS",
    PARTNERS_OPTIONS: "PARTNERS_OPTIONS",
    OTHER_AO: "OTHER_AO"
};
export function fetch(option, id) {
    return dispatch => {
        const state = store.getState();
        const promises = state.fetch.promises || {};
        if (id && !promises[option]) {
            promises[option] = {};
        }
        const _promise = id ? promises[option][id] : promises[option];
        if (_promise) {
            return;
        }
        let promise;
        switch (option) {
            case FETCH_OPTIONS.CLUSTERS:
                promise = api.get("id-management/assignable-clusters/")
                    .then(res => {
                    dispatch(clusters(res.data));
                });
                break;
            case FETCH_OPTIONS.CLUSTERS_FOR_PARTNER:
                promise = api.get(`id-management/partners/${id}/clusters/`)
                    .then(res => {
                    dispatch(clustersForPartner(res.data));
                });
                break;
            case FETCH_OPTIONS.PARTNERS:
                promise = api.get("id-management/assignable-partners/")
                    .then(res => {
                    dispatch(partners(res.data));
                });
                break;
            case FETCH_OPTIONS.USER_PROFILE:
                promise = api.get("account/user-profile/")
                    .then(res => {
                    dispatch(userProfile(res.data));
                });
                break;
            case FETCH_OPTIONS.WORKSPACES:
                promise = api.get("core/workspace/")
                    .then(res => {
                    dispatch(workspaces(res.data));
                });
                break;
            case FETCH_OPTIONS.PARTNER_DETAILS:
                promise = api.get(`id-management/partners/${id}/`)
                    .then(res => {
                    dispatch(partnerDetails(res.data));
                });
                break;
            case FETCH_OPTIONS.PARTNERS_OPTIONS:
                promise = api.options("id-management/partners/")
                    .then(res => {
                    dispatch(options(res.data, [
                        "shared_partner",
                        "partner_type",
                        "cso_type"
                    ]));
                });
                break;
            case FETCH_OPTIONS.OTHER_AO:
                promise = api.get("id-management/users/", {
                    roles: [PRP_ROLE.IP_AUTHORIZED_OFFICER],
                    page: 1,
                    page_size: 1000,
                    portal: "IP"
                })
                    .then(res => {
                    dispatch(otherAo(res.data.results));
                });
                break;
            default:
                throw new Error("Invalid fetch option, please see FETCH_OPTIONS in actions.js");
        }
        promise.finally(() => {
            dispatch(fetchFinished(option, id));
        });
        dispatch(fetchRequest(option, promise, id));
    };
}
export const FETCH_REQUEST = "FETCH_REQUEST";
export function fetchRequest(option, promise, id) {
    return { type: FETCH_REQUEST, option, promise, id };
}
export const FETCH_FINISHED = "FETCH_FINISHED";
export function fetchFinished(option, id) {
    return { type: FETCH_FINISHED, option, id };
}
export const FETCH_INVALIDATE = "FETCH_INVALIDATE";
export function fetchInvalidate(option, id) {
    return { type: FETCH_INVALIDATE, option, id };
}
