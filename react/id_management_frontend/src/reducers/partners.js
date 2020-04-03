import {PARTNERS, APPEND_PARTNER} from "../actions";

export default function partners(state = [], action) {
    switch (action.type) {
        case PARTNERS:
            return action.data;
        case APPEND_PARTNER:
            return state.concat(action.data);
        default:
            return state;
    }
}