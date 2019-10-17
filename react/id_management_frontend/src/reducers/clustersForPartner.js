import {CLUSTERS_FOR_PARTNER} from "../actions";

export default function clustersForPartner(state = null, action) {
    switch (action.type) {
        case CLUSTERS_FOR_PARTNER:
            return action.data;
        default:
            return state;
    }
}