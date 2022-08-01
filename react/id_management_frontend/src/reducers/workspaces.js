import { WORKSPACES } from "../actions";
export default function workspaces(state = [], action) {
    switch (action.type) {
        case WORKSPACES:
            return action.data;
        default:
            return state;
    }
}
