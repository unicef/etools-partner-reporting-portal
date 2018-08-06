import {USER_PROFILE} from "../actions";

export default function switchPortal(state = null, action) {
    switch (action.type) {
        case USER_PROFILE:
            return action.user;
        default:
            return state;
    }
}