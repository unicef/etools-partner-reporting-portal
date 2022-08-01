import { SWITCH_PORTAL } from "../actions";
export default function switchPortal(state = null, action) {
    switch (action.type) {
        case SWITCH_PORTAL:
            return action.portal;
        default:
            return state;
    }
}
