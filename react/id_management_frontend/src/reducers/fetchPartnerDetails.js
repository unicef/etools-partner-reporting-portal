import {FETCH_PARTNER_DETAILS, INVALIDATE_PARTNER_DETAILS, partnerDetails} from "../actions";
import {api} from "../infrastructure/api";
import store from "../store";
import * as R from 'ramda';

export default function fetchPartnerDetails(state = {}, action) {
    switch (action.type) {
        case FETCH_PARTNER_DETAILS:
            if (state[action.id]) {
                return state;
            }

            return Object.assign({}, state, {
                [action.id]: api.get(`id-management/partners/${action.id}/`)
                    .then(res => {
                        store.dispatch(partnerDetails(res.data));
                    })
            });
        case INVALIDATE_PARTNER_DETAILS:
            return R.dissoc(action.id, state);
        default:
            return state;
    }
}