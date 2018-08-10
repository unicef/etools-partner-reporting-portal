import {INVALIDATE_PARTNER_DETAILS, PARTNER_DETAILS} from "../actions";
import * as R from "ramda";

export default function partnerDetails(state = {}, action) {
    switch (action.type) {
        case PARTNER_DETAILS:
            return Object.assign({}, state, {
                [action.data.id]: action.data
            });
        case INVALIDATE_PARTNER_DETAILS:
            return R.dissoc(action.id, state);
        default:
            return state;
    }
}