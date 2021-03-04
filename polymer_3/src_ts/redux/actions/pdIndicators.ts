import Constants from '../../constants';

export const pdIndicatorsLoading = function (pdId: string, loading: any) {
  return {
    type: Constants.SET_PD_INDICATORS_LOADING,
    pdId: pdId,
    loading: loading
  };
};

export const pdIndicatorsLoadingStart = function (pdId: string) {
  return pdIndicatorsLoading(pdId, true);
};

export const pdIndicatorsSet = function (pdId: string, indicatorData: any) {
  return {
    type: Constants.SET_PD_INDICATORS,
    pdId: pdId,
    indicatorData: indicatorData
  };
};

export const pdIndicatorsLoadingStop = function (pdId: string) {
  return pdIndicatorsLoading(pdId, false);
};

// use instead of     App.Actions.PDIndicators.
export const pdIndicatorsFetch = function (indicatorsThunk: any, pdId: string) {
  return function (dispatch: any) {
    dispatch(pdIndicatorsLoadingStart(pdId));

    return indicatorsThunk()
      .then(function (res: any) {
        dispatch(pdIndicatorsSet(pdId, res.data));
        dispatch(pdIndicatorsLoadingStop(pdId));
      })
      .catch(function (err: any) {
        dispatch(pdIndicatorsLoadingStop(pdId));

        return Promise.reject(err);
      });
  };
};

export const pdIndicatorsUpdate = function (updateThunk: any, pdId: string) {
  return function (dispatch: any) {
    dispatch(pdIndicatorsLoadingStart(pdId));

    return updateThunk()
      .then(function (res: any) {
        dispatch(pdIndicatorsSet(pdId, res.data));
        dispatch(pdIndicatorsLoadingStop(pdId));
      })
      .catch(function (err: any) {
        dispatch(pdIndicatorsLoadingStop(pdId));

        return Promise.reject(err);
      });
  };
};
