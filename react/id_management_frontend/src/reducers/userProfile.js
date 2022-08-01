import { PORTALS, USER_PROFILE } from "../actions";
import { hasAnyRole } from "../helpers/user";
import { PORTAL_ACCESS } from "../constants";
export default function userProfile(state = null, action) {
    switch (action.type) {
        case USER_PROFILE:
            return Object.assign({}, action.user, {
                hasIpAccess: hasAnyRole(action.user, PORTAL_ACCESS[PORTALS.IP]),
                hasClusterAccess: hasAnyRole(action.user, PORTAL_ACCESS[PORTALS.CLUSTER])
            });
        default:
            return state;
    }
}
