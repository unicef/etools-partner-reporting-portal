import {PORTALS, SWITCH_PORTAL} from "../actions";

export default function switchPortal(state = PORTALS.IP, action) {
    switch (action.type) {
        case SWITCH_PORTAL:
            return action.portal;
        default:
            return state;
    }
}