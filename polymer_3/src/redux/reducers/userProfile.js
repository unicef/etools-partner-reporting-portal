import Constants from '../../etools-prp-common/constants';
export class UserProfileState {
    constructor() {
        this.profile = undefined;
    }
}
export const UserProfile = (state = { profile: undefined }, action) => {
    switch (action.type) {
        case Constants.SET_USER_PROFILE:
            return {
                profile: action.data
            };
        case Constants.RESET:
            return {
                profile: undefined
            };
        default:
            return state;
    }
};
