import Constants from '../../constants';

const set = function (data: any) {
  return {
    type: Constants.SET_CLUSTER_INDICATOR_REPORTS,
    data: data
  };
};

const loadingStart = function () {
  return {
    type: Constants.CLUSTER_INDICATOR_REPORTS_LOADING_START
  };
};

const setCount = function (count: number) {
  return {
    type: Constants.SET_CLUSTER_INDICATOR_REPORTS_COUNT,
    count: count
  };
};

const loadingStop = function () {
  return {
    type: Constants.CLUSTER_INDICATOR_REPORTS_LOADING_STOP
  };
};

// Actions.ClusterIndicatorReports
export const clusterIndicatorReportsFetch = function (reportsThunk: any, reset?: boolean) {
  return function (dispatch: any) {
    if (reset) {
      dispatch(set([]));
    }

    dispatch(loadingStart());

    return reportsThunk()
      .then(function (res: any) {
        dispatch(set(res.data.results));
        dispatch(setCount(res.data.count));
        dispatch(loadingStop());
      })
      .catch(function (err: any) {
        dispatch(loadingStop());

        return Promise.reject(err);
      });
  };
};

export const clusterIndicatorReportsUpdateSingle = function (reportId: string, data: any) {
  return {
    type: Constants.UPDATE_CLUSTER_INDICATOR_REPORT,
    reportId: reportId,
    data: data
  };
};

export const clusterIndicatorReportsFetchSingle = function (reportThunk: any, reportId: any) {
  return function (dispatch: any) {
    return reportThunk().then(function (res: any) {
      dispatch(clusterIndicatorReportsUpdateSingle(reportId, res.data));
    });
  };
};

export const clusterIndicatorReportsSubmit = function (submitThunk: any) {
  return function (_dispatch: any) {
    return submitThunk();
  };
};

export const clusterIndicatorReportsUpdate = function (updateThunk: any, reportId: any) {
  return function (dispatch: any) {
    return updateThunk().then(function (res: any) {
      dispatch(clusterIndicatorReportsUpdateSingle(reportId, res.data));
    });
  };
};
