import {PARTNER_CLUSTERS} from "../actions";

export default function clustersForPartner(state = [], action) {
    switch (action.type) {
        case PARTNER_CLUSTERS:
            return action.data;
        default:
            return state;
    }
}