import Constants from '../../etools-prp-common/constants';
export const disaggregationsSet = function (indicatorId, data) {
    return {
        type: Constants.SET_DISAGGREGATIONS,
        indicatorId: indicatorId,
        data: data
    };
};
// use instead of App.Actions.Disaggregations
export const disaggregationsFetch = function (disaggregationsThunk, indicatorId) {
    return function (dispatch) {
        return disaggregationsThunk().then(function (res) {
            const firstItem = res.data[0];
            dispatch(disaggregationsSet(indicatorId, firstItem));
        });
    };
};
export const disaggregationsSetForLocation = function (indicatorId, locationId, data) {
    return {
        type: Constants.SET_DISAGGREGATIONS_FOR_LOCATION,
        indicatorId: indicatorId,
        locationId: locationId,
        data: data
    };
};
export const disaggregationsSetLocationProgress = function (indicatorId, locationId, value) {
    return {
        type: Constants.SET_PROGRESS_FOR_LOCATION,
        indicatorId: indicatorId,
        locationId: locationId,
        value: value
    };
};
export const disaggregationsUpdateForLocation = function (updateThunk, indicatorId, locationId) {
    return function (dispatch) {
        return updateThunk().then(function (res) {
            dispatch(disaggregationsSetForLocation(indicatorId, locationId, res.data));
            dispatch(disaggregationsSetLocationProgress(indicatorId, locationId, res.data.disaggregation['()']));
        });
    };
};
