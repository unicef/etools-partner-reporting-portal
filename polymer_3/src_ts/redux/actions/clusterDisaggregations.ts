import Constants from "../../constants";

//App.Actions.ClusterDisaggregations
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
}

const setClusterDisaggregationsList = function (data: any) {
  return {
    type: Constants.SET_CLUSTER_DISAGGREGATIONS_LIST,
    data: data,
  };
}

const clusterDisaggregationsLoadingStart = function () {
  return {
    type: Constants.CLUSTER_DISAGGREGATIONS_LOADING_START,
  };
}

const clusterDisaggregationsLoadingStop = function () {
  return {
    type: Constants.CLUSTER_DISAGGREGATIONS_LOADING_STOP,
  };
}

const setClusterDisaggregationsCount = function (data: any) {
  return {
    type: Constants.SET_CLUSTER_DISAGGREGATIONS_COUNT,
    count: data.count
  };
}