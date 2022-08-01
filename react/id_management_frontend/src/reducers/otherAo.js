import { OTHER_AO } from "../actions";
export default function otherAo(state = [], action) {
    switch (action.type) {
        case OTHER_AO:
            return action.results;
        default:
            return state;
    }
}
