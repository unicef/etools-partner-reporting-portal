import {USER_PROFILE} from "../actions";
import {getPrpRoleFlags, getMainPrpRole} from "../helpers/user";

export default function switchPortal(state = null, action) {
    switch (action.type) {
        case USER_PROFILE:
            const prpRole = getPrpRoleFlags(action.user);

            return Object.assign({}, action.user, {
                prpRole,
                mainPrpRole: getMainPrpRole(prpRole)
            });
        default:
            return state;
    }
}