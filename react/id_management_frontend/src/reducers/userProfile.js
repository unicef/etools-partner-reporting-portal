import {USER_PROFILE} from "../actions";
import {getPrpRoleFlags} from "../helpers/user";

export default function switchPortal(state = null, action) {
    switch (action.type) {
        case USER_PROFILE:
            return Object.assign({}, action.user, {
                prpRole: getPrpRoleFlags(action.user)
            });
        default:
            return state;
    }
}