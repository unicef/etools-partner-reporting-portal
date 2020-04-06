import Constants from '../../constants';

// Indicator Data
export const fetchIndicators = function (indicatorsThunk: any) {
  return function (dispatch: any) {
    dispatch(indicatorsLoadingStart());
    return indicatorsThunk()
      .catch(function () {
        dispatch(indicatorsLoadingStop());
      })
      .then(function (res: any) {
        dispatch(setIndicators(res.data));
        dispatch(indicatorsLoadingStop());
        dispatch(setIndicatorsCount(res.data));
      });
  };
}

export const setIndicators = function (indicatorsData: any) {
  return {
    type: Constants.SET_INDICATORS,
    indicatorsData: indicatorsData,
  };
}

export const indicatorsLoadingStart = function () {
  return {
    type: Constants.INDICATORS_LOADING_START,
  };
}

export const indicatorsLoadingStop = function () {
  return {
    type: Constants.INDICATORS_LOADING_STOP,
  };
}

export const setIndicatorsCount = function (indicators: any) {
  return {
    type: Constants.SET_INDICATORS_COUNT,
    count: indicators.count
  };
}

export const fetchIndicatorDetails = function (indicatorsThunk: any, id: string) {
  return function (dispatch: any) {
    dispatch(indicatorDetailsLoadingStart());
    return indicatorsThunk()
      .then(function (res: any) {
        let formattedById = {};
        formattedById[id] = res.data;
        dispatch(indicatorDetailsLoadingStop());
        dispatch(setIndicatorDetails(formattedById));
      })
      .catch(function () {
        dispatch(indicatorDetailsLoadingStop());
      });
  };
}

export const setIndicatorDetails = function (data: any) {
  return {
    type: Constants.SET_INDICATOR_DETAILS,
    details: data,
  };
}

// TODO: Make these reflect the specific indicator ID.
export const indicatorDetailsLoadingStart = function () {
  return {
    type: Constants.INDICATOR_DETAILS_LOADING_START,
  };
}

export const indicatorDetailsLoadingStop = function () {
  return {
    type: Constants.INDICATOR_DETAILS_LOADING_STOP,
  };
}
