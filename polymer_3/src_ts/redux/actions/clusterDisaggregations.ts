import Constants from '../../constants';

const clusterDisaggregationsLoadingStart = function () {
  return {
    type: Constants.CLUSTER_DISAGGREGATIONS_LOADING_START
  };
};

const clusterDisaggregationsLoadingStop = function () {
  return {
    type: Constants.CLUSTER_DISAGGREGATIONS_LOADING_STOP
  };
};

const setClusterDisaggregationsList = function (data: any) {
  return {
    type: Constants.SET_CLUSTER_DISAGGREGATIONS_LIST,
    data: data
  };
};

const setClusterDisaggregationsCount = function (data: any) {
  return {
    type: Constants.SET_CLUSTER_DISAGGREGATIONS_COUNT,
    count: data.count
  };
};

// App.Actions.ClusterDisaggregations
export const fetchClusterDisaggregationsList = function (thunk: any) {
  return function (dispatch: any) {
    dispatch(clusterDisaggregationsLoadingStart());
    return thunk()
      .then(function (res: any) {
        dispatch(clusterDisaggregationsLoadingStop());
        dispatch(setClusterDisaggregationsList(res.data));
        dispatch(setClusterDisaggregationsCount(res.data));
      })
      .catch(function () {
        dispatch(clusterDisaggregationsLoadingStop());
      });
  };
};
