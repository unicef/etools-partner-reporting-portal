import Constants from '../../constants';

export const disaggregationsSet = function (indicatorId: string, data: any) {
  return {
    type: Constants.SET_DISAGGREGATIONS,
    indicatorId: indicatorId,
    data: data
  };
};

// use instead of App.Actions.Disaggregations
export const disaggregationsFetch = function (disaggregationsThunk: any, indicatorId: string) {
  return function (dispatch: any) {
    return disaggregationsThunk().then(function (res: any) {
      const firstItem = res.data[0];

      dispatch(disaggregationsSet(indicatorId, firstItem));
    });
  };
};

export const disaggregationsSetForLocation = function (indicatorId: string, locationId: string, data: any) {
  return {
    type: Constants.SET_DISAGGREGATIONS_FOR_LOCATION,
    indicatorId: indicatorId,
    locationId: locationId,
    data: data
  };
};

export const disaggregationsSetLocationProgress = function (indicatorId: string, locationId: string, value: any) {
  return {
    type: Constants.SET_PROGRESS_FOR_LOCATION,
    indicatorId: indicatorId,
    locationId: locationId,
    value: value
  };
};

export const disaggregationsUpdateForLocation = function (updateThunk: any, indicatorId: string, locationId: string) {
  return function (dispatch: any) {
    return updateThunk().then(function (res: any) {
      dispatch(disaggregationsSetForLocation(indicatorId, locationId, res.data));

      dispatch(disaggregationsSetLocationProgress(indicatorId, locationId, res.data.disaggregation['()']));
    });
  };
};
