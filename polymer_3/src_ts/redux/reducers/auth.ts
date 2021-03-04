import Constants from '../../constants';

export class AuthState {
  token = '';
  accountType = '';
}

const INITIAL_STATE = new AuthState();

export const Auth = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case Constants.SET_TOKEN:
      return {
        ...state,
        token: action.token
      };

    case Constants.RESET_TOKEN:
      return {
        ...state,
        token: ''
      };

    case Constants.SET_ACCOUNT_TYPE:
      return (function () {
        const isPartner = !!action.data.partner;

        return {
          ...state,
          accountType: isPartner ? Constants.ACCOUNT_TYPE_PARTNER : Constants.ACCOUNT_TYPE_CLUSTER
        };
      })();

    case Constants.RESET:
      return {
        ...state,
        accountType: ''
      };

    default:
      return state;
  }
};
