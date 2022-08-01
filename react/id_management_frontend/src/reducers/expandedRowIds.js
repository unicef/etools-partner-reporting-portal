import { EXPANDED_ROW_IDS } from "../actions";
export default function expandedRowIds(state = [], action) {
    switch (action.type) {
        case EXPANDED_ROW_IDS:
            return action.ids;
        default:
            return state;
    }
}
