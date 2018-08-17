import {OTHER_AO} from "../actions";

export default function otherAo(state = false, action) {
    switch (action.type) {
        case OTHER_AO:
            return action.isPresent;
        default:
            return state;
    }
}