import Constants from '../../constants';

//App.Actions.ClusterActivities
export const fetchClusterActivitiesList = function (thunk: any) {
  return function (dispatch: any) {
    dispatch(clusterActivitiesLoadingStart());
    return thunk()
      .catch(function () {
        dispatch(clusterActivitiesLoadingStop());
      })
      .then(function (res: any) {
        dispatch(setClusterActivitiesList(res.data));
        dispatch(setClusterActivitiesCount(res.data));
        dispatch(clusterActivitiesLoadingStop());
      });
  };
}

export const setClusterActivitiesList = function (data: any) {
  return {
    type: Constants.SET_CLUSTER_ACTIVITIES_LIST,
    data: data,
  };
}

const clusterActivitiesLoadingStart = function () {
  return {
    type: Constants.CLUSTER_ACTIVITIES_LOADING_START,
  };
}

const clusterActivitiesLoadingStop = function () {
  return {
    type: Constants.CLUSTER_ACTIVITIES_LOADING_STOP,
  };
}

const setClusterActivitiesCount = function (data: any) {
  return {
    type: Constants.SET_CLUSTER_ACTIVITIES_COUNT,
    count: data.count
  };
}

//App.Actions.ClusterActivities.partners
export const clusterActivitiesPartnersFetch = function (thunk: any, clusterId: any) {
  return function (dispatch: any) {
    dispatch(clusterActivitiesPartnersSetLoadingStart());
    return thunk()
      .then(function (res: any) {
        dispatch(clusterActivitiesPartnersSet(
          clusterId, res.data.results
        ));
        dispatch(clusterActivitiesPartnersSetCount(
          clusterId, res.data.count
        ));
        dispatch(clusterActivitiesPartnersSetLoadingStop());
      });
  };
}

export const clusterActivitiesPartnersSet = function (clusterActivityId: any, data: any) {
  return {
    type: Constants.SET_PARTNERS_BY_CLUSTER_ACTIVITY_ID,
    clusterActivityId: clusterActivityId,
    data: data,
  };
}

export const clusterActivitiesPartnersSetCount = function (clusterActivityId: any, count: any) {
  return {
    type: Constants.SET_PARTNERS_BY_CLUSTER_ACTIVITY_ID_COUNT,
    clusterActivityId: clusterActivityId,
    count: count,
  };
}

const clusterActivitiesPartnersSetLoadingStop = function () {
  return {
    type: Constants.PARTNERS_BY_CLUSTER_ACTIVITY_ID_LOADING_STOP,
  };
}

const clusterActivitiesPartnersSetLoadingStart = function () {
  return {
    type: Constants.PARTNERS_BY_CLUSTER_ACTIVITY_ID_LOADING_START,
  };
}


//App.Actions.ClusterActivities.indicators = {
fetch = function (thunk, clusterActivityId) {
  return function (dispatch) {
    dispatch(App.Actions.ClusterActivities.indicators.setLoadingStart());
    return thunk()
      .then(function (res) {
        dispatch(App.Actions.ClusterActivities.indicators.setIndicators(
          clusterActivityId, res.data.results
        ));
        dispatch(App.Actions.ClusterActivities.indicators.setCount(
          clusterActivityId, res.data.count
        ));
        dispatch(App.Actions.ClusterActivities.indicators.setLoadingStop());
      });
  };
}

setIndicators = function (clusterActivityId, data) {
  return {
    type: Constants.SET_INDICATORS_BY_CLUSTER_ACTIVITY_ID,
    clusterActivityId: clusterActivityId,
    data: data,
  };
}

setCount = function (clusterActivityId, count) {
  return {
    type: Constants.SET_INDICATORS_BY_CLUSTER_ACTIVITY_ID_COUNT,
    clusterActivityId: clusterActivityId,
    count: count,
  };
}

setLoadingStop = function () {
  return {
    type: Constants.INDICATORS_BY_CLUSTER_ACTIVITY_ID_LOADING_STOP,
  };
}

setLoadingStart = function () {
  return {
    type: Constants.INDICATORS_BY_CLUSTER_ACTIVITY_ID_LOADING_START,
  };
}
