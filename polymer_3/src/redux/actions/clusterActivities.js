import Constants from '../../constants';
const clusterActivitiesLoadingStart = function () {
    return {
        type: Constants.CLUSTER_ACTIVITIES_LOADING_START
    };
};
const clusterActivitiesLoadingStop = function () {
    return {
        type: Constants.CLUSTER_ACTIVITIES_LOADING_STOP
    };
};
export const setClusterActivitiesList = function (data) {
    return {
        type: Constants.SET_CLUSTER_ACTIVITIES_LIST,
        data: data
    };
};
const setClusterActivitiesCount = function (data) {
    return {
        type: Constants.SET_CLUSTER_ACTIVITIES_COUNT,
        count: data.count
    };
};
// App.Actions.ClusterActivities
export const fetchClusterActivitiesList = function (thunk) {
    return function (dispatch) {
        dispatch(clusterActivitiesLoadingStart());
        return thunk()
            .catch(function () {
            dispatch(clusterActivitiesLoadingStop());
        })
            .then(function (res) {
            dispatch(setClusterActivitiesList(res.data));
            dispatch(setClusterActivitiesCount(res.data));
            dispatch(clusterActivitiesLoadingStop());
        });
    };
};
const clusterActivitiesPartnersSetLoadingStart = function () {
    return {
        type: Constants.PARTNERS_BY_CLUSTER_ACTIVITY_ID_LOADING_START
    };
};
export const clusterActivitiesPartnersSet = function (clusterActivityId, data) {
    return {
        type: Constants.SET_PARTNERS_BY_CLUSTER_ACTIVITY_ID,
        clusterActivityId: clusterActivityId,
        data: data
    };
};
export const clusterActivitiesPartnersSetCount = function (clusterActivityId, count) {
    return {
        type: Constants.SET_PARTNERS_BY_CLUSTER_ACTIVITY_ID_COUNT,
        clusterActivityId: clusterActivityId,
        count: count
    };
};
const clusterActivitiesPartnersSetLoadingStop = function () {
    return {
        type: Constants.PARTNERS_BY_CLUSTER_ACTIVITY_ID_LOADING_STOP
    };
};
// App.Actions.ClusterActivities.partners
export const clusterActivitiesPartnersFetch = function (thunk, clusterId) {
    return function (dispatch) {
        dispatch(clusterActivitiesPartnersSetLoadingStart());
        return thunk()
            .then(function (res) {
            dispatch(clusterActivitiesPartnersSet(clusterId, res.data.results));
            dispatch(clusterActivitiesPartnersSetCount(clusterId, res.data.count));
            dispatch(clusterActivitiesPartnersSetLoadingStop());
        });
    };
};
const clusterActivitiesIndicatorsSetLoadingStart = function () {
    return {
        type: Constants.INDICATORS_BY_CLUSTER_ACTIVITY_ID_LOADING_START
    };
};
export const clusterActivitiesIndicatorsSetIndicators = function (clusterActivityId, data) {
    return {
        type: Constants.SET_INDICATORS_BY_CLUSTER_ACTIVITY_ID,
        clusterActivityId: clusterActivityId,
        data: data
    };
};
export const clusterActivitiesIndicatorsSetCount = function (clusterActivityId, count) {
    return {
        type: Constants.SET_INDICATORS_BY_CLUSTER_ACTIVITY_ID_COUNT,
        clusterActivityId: clusterActivityId,
        count: count
    };
};
const clusterActivitiesIndicatorsSetLoadingStop = function () {
    return {
        type: Constants.INDICATORS_BY_CLUSTER_ACTIVITY_ID_LOADING_STOP
    };
};
// App.Actions.ClusterActivities.indicators = {
export const clusterActivitiesIndicatorsFetch = function (thunk, clusterActivityId) {
    return function (dispatch) {
        dispatch(clusterActivitiesIndicatorsSetLoadingStart());
        return thunk()
            .then(function (res) {
            dispatch(clusterActivitiesIndicatorsSetIndicators(clusterActivityId, res.data.results));
            dispatch(clusterActivitiesIndicatorsSetCount(clusterActivityId, res.data.count));
            dispatch(clusterActivitiesIndicatorsSetLoadingStop());
        });
    };
};
