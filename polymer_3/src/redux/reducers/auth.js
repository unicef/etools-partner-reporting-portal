import Constants from '../../etools-prp-common/constants';
export class AuthState {
    constructor() {
        this.token = '';
        this.accountType = '';
    }
}
const INITIAL_STATE = new AuthState();
export const Auth = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case Constants.SET_TOKEN:
            return Object.assign(Object.assign({}, state), { token: action.token });
        case Constants.RESET_TOKEN:
            return Object.assign(Object.assign({}, state), { token: '' });
        case Constants.SET_ACCOUNT_TYPE:
            return (function () {
                const isPartner = !!action.data.partner;
                return Object.assign(Object.assign({}, state), { accountType: isPartner ? Constants.ACCOUNT_TYPE_PARTNER : Constants.ACCOUNT_TYPE_CLUSTER });
            })();
        case Constants.RESET:
            return Object.assign(Object.assign({}, state), { accountType: '' });
        default:
            return state;
    }
};
