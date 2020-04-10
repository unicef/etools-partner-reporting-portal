import Constants from '../../constants';

export const locationSet = (locationId: string) => {
  return {
    type: Constants.SET_LOCATION,
    locationId: locationId
  };
};
