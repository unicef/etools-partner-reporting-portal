import Constants from "../../constants";

//App.Actions.ClusterDashboardData
export const clusterDashboardDataFetch = function (dataThunk: any) {
  return function (dispatch: any) {
    dispatch(loadingStart());

    return dataThunk()
      .then(function (res: any) {
        dispatch(set(res.data));
        dispatch(loadingStop());
      })
      .catch(function () {
        dispatch(loadingStop());
      });
  };
}

const set = function (data: any) {
  return {
    type: Constants.SET_CLUSTER_DASHBOARD_DATA,
    data: data,
  };
}

const loadingStart = function () {
  return {
    type: Constants.CLUSTER_DASHBOARD_DATA_LOADING_START,
  };
}

const loadingStop = function () {
  return {
    type: Constants.CLUSTER_DASHBOARD_DATA_LOADING_STOP,
  };
}