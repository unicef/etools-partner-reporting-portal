import {PARTNERS} from "../actions";

export default function partners(state = null, action) {
    switch (action.type) {
        case PARTNERS:
            return action.data;
        default:
            return state;
    }
}