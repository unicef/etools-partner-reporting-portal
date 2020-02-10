import Constants from '../../constants';

export class AuthState {
  token: string = '';
  acountType: string = '';
}

const INITIAL_STATE = new AuthState();

export const Auth = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case Constants.SET_TOKEN:
      return action.token;

    case Constants.RESET_TOKEN:
      return {
        ...state,
        token: ''
      };

    case Constants.SET_ACCOUNT_TYPE:
      return (function () {
        var isPartner = !!action.data.partner;

        return isPartner ?
          Constants.ACCOUNT_TYPE_PARTNER :
          Constants.ACCOUNT_TYPE_CLUSTER;
      }());

    case Constants.RESET:
      return {
        ...state,
        acountType: ''
      };;


    default:
      return state;
  }
}
