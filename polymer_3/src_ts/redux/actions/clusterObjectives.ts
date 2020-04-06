import Constants from "../../constants";

//App.Actions.ClusterObjectives
export const fetchClusterObjectivesList = function (thunk: any) {
  return function (dispatch: any) {
    dispatch(clusterObjectivesLoadingStart());
    return thunk()
      .catch(function () {
        dispatch(clusterObjectivesLoadingStart());
      })
      .then(function (res: any) {
        dispatch(setClusterObjectivesList(res.data));
        dispatch(setClusterObjectivesCount(res.data));
        dispatch(clusterObjectivesLoadingStop());
      });
  };
}

const setClusterObjectivesList = function (data: any) {
  return {
    type: Constants.SET_CLUSTER_OBJECTIVES_LIST,
    data: data,
  };
}

const clusterObjectivesLoadingStart = function () {
  return {
    type: Constants.CLUSTER_OBJECTIVES_LOADING_START,
  };
}

const clusterObjectivesLoadingStop = function () {
  return {
    type: Constants.CLUSTER_OBJECTIVES_LOADING_STOP,
  };
}

const setClusterObjectivesCount = function (data: any) {
  return {
    type: Constants.SET_CLUSTER_OBJECTIVES_COUNT,
    count: data.count
  };
}


//App.Actions.ClusterObjectives.indicators 
export const clusterObjectivesIndicatorsFetch = function (thunk: any, clusterObjectiveId: string) {
  return function (dispatch: any) {
    dispatch(setLoadingStart());
    return thunk()
      .then(function (res: any) {
        dispatch(setIndicators(
          clusterObjectiveId, res.data.results
        ));
        dispatch(setCount(
          clusterObjectiveId, res.data.count
        ));
        dispatch(setLoadingStop());
      });
  };
}

const setIndicators = function (clusterObjectiveId: string, data: any) {
  return {
    type: Constants.SET_INDICATORS_BY_CLUSTER_OBJECTIVE_ID,
    clusterObjectiveId: clusterObjectiveId,
    data: data,
  };
}

const setCount = function (clusterObjectiveId: string, count: any) {
  return {
    type: Constants.SET_INDICATORS_BY_CLUSTER_OBJECTIVE_ID_COUNT,
    clusterObjectiveId: clusterObjectiveId,
    count: count,
  };
}

const setLoadingStop = function () {
  return {
    type: Constants.INDICATORS_BY_CLUSTER_OBJECTIVE_ID_LOADING_STOP,
  };
}

const setLoadingStart = function () {
  return {
    type: Constants.INDICATORS_BY_CLUSTER_OBJECTIVE_ID_LOADING_START,
  };
}