import Constants from '../../constants';

export class UserProfileState {
  profile = {}
};

export const UserProfile = (state = {}, action: any) => {
  switch (action.type) {
    case Constants.SET_USER_PROFILE:
      return {
        profile: action.data
      };

    case Constants.RESET:
      return {
        profile: {}
      };

    default:
      return state;
  }
}
