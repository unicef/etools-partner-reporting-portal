import {OTHER_AO} from "../actions";

export default function clusters(state = null, action) {
    switch (action.type) {
        case OTHER_AO:
            return action.isPresent;
        default:
            return state;
    }
}