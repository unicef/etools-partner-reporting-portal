import Constants from '../../constants';

const loadingStart = function () {
  return {
    type: Constants.CLUSTER_DASHBOARD_DATA_LOADING_START
  };
};

const set = function (data: any) {
  return {
    type: Constants.SET_CLUSTER_DASHBOARD_DATA,
    data: data
  };
};

const loadingStop = function () {
  return {
    type: Constants.CLUSTER_DASHBOARD_DATA_LOADING_STOP
  };
};

// App.Actions.ClusterDashboardData
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
};
