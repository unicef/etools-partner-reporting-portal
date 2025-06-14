import Constants from '../../etools-prp-common/constants';

export class UserProfileState {
  profile: any = undefined;
}

export const UserProfile = (state = {profile: undefined}, action: any) => {
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
