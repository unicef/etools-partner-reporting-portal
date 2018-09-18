import {CLUSTERS} from "../actions";

export default function clusters(state = null, action) {
    switch (action.type) {
        case CLUSTERS:
            return action.data;
        default:
            return state;
    }
}