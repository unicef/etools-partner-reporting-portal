import { PARTNER_DETAILS } from "../actions";
export default function partnerDetails(state = {}, action) {
    switch (action.type) {
        case PARTNER_DETAILS:
            return Object.assign({}, state, {
                [action.data.id]: action.data
            });
        default:
            return state;
    }
}
