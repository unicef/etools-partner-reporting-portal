import Constants from '../../etools-prp-common/constants';
export const locationSet = (locationId) => {
    return {
        type: Constants.SET_LOCATION,
        locationId: locationId
    };
};
