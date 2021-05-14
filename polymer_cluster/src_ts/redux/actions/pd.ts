import Constants from '../../constants';

export const pdLoadingStart = function () {
  return {
    type: Constants.PROGRAMME_DOCUMENTS_LOADING_START
  };
};

// use instead of Actions.PD.set
export const pdSet = function (data: any) {
  return {
    type: Constants.SET_PROGRAMME_DOCUMENTS,
    data: data
  };
};

export const pdSetCount = function (count: number) {
  return {
    type: Constants.SET_PROGRAMME_DOCUMENTS_COUNT,
    count: count
  };
};

export const pdLoadingStop = function () {
  return {
    type: Constants.PROGRAMME_DOCUMENTS_LOADING_STOP
  };
};

// use instead of Actions.PD.fetch
export const pdFetch = function (pdThunk: any) {
  return function (dispatch: any) {
    dispatch(pdLoadingStart());

    return pdThunk()
      .then(function (res: any) {
        const pdData = res.data;

        dispatch(pdSet(pdData.results));
        dispatch(pdSetCount(pdData.count));
        dispatch(pdLoadingStop());
      })
      .catch(function (err: any) {
        dispatch(pdLoadingStop());

        // Return the original error to the caller
        return Promise.reject(err);
      });
  };
};

export const pdSetCurrent = function (pdId: number) {
  return {
    type: Constants.SET_CURRENT_PD,
    pdId: pdId
  };
};
