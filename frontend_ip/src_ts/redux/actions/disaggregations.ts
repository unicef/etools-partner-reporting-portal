import Constants from '../../etools-prp-common/constants';

export const disaggregationsSet = function (indicatorId: string, data: any) {
  return {
    type: Constants.SET_DISAGGREGATIONS,
    indicatorId: indicatorId,
    data: data
  };
};

export const disaggregationsUpdateIndicatorProgress = function (pdId: string, reportId: string, data: any) {
  return {
    type: Constants.UPDATE_PD_REPORT_INDICATOR_TOTAL,
    pdId: pdId,
    reportId: reportId,
    data: data
  };
};

// use instead of App.Actions.Disaggregations
export const disaggregationsFetch = function (disaggregationsThunk: any, indicatorId: string, pdId: string) {
  return function (dispatch: any) {
    return disaggregationsThunk.then(function (res: any) {
      const firstItem = res[0];

      dispatch(disaggregationsSet(indicatorId, firstItem));
      if (pdId) {
        dispatch(disaggregationsUpdateIndicatorProgress(pdId, indicatorId, firstItem.total));
      }
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
    return updateThunk.then(function (res: any) {
      dispatch(disaggregationsSetForLocation(indicatorId, locationId, res));

      dispatch(disaggregationsSetLocationProgress(indicatorId, locationId, res.disaggregation['()']));
    });
  };
};
