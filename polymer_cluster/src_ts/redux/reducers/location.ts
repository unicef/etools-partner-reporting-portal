import Constants from '../../constants';

export class LocationState {
  id = '';
}

const INITIAL_STATE = new LocationState();

export const Location = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case Constants.SET_LOCATION:
      return {
        id: action.locationId
      };

    case Constants.RESET:
      return new LocationState();

    default:
      return state;
  }
};
