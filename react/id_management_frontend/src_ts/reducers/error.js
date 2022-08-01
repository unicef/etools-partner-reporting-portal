import {ERROR} from "../actions";

export default function error(state = null, action) {
    switch (action.type) {
        case ERROR:
            return action.message;
        default:
            return state;
    }
}